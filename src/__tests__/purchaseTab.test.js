/**
 * @jest-environment node
 */
const http = require('http');
const app = require('../../index');
const { db } = app;

let server;
let baseURL;

beforeAll(() => {
  server = app.listen(0);
  const { port } = server.address();
  baseURL = `http://127.0.0.1:${port}`;
});

afterAll(() => {
  server.close();
});

beforeEach(() => {
  db.users.clear();
  db.tabs.clear();
  db.listings.clear();
  db.audit.length = 0;
});

const postPurchase = (listingId, body) => {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request(
      `${baseURL}/tabs/${listingId}/purchase`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
        },
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          resolve({ status: res.statusCode, data: JSON.parse(raw || '{}') });
        });
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
};

describe('POST /tabs/:id/purchase', () => {
  test('returns 404 for non-existent listing', async () => {
    const res = await postPurchase('missing', { buyerId: 'b1' });
    expect(res.status).toBe(404);
    expect(res.data).toEqual({ error: 'Listing not found' });
  });

  test('returns 404 for inactive listing', async () => {
    db.listings.set('1', { tabId: 't1', sellerId: 's1', price: 10, active: false });
    const res = await postPurchase('1', { buyerId: 'b1' });
    expect(res.status).toBe(404);
    expect(res.data).toEqual({ error: 'Listing not found' });
  });

  test('returns 400 if buyer not found', async () => {
    db.users.set('seller', { balance: 100 });
    db.tabs.set('t1', 'seller');
    db.listings.set('1', { tabId: 't1', sellerId: 'seller', price: 10, active: true });
    const res = await postPurchase('1', { buyerId: 'missing' });
    expect(res.status).toBe(400);
    expect(res.data).toEqual({ error: 'Buyer or seller not found' });
  });

  test('returns 400 if seller not found', async () => {
    db.users.set('buyer', { balance: 100 });
    db.tabs.set('t1', 'seller');
    db.listings.set('1', { tabId: 't1', sellerId: 'seller', price: 10, active: true });
    const res = await postPurchase('1', { buyerId: 'buyer' });
    expect(res.status).toBe(400);
    expect(res.data).toEqual({ error: 'Buyer or seller not found' });
  });

  test('returns 400 when buyer is seller', async () => {
    db.users.set('user', { balance: 100 });
    db.tabs.set('t1', 'user');
    db.listings.set('1', { tabId: 't1', sellerId: 'user', price: 10, active: true });
    const res = await postPurchase('1', { buyerId: 'user' });
    expect(res.status).toBe(400);
    expect(res.data).toEqual({ error: 'Cannot purchase own tab' });
  });

  test('returns 400 when buyer already owns tab', async () => {
    db.users.set('buyer', { balance: 100 });
    db.users.set('seller', { balance: 0 });
    db.tabs.set('t1', 'buyer');
    db.listings.set('1', { tabId: 't1', sellerId: 'seller', price: 10, active: true });
    const res = await postPurchase('1', { buyerId: 'buyer' });
    expect(res.status).toBe(400);
    expect(res.data).toEqual({ error: 'Buyer already owns tab' });
  });

  test('returns 400 when buyer has insufficient funds', async () => {
    db.users.set('buyer', { balance: 5 });
    db.users.set('seller', { balance: 0 });
    db.tabs.set('t1', 'seller');
    db.listings.set('1', { tabId: 't1', sellerId: 'seller', price: 10, active: true });
    const res = await postPurchase('1', { buyerId: 'buyer' });
    expect(res.status).toBe(400);
    expect(res.data).toEqual({ error: 'Insufficient funds' });
  });

  test('successful purchase transfers funds, ownership, logs audit and deactivates listing', async () => {
    db.users.set('buyer', { balance: 50 });
    db.users.set('seller', { balance: 0 });
    db.tabs.set('t1', 'seller');
    db.listings.set('1', { tabId: 't1', sellerId: 'seller', price: 20, active: true });

    const res = await postPurchase('1', { buyerId: 'buyer' });

    expect(res.status).toBe(200);
    expect(res.data).toEqual({ success: true });
    expect(db.users.get('buyer').balance).toBe(30);
    expect(db.users.get('seller').balance).toBe(20);
    expect(db.tabs.get('t1')).toBe('buyer');
    expect(db.listings.get('1').active).toBe(false);
    expect(db.audit).toHaveLength(1);
    expect(db.audit[0]).toMatchObject({
      listingId: '1',
      tabId: 't1',
      sellerId: 'seller',
      buyerId: 'buyer',
      price: 20
    });
  });
});

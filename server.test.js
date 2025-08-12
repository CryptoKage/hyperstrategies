/**
 * @jest-environment node
 */

const request = require('supertest');
const { app, db } = require('./server');

describe('tab listings API', () => {
  let listingId;

  afterAll((done) => {
    db.close(done);
  });

  test('creates a listing', async () => {
    const res = await request(app)
      .post('/api/listings')
      .send({ tab_id: 'tab1', seller_id: 'seller1', price: 10, expires_at: null });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      tab_id: 'tab1',
      seller_id: 'seller1',
      price: 10,
      status: 'active'
    });
    expect(res.body.id).toBeDefined();
    listingId = res.body.id;
  });

  test('updates a listing', async () => {
    const res = await request(app)
      .put(`/api/listings/${listingId}`)
      .send({ price: 15 });
    expect(res.status).toBe(200);
    expect(res.body.price).toBe(15);
  });

  test('lists active listings', async () => {
    const res = await request(app).get('/api/listings');
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].id).toBe(listingId);
  });

  test('lists listings by seller', async () => {
    const res = await request(app).get('/api/listings/user/seller1');
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].id).toBe(listingId);
  });

  test('gets listing by id', async () => {
    const res = await request(app).get(`/api/listings/${listingId}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(listingId);
  });

  test('cancels a listing', async () => {
    const res = await request(app).post(`/api/listings/${listingId}/cancel`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('cancelled');
  });

  test('cancelled listing not in active listings', async () => {
    const res = await request(app).get('/api/listings');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

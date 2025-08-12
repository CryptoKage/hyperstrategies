const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.NODE_ENV === 'test'
  ? ':memory:'
  : path.join(__dirname, 'data.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS tab_listings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tab_id TEXT NOT NULL,
    seller_id TEXT NOT NULL,
    price REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME
  )`);
});

const app = express();
app.use(express.json());

app.post('/api/listings', (req, res) => {
  const { tab_id, seller_id, price, expires_at } = req.body;
  const sql = `INSERT INTO tab_listings (tab_id, seller_id, price, expires_at) VALUES (?, ?, ?, ?)`;
  db.run(sql, [tab_id, seller_id, price, expires_at], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    db.get('SELECT * FROM tab_listings WHERE id = ?', [this.lastID], (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(row);
    });
  });
});

app.put('/api/listings/:id', (req, res) => {
  const { price, expires_at, status } = req.body;
  const { id } = req.params;
  const sql = `UPDATE tab_listings SET price = COALESCE(?, price), expires_at = COALESCE(?, expires_at), status = COALESCE(?, status) WHERE id = ?`;
  db.run(sql, [price, expires_at, status, id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    db.get('SELECT * FROM tab_listings WHERE id = ?', [id], (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(row);
    });
  });
});

app.post('/api/listings/:id/cancel', (req, res) => {
  const { id } = req.params;
  db.run('UPDATE tab_listings SET status = ? WHERE id = ?', ['cancelled', id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    db.get('SELECT * FROM tab_listings WHERE id = ?', [id], (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(row);
    });
  });
});

app.get('/api/listings/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM tab_listings WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row);
  });
});

app.get('/api/listings', (req, res) => {
  db.all('SELECT * FROM tab_listings WHERE status = ?', ['active'], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/listings/user/:sellerId', (req, res) => {
  const { sellerId } = req.params;
  db.all('SELECT * FROM tab_listings WHERE seller_id = ?', [sellerId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

const PORT = process.env.PORT || 5000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = { app, db };

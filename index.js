// Simple Express server providing tab management endpoints
// This server uses in-memory storage so data resets on restart.

const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// In-memory stores for tabs and transfer logs
let nextId = 1;
const tabs = [];
const transferLogs = [];

// Helper to record a log entry
function logTransfer(id, action) {
  transferLogs.push({ id, action, timestamp: Date.now() });
}

// Existing marketplace endpoint used by the frontend
app.get('/api/tabs/marketplace', (req, res) => {
  res.json(tabs);
});

// Placeholder buy and sell endpoints so existing frontend calls don't fail
app.post('/api/tabs/:id/buy', (req, res) => {
  logTransfer(parseInt(req.params.id, 10), 'buy');
  res.json({ success: true });
});

app.post('/api/tabs/:id/sell', (req, res) => {
  logTransfer(parseInt(req.params.id, 10), 'sell');
  res.json({ success: true });
});

// --- New Routes ---------------------------------------------------------

// Mint a new tab and add it to inventory
app.post('/api/tabs/mint', (req, res) => {
  const { name, price } = req.body;
  if (!name || typeof price !== 'number') {
    return res.status(400).json({ error: 'Name and price are required.' });
  }
  const tab = { id: nextId++, name, price };
  tabs.push(tab);
  logTransfer(tab.id, 'mint');
  res.status(201).json(tab);
});

// Burn an existing tab by removing it from inventory
app.post('/api/tabs/:id/burn', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = tabs.findIndex(t => t.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Tab not found.' });
  }
  tabs.splice(index, 1);
  logTransfer(id, 'burn');
  res.json({ success: true });
});

// Retrieve the transfer log for all tabs
app.get('/api/tabs/logs', (req, res) => {
  res.json(transferLogs);
});

// Admin helpers to fetch inventory and aggregate stats
app.get('/api/admin/tabs/inventory', (req, res) => {
  res.json(tabs);
});

app.get('/api/admin/tabs/stats', (req, res) => {
  const totalMinted = transferLogs.filter(l => l.action === 'mint').length;
  const totalBurned = transferLogs.filter(l => l.action === 'burn').length;
  res.json({
    totalMinted,
    totalBurned,
    active: tabs.length
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});


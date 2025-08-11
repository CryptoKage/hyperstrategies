const express = require('express');
const app = express();
app.use(express.json());

// Simple in-memory data store
const db = {
  users: new Map(), // id -> { balance }
  tabs: new Map(), // tabId -> ownerId
  listings: new Map(), // listingId -> { tabId, sellerId, price, active }
  audit: [] // array of transaction logs
};

// Endpoint to purchase a tab from the marketplace
app.post('/tabs/:id/purchase', (req, res) => {
  const listingId = req.params.id;
  const { buyerId } = req.body;

  const listing = db.listings.get(listingId);
  if (!listing || !listing.active) {
    return res.status(404).json({ error: 'Listing not found' });
  }

  const buyer = db.users.get(buyerId);
  const seller = db.users.get(listing.sellerId);
  if (!buyer || !seller) {
    return res.status(400).json({ error: 'Buyer or seller not found' });
  }

  if (listing.sellerId === buyerId) {
    return res.status(400).json({ error: 'Cannot purchase own tab' });
  }

  if (buyer.balance < listing.price) {
    return res.status(400).json({ error: 'Insufficient funds' });
  }

  const currentOwner = db.tabs.get(listing.tabId);
  if (currentOwner === buyerId) {
    return res.status(400).json({ error: 'Buyer already owns tab' });
  }

  try {
    // Begin pseudo transaction
    buyer.balance -= listing.price;
    seller.balance += listing.price;
    db.tabs.set(listing.tabId, buyerId);
    listing.active = false;
    db.audit.push({
      listingId,
      tabId: listing.tabId,
      sellerId: listing.sellerId,
      buyerId,
      price: listing.price,
      timestamp: new Date().toISOString()
    });
    // End transaction
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Transaction failed' });
  }
});

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;

// ==============================================================================
// START: PASTE THIS ENTIRE BLOCK to replace your full PinsMarketplace.jsx FILE
// ==============================================================================
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/api';
import Layout from '../components/Layout';
import { PinImage } from '../components/UserPins'; // We'll reuse our PinImage component
import BuyPinModal from '../components/BuyPinModal';

const PinsMarketplace = () => {
  const { t } = useTranslation();

  const [listings, setListings] = useState([]);
  const [pinDefinitions, setPinDefinitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
    const [selectedListing, setSelectedListing] = useState(null);
  const [isBuying, setIsBuying] = useState(false);
  const [buyError, setBuyError] = useState('');
  const [myListings, setMyListings] = useState([]);
  const [isCancelling, setIsCancelling] = useState(null); 

  // --- State for Filtering & Sorting ---
  const [filter, setFilter] = useState('ALL'); // 'ALL' or a specific pin_name
  const [sort, setSort] = useState('created_at-DESC'); // e.g., 'price-ASC'

  const fetchMarketplaceData = useCallback(async () => {
    setLoading(true);
    try {
      // Build the query parameters for the API call
      const params = new URLSearchParams();
      const [sortBy, order] = sort.split('-');
      params.append('sortBy', sortBy);
      params.append('order', order);
      if (filter !== 'ALL') {
        params.append('filterByPinName', filter);
      }

      // Fetch all data in parallel
      const [listingsRes, pinDefsRes, myListingsRes] = await Promise.all([
  api.get(`/pins-marketplace/listings?${params.toString()}`),
  api.get('/pins/definitions'),
  api.get('/pins-marketplace/my-listings') // <-- The new call
]);

// Then, add this line to set the new state:
setMyListings(myListingsRes.data);

      setListings(listingsRes.data);
      setPinDefinitions(pinDefsRes.data);

    } catch (err) {
      console.error("Failed to fetch marketplace data:", err);
      setError("Could not load marketplace data at this time.");
    } finally {
      setLoading(false);
    }
  }, [filter, sort]);

  useEffect(() => {
    fetchMarketplaceData();
  }, [fetchMarketplaceData]);
  
  // --- TODO: Add handler logic for the "Buy" button ---
 const handleBuyPin = async () => {
    if (!selectedListing) return;
    setIsBuying(true);
    setBuyError('');
    try {
      await api.post(`/pins-marketplace/listings/${selectedListing.listing_id}/buy`);
      setSelectedListing(null); // Close the modal on success
      fetchMarketplaceData(); // Refresh the listings
    } catch (err) {
      setBuyError(err.response?.data?.error || "Purchase failed. The item may no longer be available.");
    } finally {
      setIsBuying(false);
    }
  };

const handleCancelListing = async (listingId) => {
  setIsCancelling(listingId);
  try {
    await api.delete(`/pins-marketplace/listings/${listingId}`);
    fetchMarketplaceData(); // Refresh all data on success
  } catch (err) {
    console.error("Failed to cancel listing:", err);
    alert("Could not cancel the listing. Please try again.");
  } finally {
    setIsCancelling(null);
  }
};

  const renderContent = () => {
    if (loading) { return <p>Loading listings...</p>; }
    if (error) { return <p className="error-message">{error}</p>; }
    if (listings.length === 0) {
      return <div className="empty-marketplace"><h3>No listings found.</h3><p>Check back later or list one of your own pins for sale!</p></div>;
    }

    return (
      <div className="market-grid">
        {listings.map(listing => (
          <div key={listing.listing_id} className="pin-listing-card">
            <PinImage pinName={listing.pin_name} imageFilename={listing.image_filename} />
            <div className="listing-details">
              <h4>{listing.pin_name}</h4>
              <p className="seller-info">Sold by: <span>{listing.seller_username}</span></p>
              <p className="listing-price">${parseFloat(listing.price).toFixed(2)}</p>
             <button 
  className="btn-primary" 
  onClick={() => setSelectedListing(listing)} // <-- This is the change
>
  Buy Now
</button>
            </div>
          </div>
        ))}
      </div>
    );
  };

return (
    <Layout>
      <div className="pins-market-container">
        <div className="market-header">
          <h1 className="market-title gradient-text">{t('pins_market.title')}</h1>
          <div className="market-controls">
            <div className="control-group">
              <label htmlFor="filter-pins">Filter by Pin:</label>
              <select id="filter-pins" value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="ALL">All Pins</option>
                {pinDefinitions.map(def => (
                  <option key={def.pin_name} value={def.pin_name}>{def.pin_name}</option>
                ))}
              </select>
            </div>
            <div className="control-group">
              <label htmlFor="sort-pins">Sort by:</label>
              <select id="sort-pins" value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="created_at-DESC">Newest First</option>
                <option value="price-ASC">Price: Low to High</option>
                <option value="price-DESC">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* --- THIS IS THE CORRECT PLACEMENT for "My Listings" --- */}
        {myListings.length > 0 && (
          <div className="my-listings-section">
            <h3>My Active Listings</h3>
            <div className="my-listings-grid">
              {myListings.map(listing => (
                <div key={listing.listing_id} className="my-listing-card">
                  <PinImage pinName={listing.pin_name} imageFilename={listing.image_filename} />
                  <div className="listing-info">
                    <strong>{listing.pin_name}</strong>
                    <span>${parseFloat(listing.price).toFixed(2)}</span>
                  </div>
                  <button 
                    className="btn-danger-small"
                    onClick={() => handleCancelListing(listing.listing_id)}
                    disabled={isCancelling === listing.listing_id}
                  >
                    {isCancelling === listing.listing_id ? '...' : 'Cancel'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* --- The main content is now only called ONCE --- */}
        {renderContent()}
      </div>

       <BuyPinModal 
        isOpen={!!selectedListing}
        onClose={() => { setSelectedListing(null); setBuyError(''); }}
        listing={selectedListing}
        onConfirm={handleBuyPin}
        isProcessing={isBuying}
        error={buyError}
      />
    </Layout>
  );
};

export default PinsMarketplace;
// ==============================================================================
// END OF FILE
// ==============================================================================

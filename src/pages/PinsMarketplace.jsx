// FILE: /src/pages/PinsMarketplace.jsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import api from '../api/api';
import Layout from '../components/Layout';

const PinsMarketplace = () => {
  const { t } = useTranslation();
  const [listedPins, setListedPins] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMarketplaceListings = async () => {
      try {
        // Updated API endpoint - this will need to be created on the backend later.
        const res = await api.get('/pins/marketplace-listings'); 
        setListedPins(res.data);
      } catch (err) {
        setError(t('pins_market.error_loading'));
      }
    };
    fetchMarketplaceListings();
  }, [t]);

  const handleBuyPin = async (listingId) => {
    try {
      // Updated API endpoint
      await api.post(`/pins/listings/${listingId}/buy`);
      // Refresh listings after successful purchase
      setListedPins(prev => prev.filter(pin => pin.listing_id !== listingId));
    } catch (err) {
      console.error('Buy Pin failed', err);
    }
  };

  return (
    <Layout>
      <div className="pins-market-container">
        <h2 className="market-title gradient-text">{t('pins_market.title')}</h2>
        {error && <p className="error-message">{error}</p>}
        <div className="market-grid">
          {listedPins.map(pin => (
            <motion.div
              key={pin.listing_id}
              className="pin-card" // Renamed class
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.03 }}
            >
              <img src={pin.image_url} alt={pin.name} className="pin-card-image" />
              <h3>{pin.name}</h3>
              <p className="price">${pin.price}</p>
              <div className="actions">
                <button className="btn-primary" onClick={() => handleBuyPin(pin.listing_id)}>{t('pins_market.buy')}</button>
              </div>
            </motion.div>
          ))}
          {listedPins.length === 0 && !error && (
            <p className="empty-message">{t('pins_market.empty')}</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default PinsMarketplace;

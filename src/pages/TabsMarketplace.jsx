// src/pages/TabsMarketplace.jsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import api from '../api/api';
import Layout from '../components/Layout';

const TabsMarketplace = () => {
  const { t } = useTranslation();
  const [tabs, setTabs] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTabs = async () => {
      try {
        const res = await api.get('/tabs/marketplace');
        setTabs(res.data);
      } catch (err) {
        setError(t('tabs_market.error_loading'));
      }
    };
    fetchTabs();
  }, [t]);

  const handleBuy = async (id) => {
    try {
      await api.post(`/tabs/${id}/buy`);
      // refresh listings
      setTabs(prev => prev.filter(tab => tab.id !== id));
    } catch (err) {
      console.error('Buy failed', err);
    }
  };

  const handleSell = async (id) => {
    try {
      await api.post(`/tabs/${id}/sell`);
    } catch (err) {
      console.error('Sell failed', err);
    }
  };

  return (
    <Layout>
      <div className="tabs-market">
        <h2 className="market-title gradient-text">{t('tabs_market.title')}</h2>
        {error && <p className="error-message">{error}</p>}
        <div className="market-grid">
          {tabs.map(tab => (
            <motion.div
              key={tab.id}
              className="tab-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.03, rotateY: 5 }}
            >
              <h3>{tab.name}</h3>
              <p className="price">${tab.price}</p>
              <div className="actions">
                <button className="btn-primary" onClick={() => handleBuy(tab.id)}>{t('tabs_market.buy')}</button>
                <button className="btn-secondary" onClick={() => handleSell(tab.id)}>{t('tabs_market.sell')}</button>
              </div>
            </motion.div>
          ))}
          {tabs.length === 0 && !error && (
            <p className="empty-message">{t('tabs_market.empty')}</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TabsMarketplace;

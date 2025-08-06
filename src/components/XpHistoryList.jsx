import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/api';

const XpHistoryList = () => {
  const { t } = useTranslation();
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchXpHistory = async () => {
      try {
        const response = await api.get('/user/xp-history');
        setHistory(response.data);
      } catch (err) {
        console.error("Failed to fetch XP history:", err);
        setError('Could not load your XP history at this time.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchXpHistory();
  }, []);

  const renderContent = () => {
    if (isLoading) {
      return <p>{t('profile_page.history_loading')}</p>;
    }
    if (error) {
      return <p className="error-message">{error}</p>;
    }
    if (history.length === 0) {
      return <p>{t('profile_page.history_empty')}</p>;
    }
    return (
      <ul className="xp-history-list">
        {history.map((item) => (
          <li key={item.activity_id} className="history-item">
            <div className="history-item-main">
              <span className="history-description">{item.description}</span>
              <span className="history-xp stat-pnl-positive">
                +{parseFloat(item.amount_primary).toFixed(2)} XP
              </span>
            </div>
            <span className="history-date">
              {new Date(item.created_at).toLocaleString(undefined, { 
                dateStyle: 'medium', 
                timeStyle: 'short' 
              })}
            </span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="xp-history-container">
      <h3>{t('profile_page.history_title')}</h3>
      {renderContent()}
    </div>
  );
};

export default XpHistoryList;
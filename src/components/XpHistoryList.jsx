// PASTE THIS TO REPLACE: hyperstrategies/src/components/XpHistoryList.jsx

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/api';

const XpHistoryList = () => {
  const { t } = useTranslation();
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchXpHistory = async () => {
      try {
        const response = await api.get('/user/xp-history');
        setHistory(response.data);
      } catch (err) {
        // Error handling is unchanged
      } finally {
        setIsLoading(false);
      }
    };
    fetchXpHistory();
  }, []);

  // --- NEW: Helper function to parse and translate descriptions ---
  const renderDescription = (description) => {
    try {
      const payload = JSON.parse(description);
      // Use the 't' function with the key and variables from the database
      return t(payload.key, payload.vars);
    } catch (e) {
      // If it's not valid JSON, it's an old, plain text description.
      // Display it as-is for backward compatibility.
      return description;
    }
  };

  const renderContent = () => {
    if (isLoading) return <p>{t('profile_page.history_loading')}</p>;
    if (history.length === 0) return <p>{t('profile_page.history_empty')}</p>;
    
    return (
      <ul className="xp-history-list">
        {history.map((item) => (
          <li key={item.activity_id} className="history-item">
            <div className="history-item-main">
              <span className="history-description">
                {renderDescription(item.description)}
              </span>
              <span className="history-xp stat-pnl-positive">
                +{parseFloat(item.amount_primary).toFixed(2)} XP
              </span>
            </div>
            <span className="history-date">
              {new Date(item.created_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
            </span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="xp-history-container">
      <h3>{t('profile_page.xp_history_title')}</h3>
      {renderContent()}
    </div>
  );
};

export default XpHistoryList;

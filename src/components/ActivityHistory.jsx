import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/api';

const ActivityHistory = () => {
  const { t } = useTranslation();
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get('/user/activity-log');
        setActivities(response.data);
      } catch (err) {
        console.error("Failed to fetch activity history:", err);
        setError('Could not load your activity history at this time.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (isLoading) {
    return <p>Loading activity history...</p>;
  }
  if (error) {
    return <p className="error-message">{error}</p>;
  }
  if (activities.length === 0) {
    return <p>You have no account activity yet.</p>;
  }

  return (
    <div className="table-responsive">
      <table className="history-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Description</th>
            <th style={{ textAlign: 'right' }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {activities.map((item) => (
            <tr key={item.activity_id}>
              <td>{new Date(item.created_at).toLocaleString()}</td>
              <td>
                <span className={`status-badge status-${item.status.toLowerCase()}`}>
                  {item.activity_type.replace(/_/g, ' ')}
                </span>
              </td>
              <td>{item.description}</td>
              <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                {item.amount_primary} {item.symbol_primary}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ActivityHistory;

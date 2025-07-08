// src/components/WithdrawalHistory.jsx

import React, { useState, useEffect } from 'react';
import api from '../api/api';

const WithdrawalHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get('/withdraw/history');
        setHistory(response.data);
      } catch (err) {
        setError('Could not load withdrawal history.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'sent':
      case 'complete':
        return 'status-sent';
      case 'processing':
        return 'status-processing';
      case 'queued':
        return 'status-queued';
      case 'failed':
        return 'status-failed';
      default:
        return '';
    }
  };
  
  const formatAddress = (address) => `${address.slice(0, 6)}...${address.slice(-4)}`;

  if (loading) return <p>Loading history...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="history-container">
      <h2>Withdrawal History</h2>
      {history.length === 0 ? (
        <p>You have no withdrawal history.</p>
      ) : (
        <table className="history-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Amount</th>
              <th>Token</th>
              <th>To Address</th>
              <th>Status</th>
              <th>Transaction</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item) => (
              <tr key={item.id}>
                <td>{new Date(item.created_at).toLocaleString()}</td>
                <td>{parseFloat(item.amount).toFixed(4)}</td>
                <td>{item.token}</td>
                <td>{formatAddress(item.to_address)}</td>
                <td>
                  <span className={`status-badge ${getStatusClass(item.status)}`}>
                    {item.status}
                  </span>
                </td>
                <td>
                  {item.tx_hash ? (
                    <a 
                      href={`https://etherscan.io/tx/${item.tx_hash}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="etherscan-link"
                    >
                      View on Etherscan
                    </a>
                  ) : (
                    'N/A'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default WithdrawalHistory;
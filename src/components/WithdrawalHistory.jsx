// src/components/WithdrawalHistory.jsx

import React from 'react';

// The component now receives its data directly as a prop.
// It no longer needs useState or useEffect.
const WithdrawalHistory = ({ historyData = [] }) => {
  
  // Helper function to get the CSS class for the status badge
  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'sent':
      case 'complete':
        return 'status-sent';
      case 'processing':
        return 'status-processing';
      case 'queued':
        return 'status-queued';
      case 'failed':
      case 'cancelled':
        return 'status-failed';
      default:
        return '';
    }
  };
  
  // Helper function to shorten the ETH address for display
  const formatAddress = (address) => address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'N/A';

  // The parent component now handles loading and error states.
  // We just need to handle the case where the history array is empty.
  return (
    <div className="history-container">
      <h2>Withdrawal History</h2>
      {historyData.length === 0 ? (
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
            {historyData.map((item, index) => (
              <tr key={item.id || index}>
                <td>{new Date(item.created_at).toLocaleString()}</td>
                <td>{parseFloat(item.amount).toFixed(4)}</td>
                <td>{item.token}</td>
                <td>{formatAddress(item.to_address)}</td>
                <td>
                  <div className="status-cell">
                    <span className={`status-badge ${getStatusClass(item.status)}`}>
                      {item.status}
                    </span>
                    {/* The tooltip for failed transactions */}
                    {item.status?.toLowerCase() === 'failed' && (
                      <div className="tooltip">i
                        <span className="tooltip-text">
                          {item.error_message || "This transaction failed. Our team has been notified. Please contact support if the issue persists."}
                        </span>
                      </div>
                    )}
                  </div>
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
                  ) : ( '—' )}
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
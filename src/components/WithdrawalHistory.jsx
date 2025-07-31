// src/components/WithdrawalHistory.jsx

import React from 'react';
import { useTranslation } from 'react-i18next'; // 1. You were missing this import

const WithdrawalHistory = ({ historyData = [] }) => {
  const { t } = useTranslation(); // 2. You were missing this line to initialize 't'

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'sent':
      case 'complete': // Corrected from 'complete'
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
  
  // 3. You were missing the formatAddress function definition
  const formatAddress = (address) => address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'N/A';

  return (
    <div className="history-container">
      <h2>{t('withdrawal_history.title')}</h2>
      {historyData.length === 0 ? (
        <p>{t('withdrawal_history.no_history')}</p>
      ) : (
        <table className="history-table">
          <thead>
            <tr>
              <th>{t('withdrawal_history.date')}</th>
              <th>{t('withdrawal_history.amount')}</th>
              <th>{t('withdrawal_history.token')}</th>
              <th>{t('withdrawal_history.to_address')}</th>
              <th>{t('withdrawal_history.status')}</th>
              <th>{t('withdrawal_history.transaction')}</th>
            </tr>
          </thead>
          <tbody>
            {historyData.map((item, index) => (
              <tr key={item.id || index}>
                <td>{new Date(item.created_at).toLocaleString()}</td>
                <td>{parseFloat(item.amount).toFixed(4)}</td>
                <td>{item.token}</td>
                <td>{formatAddress(item.to_address)}</td> {/* This now works */}
                <td>
                  <div className="status-cell">
                    <span className={`status-badge ${getStatusClass(item.status)}`}>
                      {item.status}
                    </span>
                    {item.status?.toLowerCase() === 'failed' && (
                      <div className="tooltip">i
                        <span className="tooltip-text">
                          {item.error_message || t('withdrawal_history.failed_tooltip')}
                        </span>
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  {item.tx_hash ? (
                    <a href={`https://etherscan.io/tx/${item.tx_hash}`} target="_blank" rel="noopener noreferrer" className="etherscan-link">
                      {t('withdrawal_history.view_on_etherscan')}
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
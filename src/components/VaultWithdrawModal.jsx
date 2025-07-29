// src/components/VaultWithdrawModal.jsx
import React, { useState, useEffect } from 'react';
import api from '../api/api';

const VaultWithdrawModal = ({ isOpen, onClose, vault, onWithdrawalSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setError('');
      setIsLoading(false);
    }
  }, [isOpen]);

  if (!isOpen || !vault) return null;

  const handleWithdrawRequest = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // --- NEW --- API call is simpler, no amount needed
      await api.post('/vaults/withdraw', {
        vaultId: vault.vault_id,
      });

      onWithdrawalSuccess(); // This will refetch dashboard data
      onClose(); // Close the modal on success

    } catch (err) {
      setError(err.response?.data?.error || 'Withdrawal request failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const tradableCapital = parseFloat(vault.tradable_capital) || 0;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button onClick={onClose} className="modal-close-btn">×</button>
        <h2>Request Withdrawal from {vault.name}</h2>
        <p className="modal-subtitle">
            This will queue your entire position of <strong>${tradableCapital.toFixed(2)}</strong> for withdrawal.
        </p>
        <div className="disclaimer info">
            <p>Withdrawals are processed manually and may take up to 48 hours. You can track the status on your Wallet page.</p>
        </div>
        
        <form onSubmit={handleWithdrawRequest}>
          {error && <p className="error-message">{error}</p>}
          
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? 'Submitting...' : 'Confirm Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VaultWithdrawModal;
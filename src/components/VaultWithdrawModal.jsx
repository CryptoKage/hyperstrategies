// src/components/VaultWithdrawModal.jsx

import React, { useState, useEffect } from 'react';
import api from '../api/api';
import InputField from './InputField';

const VaultWithdrawModal = ({ isOpen, onClose, vault, onWithdrawalSuccess }) => {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setAmount('');
      setError('');
      setIsLoading(false);
    }
  }, [isOpen]);

  if (!isOpen || !vault) {
    return null;
  }

  // Get the tradable capital from the vault object, defaulting to 0
  const tradableCapital = parseFloat(vault.tradable_capital) || 0;

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const withdrawAmount = parseFloat(amount);
    
    // Frontend validation
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      setError('Please enter a valid amount.');
      setIsLoading(false);
      return;
    }
    if (withdrawAmount > tradableCapital) {
      setError('Withdrawal amount exceeds tradable capital in this vault.');
      setIsLoading(false);
      return;
    }

    try {
      await api.post('/vaults/withdraw', {
        vaultId: vault.vault_id,
        amount: withdrawAmount,
      });

      onWithdrawalSuccess();
      onClose();

    } catch (err) {
      setError(err.response?.data?.error || 'Withdrawal failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ 1. ADDED: This function handles the "Max" button click for withdrawal
  const handleMaxClick = () => {
    // We set the amount to the full tradable capital available in this vault position
    setAmount(tradableCapital.toFixed(2).toString());
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button onClick={onClose} className="modal-close-btn">×</button>
        <h2>Withdraw from {vault.name}</h2>
        <p className="modal-subtitle">Funds will be moved from this vault position back to your main "Available to Allocate" balance.</p>
        
        <form onSubmit={handleWithdraw}>
          {error && <p className="error-message">{error}</p>}
          
          <InputField
            label={`Amount to Withdraw (Available: $${tradableCapital.toFixed(2)})`}
            id="withdrawAmount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g., 500"
            required
            // ✅ 2. ADDED: The onMaxClick prop connects the new handler to the InputField component
            onMaxClick={handleMaxClick}
          />
          
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Confirm Withdrawal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VaultWithdrawModal;
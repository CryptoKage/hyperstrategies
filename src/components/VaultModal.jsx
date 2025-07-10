// src/components/VaultModal.jsx

import React, { useState, useEffect } from 'react';
import api from '../api/api';
import InputField from './InputField';

const VaultModal = ({ isOpen, onClose, vault, availableBalance, onAllocationSuccess }) => {
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

  const handleAllocate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const allocationAmount = parseFloat(amount);
    if (isNaN(allocationAmount) || allocationAmount <= 0) {
      setError('Please enter a valid amount.');
      setIsLoading(false);
      return;
    }
    if (allocationAmount > availableBalance) {
      setError('Allocation exceeds your available balance.');
      setIsLoading(false);
      return;
    }

    try {
      await api.post('/vaults/invest', {
        vaultId: vault.vault_id,
        amount: allocationAmount,
      });
      onAllocationSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Allocation failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ 1. ADDED: This function handles the "Max" button click
  const handleMaxClick = () => {
    // We set the amount to the user's full available balance, formatted as a string
    setAmount(availableBalance.toFixed(2).toString());
  };


  // ✅ 2. RENAMED: All instances of 'loyaltyPoints' are now 'bonusPoints'
  const bonusPoints = (parseFloat(amount) * 0.20) || 0;
  const tradableCapital = (parseFloat(amount) * 0.80) || 0;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button onClick={onClose} className="modal-close-btn">×</button>
        <h2>Allocate Funds to {vault.name}</h2>
        <p className="modal-subtitle">Your funds will be split into Tradable Capital and Bonus Points.</p>
        
        <form onSubmit={handleAllocate}>
          {error && <p className="error-message">{error}</p>}
          
          <InputField
            label={`Amount to Allocate (Available: $${(availableBalance || 0).toFixed(2)} USDC)`}
            id="investAmount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g., 1000"
            required
            // ✅ 3. ADDED: The onMaxClick prop connects the new handler to the InputField component
            onMaxClick={handleMaxClick}
          />

          <div className="investment-breakdown">
            <h4>Allocation Breakdown:</h4>
            <div className="breakdown-row">
              <span>Tradable Capital (80%):</span>
              <span className="breakdown-value">${tradableCapital.toFixed(2)}</span>
            </div>
            <div className="breakdown-row">
              <span>Bonus Points Credit (20%):</span>
              <span className="breakdown-value">${bonusPoints.toFixed(2)}</span>
            </div>
          </div>

          <div className="disclaimer">
            <p><strong>Please Note:</strong> Bonus Points are internal credits representing your contribution to platform operations. They are not a tradable cryptocurrency and are subject to the terms of service pending full MICA compliance.</p>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Confirm Allocation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VaultModal;
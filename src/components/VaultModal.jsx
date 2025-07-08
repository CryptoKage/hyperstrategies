// src/components/VaultModal.jsx

import React, { useState, useEffect } from 'react';
import api from '../api/api';
import InputField from './InputField';

// We now pass in the user's available balance to display it
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

  if (!isOpen || !vault) { // Added a check for vault to prevent errors
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
      // This endpoint now represents "allocating" funds from the main balance to a vault
      await api.post('/vaults/invest', {
        vaultId: vault.vault_id,
        amount: allocationAmount,
      });

      // On success, call the parent's refresh function and close the modal
      onAllocationSuccess();
      onClose();

    } catch (err) {
      setError(err.response?.data?.error || 'Allocation failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculations for the UI breakdown
  const loyaltyPoints = (parseFloat(amount) * 0.20) || 0;
  const tradableCapital = (parseFloat(amount) * 0.80) || 0;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button onClick={onClose} className="modal-close-btn">×</button>
        <h2>Allocate Funds to {vault.name}</h2>
        <p className="modal-subtitle">Your funds will be split into Tradable Capital and Loyalty Points.</p>
        
        <form onSubmit={handleAllocate}>
          {error && <p className="error-message">{error}</p>}
          
          <InputField
            label={`Amount to Allocate (Available: $${availableBalance.toFixed(2)} USDC)`}
            id="investAmount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g., 1000"
            required
          />

          <div className="investment-breakdown">
            <h4>Allocation Breakdown:</h4>
            <div className="breakdown-row">
              <span>Tradable Capital (80%):</span>
              <span className="breakdown-value">${tradableCapital.toFixed(2)}</span>
            </div>
            <div className="breakdown-row">
              <span>Loyalty Points Credit (20%):</span>
              <span className="breakdown-value">${loyaltyPoints.toFixed(2)}</span>
            </div>
          </div>

          <div className="disclaimer">
            <p><strong>Please Note:</strong> Loyalty Points are internal credits representing your contribution to platform operations. They are not a tradable cryptocurrency and are subject to the terms of service pending full MICA compliance.</p>
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
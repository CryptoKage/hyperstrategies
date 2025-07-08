// src/components/VaultModal.jsx

import React, { useState, useEffect } from 'react';
import api from '../api/api';
import InputField from './InputField'; // We're using our new, modern input

const VaultModal = ({ isOpen, onClose, vault, onInvestmentSuccess }) => {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset state when the modal is opened or closed
  useEffect(() => {
    if (!isOpen) {
      setAmount('');
      setError('');
      setIsLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleInvest = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await api.post('/vaults/invest', {
        vaultId: vault.vault_id,
        amount: parseFloat(amount),
      });

      // On success, call the refresh function from the parent and close
      onInvestmentSuccess();
      onClose();

    } catch (err) {
      setError(err.response?.data?.error || 'Investment failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const loyaltyPoints = (parseFloat(amount) * 0.20) || 0;
  const tradableCapital = (parseFloat(amount) * 0.80) || 0;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button onClick={onClose} className="modal-close-btn">×</button>
        <h2>Invest in {vault.name}</h2>
        <p className="modal-subtitle">Enter the amount you wish to invest. Your capital will be allocated according to our unique model.</p>
        
        <form onSubmit={handleInvest}>
          {error && <p className="error-message">{error}</p>}
          
          <InputField
            label="Investment Amount (USDC)"
            id="investAmount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g., 1000"
            required
          />

          <div className="investment-breakdown">
            <h4>Your Allocation:</h4>
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
            <p><strong>Please Note:</strong> Loyalty Points are internal credits representing your contribution to the platform's operational costs. They are not a tradable cryptocurrency and are subject to the terms of service pending full MICA compliance.</p>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Confirm Investment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VaultModal;
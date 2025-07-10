// src/components/VaultModal.jsx

import React, { useState, useEffect } from 'react';
import api from '../api/api';
import InputField from './InputField';

const VaultModal = ({ isOpen, onClose, vault, availableBalance, onAllocationSuccess }) => {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  // 1. New state to track if the user has acknowledged the risk warning
  const [riskAcknowledged, setRiskAcknowledged] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setAmount('');
      setError('');
      setIsLoading(false);
      setRiskAcknowledged(false); // Reset acknowledgement when modal closes
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

  const handleMaxClick = () => {
    setAmount((availableBalance || 0).toFixed(2).toString());
  };

  const bonusPoints = (parseFloat(amount) * 0.20) || 0;
  const tradableCapital = (parseFloat(amount) * 0.80) || 0;

  // 2. Determine if a warning is needed and if the button should be disabled
  const needsWarning = vault.risk_level === 'high' || vault.risk_level === 'extreme';
  const isSubmitDisabled = isLoading || (needsWarning && !riskAcknowledged);

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

          {/* 3. Conditionally render the correct warning box based on vault.risk_level */}
          {vault.risk_level === 'high' && (
            <div className="disclaimer warning">
              <p><strong>High-Risk Strategy:</strong> This vault employs strategies with a higher potential for loss. Please ensure you understand the risks before allocating funds.</p>
            </div>
          )}
          {vault.risk_level === 'extreme' && (
            <div className="disclaimer warning extreme">
              <p><strong>Extreme Risk - AI Driven:</strong> This vault utilizes experimental AI trading models. The strategies are highly volatile and can result in a significant or total loss of your allocated capital. Proceed with extreme caution.</p>
            </div>
          )}

          {/* 4. Conditionally render the acknowledgement checkbox */}
          {needsWarning && (
            <div className="acknowledgement-box">
              <input 
                type="checkbox"
                id="risk-ack"
                checked={riskAcknowledged}
                onChange={(e) => setRiskAcknowledged(e.target.checked)}
              />
              <label htmlFor="risk-ack">I acknowledge and accept the risks associated with this strategy.</label>
            </div>
          )}

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={isSubmitDisabled}>
              {isLoading ? 'Processing...' : 'Confirm Allocation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VaultModal;
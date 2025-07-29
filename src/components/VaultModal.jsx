// src/components/VaultModal.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // --- NEW --- for linking to GitBook
import api from '../api/api';
import InputField from './InputField';
import InfoIcon from './InfoIcon'; // --- NEW --- for the info icon

const VaultModal = ({ isOpen, onClose, vault, availableBalance, userTier, onAllocationSuccess }) => {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [riskAcknowledged, setRiskAcknowledged] = useState(false);
  // --- NEW --- State for the Terms & Conditions checkbox
  const [termsAccepted, setTermsAccepted] = useState(false);

  // --- NEW --- Calculate fee based on the user's tier
  const getFeePercentageForTier = (tier) => {
    switch (tier) {
      case 4: return 0.14;
      case 3: return 0.16;
      case 2: return 0.18;
      default: return 0.20;
    }
  };
  const feePercentage = getFeePercentageForTier(userTier);
  const bonusPoints = (parseFloat(amount) * feePercentage) || 0;
  const tradableCapital = (parseFloat(amount) * (1 - feePercentage)) || 0;

  useEffect(() => {
    if (!isOpen) {
      setAmount('');
      setError('');
      setIsLoading(false);
      setRiskAcknowledged(false);
      setTermsAccepted(false); // Reset on close
    }
  }, [isOpen]);

  if (!isOpen || !vault) return null;

  const handleAllocate = async (e) => {
    e.preventDefault();
    // ... (rest of handleAllocate logic remains the same)
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

  const needsWarning = vault.risk_level === 'high' || vault.risk_level === 'extreme';
  // --- NEW --- Submit button is disabled if T&C not accepted
  const isSubmitDisabled = isLoading || (needsWarning && !riskAcknowledged) || !termsAccepted;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button onClick={onClose} className="modal-close-btn">×</button>
        <div className="modal-header-with-icon">
            <h2>Allocate Funds to {vault.name}</h2>
            {/* --- NEW --- Link to the FAQ/GitBook section */}
            <Link to="/codex/core-offerings/withdrawal-logic" target="_blank" rel="noopener noreferrer" className="info-icon-link">
                <InfoIcon />
            </Link>
        </div>
        <p className="modal-subtitle">Your funds will be split based on your Account Tier.</p>
        
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
            <h4>Allocation Breakdown (Tier {userTier}):</h4>
            <div className="breakdown-row">
              <span>Tradable Capital ({(1 - feePercentage) * 100}%):</span>
              <span className="breakdown-value">${tradableCapital.toFixed(2)}</span>
            </div>
            <div className="breakdown-row">
              <span>Bonus Points Credit ({feePercentage * 100}%):</span>
              <span className="breakdown-value">${bonusPoints.toFixed(2)}</span>
            </div>
          </div>
          
          {/* Risk warning logic remains the same */}
          {needsWarning && (
            <div className="acknowledgement-box">
              <input type="checkbox" id="risk-ack" checked={riskAcknowledged} onChange={(e) => setRiskAcknowledged(e.target.checked)} />
              <label htmlFor="risk-ack">I acknowledge and accept the risks associated with this strategy.</label>
            </div>
          )}

          {/* --- NEW --- Terms and Conditions Checkbox */}
          <div className="acknowledgement-box">
            <input type="checkbox" id="terms-ack" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} />
            <label htmlFor="terms-ack">
              I have read and agree to the <a href="/codex/legal-nexus/disclaimer-and-terms" target="_blank" rel="noopener noreferrer">Terms & Conditions</a>.
            </label>
          </div>

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
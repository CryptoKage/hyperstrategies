// src/components/VaultModal.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/api';
import InputField from './InputField';
import InfoIcon from './InfoIcon';

const VaultModal = ({ isOpen, onClose, vault, availableBalance, userTier, onAllocationSuccess }) => {
  const { t } = useTranslation();
  
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [riskAcknowledged, setRiskAcknowledged] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // --- NEW --- A more robust, centralized fee calculation function
  const calculateFees = (vaultData, tier) => {
    if (!vaultData) return { finalFee: 0.20, tradable: 0, bonus: 0 };

    const baseFee = parseFloat(vaultData.fee_percentage) || 0.20;
    let finalFee = baseFee;

    if (vaultData.is_fee_tier_based) {
      const discount = (tier - 1) * 0.02;
      finalFee = Math.max(0.10, baseFee - discount); // Enforce 10% minimum
    }
    
    const allocationAmount = parseFloat(amount) || 0;
    const bonusAmount = allocationAmount * finalFee;
    const tradableAmount = allocationAmount - bonusAmount;

    return {
      finalFeePercentage: finalFee,
      tradableCapital: tradableAmount,
      bonusPoints: bonusAmount,
    };
  };
  
  // --- Use the new function to get our values ---
  const { finalFeePercentage, tradableCapital, bonusPoints } = calculateFees(vault, userTier);

  useEffect(() => {
    if (!isOpen) {
      setAmount('');
      setError('');
      setIsLoading(false);
      setRiskAcknowledged(false);
      setTermsAccepted(false);
    }
  }, [isOpen]);

  if (!isOpen || !vault) return null;

  const handleAllocate = async (e) => { /* ... (This function remains unchanged) ... */ };
  const handleMaxClick = () => { setAmount((availableBalance || 0).toFixed(2).toString()); };

  const needsWarning = vault.risk_level === 'high' || vault.risk_level === 'extreme';
  const isSubmitDisabled = isLoading || (needsWarning && !riskAcknowledged) || !termsAccepted;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button onClick={onClose} className="modal-close-btn">×</button>
        <div className="modal-header-with-icon">
            <h2>{t('vault_modal.title', { vaultName: vault.name })}</h2>
            <Link to="/fees" target="_blank" rel="noopener noreferrer" className="info-icon-link"><InfoIcon /></Link>
        </div>
        <p className="modal-subtitle">{t('vault_modal.subtitle')}</p>
        
        <form onSubmit={handleAllocate}>
          {error && <p className="error-message">{error}</p>}
          <InputField
            label={t('vault_modal.allocate_label', { amount: (availableBalance || 0).toFixed(2) })}
            id="investAmount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g., 1000"
            required
            onMaxClick={handleMaxClick}
          />
          
          {/* --- MODIFIED --- The breakdown is now fully dynamic */}
          <div className="investment-breakdown">
            <h4>{t('vault_modal.breakdown_title', { tier: userTier })}</h4>
            <div className="breakdown-row">
              <span>{t('vault_modal.tradable_capital_breakdown', { percentage: Math.round((1 - finalFeePercentage) * 100) })}</span>
              <span className="breakdown-value">${tradableCapital.toFixed(2)}</span>
            </div>
            <div className="breakdown-row">
              <span>{t('vault_modal.bonus_points_breakdown', { percentage: Math.round(finalFeePercentage * 100) })}</span>
              <span className="breakdown-value">${bonusPoints.toFixed(2)}</span>
            </div>
          </div>
          
          {/* ... (Risk and Terms sections are unchanged) ... */}

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">{t('vault_modal.cancel')}</button>
            <button type="submit" className="btn-primary" disabled={isSubmitDisabled}>
              {isLoading ? t('vault_modal.processing') : t('vault_modal.confirm_allocation')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VaultModal;
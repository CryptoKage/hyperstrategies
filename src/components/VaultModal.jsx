// /src/components/VaultModal.jsx
// This version integrates API-driven fee calculations into your existing component.
// ===================================================================================
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/api';
import InputField from './InputField';
import InfoIcon from './InfoIcon';
import { ClipLoader } from 'react-spinners'; // Assuming you have react-spinners

const VaultModal = ({ isOpen, onClose, vault, availableBalance, onAllocationSuccess }) => {
  const { t } = useTranslation();
  
  // --- STATE MANAGEMENT ---
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [riskAcknowledged, setRiskAcknowledged] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  // NEW state for API-driven fee calculations
  const [feeProspectus, setFeeProspectus] = useState(null);
  const [isCalculatingFee, setIsCalculatingFee] = useState(false);

  // --- API-DRIVEN FEE CALCULATION WITH DEBOUNCE ---
  useEffect(() => {
    if (!isOpen || !amount || parseFloat(amount) <= 0) {
      setFeeProspectus(null);
      return;
    }

    setIsCalculatingFee(true);
    const handler = setTimeout(() => {
      api.post('/vaults/calculate-investment-fee', {
        vaultId: vault.vault_id,
        amount: amount,
      }).then(response => {
        setFeeProspectus(response.data);
      }).catch(err => {
        console.error("Fee calculation error:", err);
        setFeeProspectus(null); // Clear on error
      }).finally(() => {
        setIsCalculatingFee(false);
      });
    }, 500); // 500ms debounce delay

    return () => clearTimeout(handler);
  }, [amount, vault, isOpen]);

  // --- RESET STATE ON CLOSE (Preserved) ---
  useEffect(() => {
    if (!isOpen) {
      setAmount('');
      setError('');
      setIsLoading(false);
      setRiskAcknowledged(false);
      setTermsAccepted(false);
      setFeeProspectus(null);
    }
  }, [isOpen]);

  if (!isOpen || !vault) return null;

  // --- EVENT HANDLERS (Preserved) ---
  const handleAllocate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    const allocationAmount = parseFloat(amount);
    
    // Re-checking validation just in case
    if (isNaN(allocationAmount) || allocationAmount <= 0 || allocationAmount > availableBalance) {
      setError(t('vault_modal.error_generic')); // Generic error as button should be disabled
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
      // Use the new translation-key based errors from the backend
      const messageKey = err.response?.data?.messageKey || 'vault_modal.error_failed';
      setError(t(messageKey));
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleMaxClick = () => {
    setAmount((availableBalance || 0).toString());
  };

  const needsWarning = vault.risk_level === 'high' || vault.risk_level === 'extreme';
  
  const isSubmitDisabled = 
    isLoading || 
    !amount ||
    parseFloat(amount) <= 0 ||
    parseFloat(amount) > availableBalance ||
    (needsWarning && !riskAcknowledged) || 
    !termsAccepted;

  // Helper to format numbers
  const formatCurrency = (numStr) => parseFloat(numStr || '0').toFixed(2);

  // --- RENDER METHOD ---
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
            label={t('vault_modal.allocate_label', { amount: formatCurrency(availableBalance) })}
            id="investAmount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g., 1000"
            required
            onMaxClick={handleMaxClick}
          />
          
          {/* --- NEW INVESTMENT BREAKDOWN --- */}
          <div className="investment-breakdown">
            <h4>{t('vault_modal.breakdown_title')}</h4>
            {isCalculatingFee ? (
              <div className="spinner-container">
                  <ClipLoader size={20} color={"#ffffff"} />
                  <span>{t('vault_modal.calculating')}</span>
              </div>
            ) : feeProspectus ? (
              <>
                <div className="breakdown-row">
                  <span>{t('vault_modal.base_fee')}</span>
                  <span className="breakdown-value">${formatCurrency(feeProspectus.baseFee)}</span>
                </div>
                {feeProspectus.hasPinDiscount && (
                  <div className="breakdown-row pin-discount-highlight">
                    <span>{t('vault_modal.pin_discount', { pinName: feeProspectus.pinName })} ({feeProspectus.pinDiscountPercentage}%)</span>
                    <span className="breakdown-value">- ${formatCurrency(feeProspectus.baseFee - feeProspectus.finalFee)}</span>
                  </div>
                )}
                <div className="breakdown-row final-fee">
                  <span>{t('vault_modal.final_fee')}</span>
                  <span className="breakdown-value">${formatCurrency(feeProspectus.finalFee)}</span>
                </div>
                <hr className="breakdown-hr" />
                <div className="breakdown-row net-investment">
                  <span>{t('vault_modal.net_investment')}</span>
                  <span className="breakdown-value">${formatCurrency(feeProspectus.netInvestment)}</span>
                </div>
              </>
            ) : (
                <div className="breakdown-row"><span className="text-muted">{t('vault_modal.enter_amount_prompt')}</span></div>
            )}
          </div>
          
          {/* --- ACKNOWLEDGEMENTS (Preserved) --- */}
          {needsWarning && (
            <div className="acknowledgement-box">
              <input type="checkbox" id="risk-ack" checked={riskAcknowledged} onChange={(e) => setRiskAcknowledged(e.target.checked)} />
              <label htmlFor="risk-ack">{t('vault_modal.risk_ack')}</label>
            </div>
          )}

          <div className="acknowledgement-box">
            <input type="checkbox" id="terms-ack" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} />
            <label htmlFor="terms-ack">
              {t('vault_modal.terms_ack')}{' '}
              <a href="/fees" target="_blank" rel="noopener noreferrer">{t('vault_modal.terms_link')}</a>.
            </label>
          </div>

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

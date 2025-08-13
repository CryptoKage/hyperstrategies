import React, {useState, useEffect} from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/api';
import InputField from './InputField';
import InfoIcon from './InfoIcon';

// Note: Removed the ClipLoader import since you don't use it.

const VaultModal = ({ isOpen, onClose, vault, availableBalance, userTier, onAllocationSuccess }) => { // <-- THE FIX 1: Added userTier back to the props
  const { t } = useTranslation();
  
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [riskAcknowledged, setRiskAcknowledged] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  const [feeProspectus, setFeeProspectus] = useState(null);
  const [isCalculatingFee, setIsCalculatingFee] = useState(false);

  useEffect(() => {
    if (!isOpen || !amount || parseFloat(amount) <= 0) {
      setFeeProspectus(null);
      return;
    }

    setIsCalculatingFee(true);
    const handler = setTimeout(() => {
      api.post('/vaults/calculate-investment-fee', {
        vaultId: vault.id, // <-- THE FIX 2: Changed from vault.vault_id to vault.id
        amount: amount,
      }).then(response => {
        setFeeProspectus(response.data);
      }).catch(err => {
        console.error("Fee calculation error:", err);
        setFeeProspectus(null);
      }).finally(() => {
        setIsCalculatingFee(false);
      });
    }, 500);

    return () => clearTimeout(handler);
  }, [amount, vault, isOpen]);

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

  const handleAllocate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    const allocationAmount = parseFloat(amount);
    
    if (isNaN(allocationAmount) || allocationAmount <= 0 || allocationAmount > availableBalance) {
      setError(t('vault_modal.error_generic'));
      setIsLoading(false);
      return;
    }

    try {
      await api.post('/vaults/invest', {
        vaultId: vault.id, // <-- THE FIX 2 (Applied here as well)
        amount: allocationAmount,
      });
      onAllocationSuccess();
      onClose();
    } catch (err) {
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
    isCalculatingFee || // Also disable while the fee is being calculated
    !amount ||
    parseFloat(amount) <= 0 ||
    parseFloat(amount) > availableBalance ||
    (needsWarning && !riskAcknowledged) || 
    !termsAccepted;

  const formatCurrency = (numStr) => parseFloat(numStr || '0').toFixed(2);

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
          
          <div className="investment-breakdown">
            {/* --- THE FIX 1 (Applied here): Pass the userTier to the translation --- */}
            <h4>{t('vault_modal.breakdown_title', { tier: userTier })}</h4>
            {isCalculatingFee ? (
              <div className="spinner-container">
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

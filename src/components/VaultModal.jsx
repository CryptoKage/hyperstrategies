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
        vaultId: vault.vault_id,
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
      setAmount(''); setError(''); setIsLoading(false);
      setRiskAcknowledged(false); setTermsAccepted(false); setFeeProspectus(null);
    }
  }, [isOpen]);

  if (!isOpen || !vault) return null;

  const handleAllocate = async (e) => {
    e.preventDefault();
    setIsLoading(true); setError('');
    try {
      await api.post('/vaults/invest', { vaultId: vault.vault_id, amount: amount });
      onAllocationSuccess();
      onClose();
    } catch (err) {
      const messageKey = err.response?.data?.messageKey || 'vault_modal.error_failed';
      setError(t(messageKey));
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleMaxClick = () => setAmount((availableBalance || 0).toString());
  const needsWarning = vault.risk_level === 'high' || vault.risk_level === 'extreme';
  const isSubmitDisabled = isLoading || isCalculatingFee || !feeProspectus || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > availableBalance || (needsWarning && !riskAcknowledged) || !termsAccepted;
  const formatCurrency = (numStr) => parseFloat(numStr || '0').toFixed(2);

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button onClick={onClose} className="modal-close-btn">×</button>
        <div className="modal-header-with-icon">
          <h2>{t('vault_modal.title', { vaultName: vault.name })}</h2>
          <Link to="/fees" target="_blank" rel="noopener noreferrer"><InfoIcon /></Link>
        </div>
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
            <h4>{t('vault_modal.breakdown_title')}</h4>
            {isCalculatingFee ? (
              <p>{t('vault_modal.calculating')}</p>
            ) : feeProspectus ? (
              <>
                <div className="breakdown-row">
                  <span>{t('vault_modal.tradable_capital')} ({feeProspectus.finalTradablePct.toFixed(1)}%)</span>
                  <span>${formatCurrency(feeProspectus.finalTradableAmount)}</span>
                </div>
                <div className="breakdown-row">
                  <span>{t('vault_modal.deposit_fee')} ({feeProspectus.finalFeePct.toFixed(1)}%)</span>
                  <span>${formatCurrency(feeProspectus.finalFeeAmount)}</span>
                </div>
                
                {/* Conditionally render the discount details only if they apply */}
                {(feeProspectus.tierDiscountPct > 0 || feeProspectus.totalPinDiscountPct > 0) && (
                    <div className="discounts-applied">
                        {t('vault_modal.base_fee_was', { pct: feeProspectus.baseFeePct })}
                        {feeProspectus.tierDiscountPct > 0 && 
                            <span className="discount-detail">{t('vault_modal.tier_discount', { pct: feeProspectus.tierDiscountPct })}</span>}
                        {feeProspectus.totalPinDiscountPct > 0 && 
                            <span className="discount-detail">{t('vault_modal.pin_discount', { pct: feeProspectus.totalPinDiscountPct })}</span>}
                    </div>
                )}
              </>
            ) : (
              <p className="text-muted">{t('vault_modal.enter_amount_prompt')}</p>
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
            <label htmlFor="terms-ack">{t('vault_modal.terms_ack_link')}</label>
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

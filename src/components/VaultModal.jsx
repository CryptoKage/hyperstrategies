// src/components/VaultModal.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import api from '../api/api'; // We still need this for the fee calculation
import { request } from '../api/request'; // NEW: Import our request wrapper
import InputField from './InputField';
import InfoIcon from './InfoIcon';
// REMOVED: useToast is no longer needed

const VaultModal = ({ isOpen, onClose, vault, availableBalance, userTier, onAllocationSuccess }) => {
  const { t } = useTranslation();
  
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // REMOVED: Local error state is no longer needed; toasts will handle it.
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
      setAmount(''); setIsLoading(false);
      setRiskAcknowledged(false); setTermsAccepted(false); setFeeProspectus(null);
    }
  }, [isOpen]);

  if (!isOpen || !vault) return null;

 const handleAllocate = async (e) => {
    e.preventDefault();

    // Client-side validation now triggers specific toasts
    const parsedAmount = parseFloat(amount);
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
        notifyByKey('error', 'errors.INVALID_AMOUNT');
        return;
    }
    if (parsedAmount > (availableBalance || 0)) {
        notifyByKey('error', 'errors.INSUFFICIENT_FUNDS');
        return;
    }

    setIsLoading(true);
    try {
      await request('/vaults/invest', {
        method: 'POST',
        data: { vaultId: vault.vault_id, amount: amount }
      });
      onAllocationSuccess();
      onClose();
    } catch (err) {
      console.error("Allocation failed:", err.message);
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
          {/* Local error display is removed */}
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
            <h4>{t('vault_modal.breakdown_title', { tier: userTier })}</h4>
            {isCalculatingFee ? (
              <p>{t('vault_modal.calculating')}</p>
            ) : feeProspectus ? (
              <>
                <div className="breakdown-row">
                  <span>{t('vault_modal.tradable_capital')} ({(feeProspectus.finalTradablePct || 0).toFixed(1)}%)</span>
                  <span>${formatCurrency(feeProspectus.finalTradableAmount)}</span>
                </div>
                <div className="breakdown-row">
                  <span>{t('vault_modal.deposit_fee')} ({(feeProspectus.finalFeePct || 0).toFixed(1)}%)</span>
                  <span>${formatCurrency(feeProspectus.finalFeeAmount)}</span>
                </div>
                {(feeProspectus.tierDiscountPct > 0 || feeProspectus.totalPinDiscountPct > 0) && (
                    <div className="discounts-applied">
                        {t('vault_modal.base_fee_was', { pct: (feeProspectus.baseFeePct || 0).toFixed(1) })}
                        {feeProspectus.tierDiscountPct > 0 && 
                            <span className="discount-detail">{t('vault_modal.tier_discount', { pct: feeProspectus.tierDiscountPct.toFixed(1) })}</span>}
                        {feeProspectus.totalPinDiscountPct > 0 && 
                            <span className="discount-detail">{t('vault_modal.pin_discount', { pct: feeProspectus.totalPinDiscountPct.toFixed(1) })}</span>}
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
            <label htmlFor="terms-ack">
              <Trans i18nKey="vault_modal.terms_ack_link">
                I have read and agree to the <a href="/fees" target="_blank" rel="noopener noreferrer">Terms and Conditions</a>.
              </Trans>
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

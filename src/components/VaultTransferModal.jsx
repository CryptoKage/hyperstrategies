// src/components/VaultTransferModal.jsx

import React, { useState, useEffect } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import api from '../api/api';
import InputField from './InputField';
import InfoIcon from './InfoIcon';

const VaultTransferModal = ({ isOpen, onClose, sourcePosition, allVaults, onTransferSuccess }) => {
  const { t } = useTranslation();
  
  const [amount, setAmount] = useState('');
  const [destinationVaultId, setDestinationVaultId] = useState('');
  const [riskAcknowledged, setRiskAcknowledged] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Calculate the user's settled capital in the source vault
  const availableToTransfer = (sourcePosition?.tradable_capital || 0) - (sourcePosition?.pnl || 0);

  // Filter the list of possible destination vaults
  const destinationOptions = allVaults.filter(v => 
   v.is_user_investable && // Rule 1: MUST be investable
    v.status === 'active' && // Rule 2: MUST be active
    v.vault_id !== sourcePosition?.vault_id // Rule 3: Cannot be the same as the source vault
    // We no longer need to check vault_type. The 'is_user_investable' flag handles it all.
    // --- END OF FIX ---
);

  useEffect(() => {
    if (isOpen) {
      setError('');
      setIsLoading(false);
      setAmount('');
      setRiskAcknowledged(false);
      // Pre-select the first available destination if possible
      if (destinationOptions.length > 0) {
        setDestinationVaultId(destinationOptions[0].vault_id);
      } else {
        setDestinationVaultId('');
      }
    }
  }, [isOpen, sourcePosition]); // Rerun effect if the source position changes

  if (!isOpen || !sourcePosition) return null;

  const handleRequestTransfer = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await api.post('/vaults/request-transfer', {
        fromVaultId: sourcePosition.vault_id,
        toVaultId: parseInt(destinationVaultId),
        amount: parseFloat(amount),
      });
      alert(t('vault_transfer_modal.processing_notice'));
      onTransferSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || t('vault_transfer_modal.error_failed'));
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleMaxClick = () => setAmount(availableToTransfer.toString());

  const isSubmitDisabled = 
    isLoading || 
    !amount || 
    !destinationVaultId ||
    parseFloat(amount) <= 0 || 
    parseFloat(amount) > availableToTransfer ||
    !riskAcknowledged;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button onClick={onClose} className="modal-close-btn">×</button>
        <h2>{t('vault_transfer_modal.title')}</h2>
        
        <p className="modal-subtitle">
          {t('vault_transfer_modal.subtitle', { vaultName: sourcePosition.name, amount: availableToTransfer.toFixed(2) })}
        </p>
        
        <form onSubmit={handleRequestTransfer}>
          {error && <p className="error-message">{error}</p>}

          <InputField
            label={t('vault_transfer_modal.amount_label', { max: availableToTransfer.toFixed(2) })}
            id="transferAmount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g., 100.00"
            required
            onMaxClick={handleMaxClick}
          />
          
          <div className="form-group">
            <label htmlFor="destinationVault">{t('vault_transfer_modal.destination_label')}</label>
            <select
              id="destinationVault"
              value={destinationVaultId}
              onChange={(e) => setDestinationVaultId(e.target.value)}
              required
            >
              {destinationOptions.length > 0 ? (
                destinationOptions.map(v => (
                  <option key={v.vault_id} value={v.vault_id}>{v.name}</option>
                ))
              ) : (
                <option disabled>{t('vault_transfer_modal.no_destinations')}</option>
              )}
            </select>
          </div>

          <div className="acknowledgement-box warning">
            <input type="checkbox" id="risk-ack-transfer" checked={riskAcknowledged} onChange={(e) => setRiskAcknowledged(e.target.checked)} />
            <label htmlFor="risk-ack-transfer">
              <Trans i18nKey="vault_transfer_modal.risk_ack_link">
                I understand this process requires the trading desk to unwind positions and may take 3-48 hours. I also agree to the <a href="/legal" target="_blank" rel="noopener noreferrer">terms of the destination vault</a>.
              </Trans>
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">{t('vault_transfer_modal.cancel')}</button>
            <button type="submit" className="btn-primary" disabled={isSubmitDisabled}>
              {isLoading ? t('vault_transfer_modal.submitting') : t('vault_transfer_modal.confirm_request')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VaultTransferModal;

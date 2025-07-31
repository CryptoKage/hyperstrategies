// src/components/VaultWithdrawModal.jsx

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next'; // 1. Import useTranslation
import api from '../api/api';

const VaultWithdrawModal = ({ isOpen, onClose, vault, onWithdrawalSuccess }) => {
  const { t } = useTranslation(); // 2. Initialize the t function
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setError('');
      setIsLoading(false);
    }
  }, [isOpen]);

  if (!isOpen || !vault) return null;

  const handleWithdrawRequest = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await api.post('/vaults/withdraw', {
        vaultId: vault.vault_id,
      });

      onWithdrawalSuccess();
      onClose();

    } catch (err) {
      setError(err.response?.data?.error || t('vault_withdraw_modal.error_failed'));
    } finally {
      setIsLoading(false);
    }
  };

  const tradableCapital = parseFloat(vault.tradable_capital) || 0;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button onClick={onClose} className="modal-close-btn">×</button>
        <h2>{t('vault_withdraw_modal.title', { vaultName: vault.name || 'this vault' })}</h2>
        <p
          className="modal-subtitle"
          dangerouslySetInnerHTML={{ __html: t('vault_withdraw_modal.subtitle', { amount: tradableCapital.toFixed(2) }) }}
        />
        <div className="disclaimer info">
            <p>{t('vault_withdraw_modal.disclaimer')}</p>
        </div>
        
        <form onSubmit={handleWithdrawRequest}>
          {error && <p className="error-message">{error}</p>}
          
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">{t('vault_withdraw_modal.cancel')}</button>
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? t('vault_withdraw_modal.submitting') : t('vault_withdraw_modal.confirm_request')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VaultWithdrawModal;
// src/components/WithdrawModal.jsx

import React, { useState, useEffect } from 'react';
import { isAddress } from 'ethers';
import { useTranslation } from 'react-i18next';
import api from '../api/api';
import InputField from './InputField';

const WithdrawModal = ({ isOpen, onClose, usdcBalance, onWithdrawalQueued }) => {
  const { t } = useTranslation();
  
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setAmount('');
      setAddress('');
      setError('');
      setIsLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setError('');

    if (!isAddress(address)) {
      setError(t('withdraw_modal.error_address'));
      return;
    }
    const withdrawAmount = parseFloat(amount);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      setError(t('withdraw_modal.error_nan'));
      return;
    }
    if (withdrawAmount > usdcBalance) {
      setError(t('withdraw_modal.error_insufficient'));
      return;
    }
    
    setIsLoading(true);
    try {
      await api.post('/withdraw', {
        token: 'USDC',
        amount: withdrawAmount,
        toAddress: address,
      });
      onWithdrawalQueued();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || t('withdraw_modal.error_failed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button onClick={onClose} className="modal-close-btn">×</button>
        <h2>{t('withdraw_modal.title')}</h2>
        <p className="modal-subtitle">{t('withdraw_modal.subtitle')}</p>
        
        <form onSubmit={handleWithdraw}>
          {error && <p className="error-message">{error}</p>}
          
          <InputField
            label={t('withdraw_modal.destination_label')}
            id="withdrawAddress"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="0x..."
            required
          />
          <InputField
            label={t('withdraw_modal.amount_label', { balance: usdcBalance.toFixed(4) })}
            id="withdrawAmount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g., 100.00"
            required
          />
          
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">{t('withdraw_modal.cancel')}</button>
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? t('withdraw_modal.queueing') : t('withdraw_modal.queue_withdrawal')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WithdrawModal;
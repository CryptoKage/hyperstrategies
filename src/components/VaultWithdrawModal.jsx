// src/components/VaultWithdrawModal.jsx

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { request } from '../api/request'; // NEW: Import our request wrapper
import InputField from './InputField';
import CountdownTimer from './CountdownTimer'; 

const VaultWithdrawModal = ({ isOpen, onClose, vault, unlockDate, onWithdrawalSuccess }) => {
  const { t } = useTranslation();
  
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // REMOVED: Local error state is no longer needed

  const tradableCapital = parseFloat(vault?.tradable_capital) || 0;
  const isLocked = new Date(unlockDate) > new Date();

  useEffect(() => {
    if (isOpen) {
      setIsLoading(false); 
      setAmount('');
    }
  }, [isOpen]);

  if (!isOpen || !vault) return null;

  // --- REFACTORED: handleWithdrawRequest ---
  const handleWithdrawRequest = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Use the new request wrapper. Success and error toasts are now automatic.
      await request('/vaults/withdraw', {
        method: 'POST',
        data: {
          vaultId: vault.vault_id,
          amount: parseFloat(amount),
        }
      });
      onWithdrawalSuccess();
      onClose();
    } catch (err) {
      // Error toast is already handled by the request wrapper.
      console.error('Vault withdrawal request failed:', err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleMaxClick = () => { setAmount(tradableCapital.toString()); };
  const isSubmitDisabled = isLoading || isLocked || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > tradableCapital;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button onClick={onClose} className="modal-close-btn">×</button>
        <h2>{t('vault_withdraw_modal.title', { vaultName: vault.name || 'this vault' })}</h2>
        
        {isLocked ? (
            <div className="disclaimer warning">
                <p><strong>Funds Locked</strong></p>
                <p>Your funds in this vault will be available for withdrawal in:</p>
                <CountdownTimer targetDate={unlockDate} />
            </div>
        ) : (
            <p className="modal-subtitle">
                Enter the amount you wish to withdraw from your available ${tradableCapital.toFixed(2)}.
            </p>
        )}
        
        <form onSubmit={handleWithdrawRequest}>
          {/* Local error display is removed */}
          <InputField
            label={`Amount to Withdraw (Max: ${tradableCapital.toFixed(2)} USDC)`}
            id="withdrawAmount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g., 100.00"
            required
            disabled={isLocked}
            onMaxClick={handleMaxClick}
          />
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">{t('vault_withdraw_modal.cancel')}</button>
            <button type="submit" className="btn-primary" disabled={isSubmitDisabled}>
              {isLoading ? t('vault_withdraw_modal.submitting') : t('vault_withdraw_modal.confirm_request')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VaultWithdrawModal;

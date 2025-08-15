import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/api';
import InputField from './InputField';
import CountdownTimer from './CountdownTimer'; // Assuming you have this component from the handoff docs

const VaultWithdrawModal = ({ isOpen, onClose, vault, unlockDate, onWithdrawalSuccess }) => {
  const { t } = useTranslation();
  
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const tradableCapital = parseFloat(vault?.tradable_capital) || 0;
  const isLocked = new Date(unlockDate) > new Date();

  useEffect(() => {
    if (isOpen) {
      setError(''); setIsLoading(false); setAmount('');
    }
  }, [isOpen]);

  if (!isOpen || !vault) return null;

  const handleWithdrawRequest = async (e) => {
    e.preventDefault();
    setIsLoading(true); setError('');
    try {
      await api.post('/vaults/withdraw', {
        vaultId: vault.vault_id,
        amount: parseFloat(amount),
      });
      onWithdrawalSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || t('vault_withdraw_modal.error_failed'));
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
        
        {/* --- THE FIX: Display the lock status and countdown timer --- */}
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
          {error && <p className="error-message">{error}</p>}
          <InputField
            label={`Amount to Withdraw (Max: ${tradableCapital.toFixed(2)} USDC)`}
            id="withdrawAmount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g., 100.00"
            required
            disabled={isLocked} // Disable input if locked
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

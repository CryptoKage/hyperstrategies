import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/api';
import InputField from './InputField'; // We need the InputField component

const VaultWithdrawModal = ({ isOpen, onClose, vault, onWithdrawalSuccess }) => {
  const { t } = useTranslation();
  
  // --- NEW: State for amount and updated error handling ---
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const tradableCapital = parseFloat(vault?.tradable_capital) || 0;

  useEffect(() => {
    if (isOpen) {
      setError('');
      setIsLoading(false);
      setAmount(''); // Reset amount when modal opens
    }
  }, [isOpen]);

  if (!isOpen || !vault) return null;

  const handleWithdrawRequest = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const numericAmount = parseFloat(amount);
    // --- NEW: Frontend Validation ---
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Please enter a valid positive amount.');
      setIsLoading(false);
      return;
    }
    if (numericAmount > tradableCapital) {
      setError('Withdrawal amount cannot exceed your tradable capital.');
      setIsLoading(false);
      return;
    }

    try {
      // --- NEW: Send the amount to the backend ---
      await api.post('/vaults/withdraw', {
        vaultId: vault.vault_id,
        amount: numericAmount, // Send the partial amount
      });

      onWithdrawalSuccess();
      onClose();

    } catch (err) {
      setError(err.response?.data?.error || t('vault_withdraw_modal.error_failed'));
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleMaxClick = () => {
    setAmount(tradableCapital.toString());
  };

  const isSubmitDisabled = isLoading || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > tradableCapital;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button onClick={onClose} className="modal-close-btn">×</button>
        <h2>{t('vault_withdraw_modal.title', { vaultName: vault.name || 'this vault' })}</h2>
        <p className="modal-subtitle">
          Enter the amount you wish to withdraw from your available ${tradableCapital.toFixed(2)}.
        </p>
        
        <form onSubmit={handleWithdrawRequest}>
          {error && <p className="error-message">{error}</p>}
          
          {/* --- NEW: Input field for the amount --- */}
          <InputField
            label={`Amount to Withdraw (Max: ${tradableCapital.toFixed(2)} USDC)`}
            id="withdrawAmount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g., 100.00"
            required
            onMaxClick={handleMaxClick} // Reuse the onMaxClick prop from the other modal
          />
          
          <div className="disclaimer info" style={{ marginTop: '24px' }}>
            <p>{t('vault_withdraw_modal.disclaimer')}</p>
          </div>
          
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

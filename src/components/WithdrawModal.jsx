// src/components/WithdrawModal.jsx

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { isAddress } from 'ethers';
import api from '../api/api';
import InputField from './InputField';

const WithdrawModal = ({ isOpen, onClose, usdcBalance, onWithdrawalQueued }) => {
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

    // --- Frontend Validation ---
    if (!isAddress(address)) { 
      setError('Please enter a valid Ethereum address.');
      return;
    }
    const withdrawAmount = parseFloat(amount);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    if (withdrawAmount > usdcBalance) {
      setError('Withdrawal amount exceeds your USDC balance.');
      return;
    }
    
    setIsLoading(true);
    try {
      // Your backend expects the token in the format 'USDC'
      await api.post('/withdraw', {
        token: 'USDC',
        amount: withdrawAmount,
        toAddress: address,
      });

      // On success, call the parent's refresh function and close
      onWithdrawalQueued();
      onClose();

    } catch (err) {
      setError(err.response?.data?.message || 'Withdrawal failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button onClick={onClose} className="modal-close-btn">×</button>
        <h2>Withdraw USDC</h2>
        <p className="modal-subtitle">Enter the destination address and amount. Withdrawals are processed in batches and may take several minutes.</p>
        
        <form onSubmit={handleWithdraw}>
          {error && <p className="error-message">{error}</p>}
          
          <InputField
            label="Destination ETH Address"
            id="withdrawAddress"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="0x..."
            required
          />
          <InputField
            label={`Amount to Withdraw (Balance: ${usdcBalance.toFixed(4)} USDC)`}
            id="withdrawAmount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g., 100.00"
            required
          />
          
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? 'Queueing...' : 'Queue Withdrawal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WithdrawModal;
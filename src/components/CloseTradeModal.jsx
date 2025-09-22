// PASTE THIS ENTIRE CONTENT INTO: hyperstrategies/src/components/CloseTradeModal.jsx

import React, { useState, useEffect } from 'react';
import api from '../api/api';
import InputField from './InputField';

const CloseTradeModal = ({ isOpen, onClose, trade, onSuccess }) => {
  const [exitPrice, setExitPrice] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setExitPrice('');
      setError('');
      setIsProcessing(false);
    }
  }, [isOpen]);

  if (!isOpen || !trade) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setError('');
    try {
      await api.patch(`/admin/trades/${trade.trade_id}/close`, {
        exit_price: Number(exitPrice),
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to close trade.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button onClick={onClose} className="modal-close-btn">×</button>
        <h3>Close Trade: {trade.direction} {trade.asset_symbol}</h3>
        <p className="modal-subtitle">Enter the exit price to realize the P&L.</p>
        
        <form onSubmit={handleSubmit}>
          {error && <p className="error-message">{error}</p>}
          
          <InputField
            label="Entry Price"
            id="entryPrice"
            type="text"
            value={`$${Number(trade.entry_price).toLocaleString()}`}
            disabled={true}
          />

          <InputField
            label="Exit Price ($)"
            id="exitPrice"
            type="number"
            value={exitPrice}
            onChange={(e) => setExitPrice(e.target.value)}
            placeholder="Enter final market price"
            required
            step="any"
          />
          
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={isProcessing}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isProcessing || !exitPrice}>
              {isProcessing ? 'Processing...' : 'Confirm & Close'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CloseTradeModal;

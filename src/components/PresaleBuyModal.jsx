
import React, { useState } from 'react';

  const PresaleBuyModal = ({ isOpen, onClose, availableBalance }) => {
  const [amount, setAmount] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    // Placeholder for purchase logic
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="modal-close-btn">×</button>
        <h2>Coming soon: Buy the upcoming $hyper-strategies token</h2>
        <p className="modal-subtitle">Use your available balance to purchase tokens.</p>

        <div className="investment-breakdown">
          <div className="breakdown-row">
            <span>Available Balance</span>
            <span className="breakdown-value">${availableBalance.toFixed(2)}</span>
          </div>
          <div className="breakdown-row">
            <span>Amount to Spend (USD)</span>
          </div>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{ width: '100%', marginTop: '8px' }}
          />
        </div>

        <div className="disclaimer">
          <p>
            <a href="#" onClick={(e) => e.preventDefault()}>Whitepaper (coming soon)</a> |
            <a href="#" onClick={(e) => e.preventDefault()}> Terms &amp; Conditions (coming soon)</a>
          </p>
        </div>

        <div className="modal-actions">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          
        </div>
      </div>
    </div>
  );
};

export default PresaleBuyModal;

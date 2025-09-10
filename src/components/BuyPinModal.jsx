// ==============================================================================
// START: PASTE THIS ENTIRE BLOCK into your new src/components/BuyPinModal.jsx
// ==============================================================================
import React from 'react';
import { useTranslation } from 'react-i18next';
import { PinImage } from './UserPins';

const BuyPinModal = ({ isOpen, onClose, listing, onConfirm, isProcessing, error }) => {
  const { t } = useTranslation();

  if (!isOpen || !listing) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button onClick={onClose} className="modal-close-btn">×</button>
        <h2>Confirm Purchase</h2>
        <p className="modal-subtitle">You are about to purchase the following Pin. This action cannot be undone.</p>

        <div className="purchase-summary-card">
          <PinImage pinName={listing.pin_name} imageFilename={listing.image_filename} />
          <div className="purchase-details">
            <h3>{listing.pin_name}</h3>
            <p>Sold by: {listing.seller_username}</p>
          </div>
          <div className="purchase-price">
            <span>Price</span>
            <p>${parseFloat(listing.price).toFixed(2)}</p>
          </div>
        </div>

        <div className="disclaimer">
          <p>The total amount of <strong>${parseFloat(listing.price).toFixed(2)} USDC</strong> will be deducted from your available balance.</p>
        </div>
        
        {error && <p className="error-message">{error}</p>}
        
        <div className="modal-actions">
          <button type="button" onClick={onClose} className="btn-secondary" disabled={isProcessing}>
            Cancel
          </button>
          <button type="button" onClick={onConfirm} className="btn-primary" disabled={isProcessing}>
            {isProcessing ? 'Processing...' : 'Confirm & Buy'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuyPinModal;
// ==============================================================================
// END OF FILE
// ==============================================================================

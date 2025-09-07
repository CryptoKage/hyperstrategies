// PinDetailModal.jsx file

import React from 'react';
import { useTranslation } from 'react-i18next';
import { PinImage } from './UserPins'; // We import our reusable component

const PinDetailModal = ({ pin, isOpen, onClose, onEquip, onUnequip, isActive }) => {
  const { t } = useTranslation();

  if (!isOpen || !pin) return null;

  // Placeholder for future marketplace data
  const lastSalePrice = 'N/A';
  const collectionOffer = 'N/A';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content pin-detail-modal" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="modal-close-btn">×</button>
        
        <div className="pin-modal-header">
          <PinImage pinName={pin.pin_name} description={pin.pin_description} />
          <h2>{pin.pin_name}</h2>
        </div>
        
        <p className="pin-modal-description">{pin.pin_description}</p>
        
        <div className="pin-modal-section">
          <h4>Effects</h4>
          {/* Here we would map over the pin.effects_config to show its bonuses */}
          <p className="pin-effect-placeholder">Effect details will be shown here.</p>
        </div>

        <div className="pin-modal-section">
          <h4>Market Data (Coming Soon)</h4>
          <div className="market-data-grid">
            <div className="market-data-item">
              <span>Last Sale Price:</span>
              <span>{lastSalePrice}</span>
            </div>
            <div className="market-data-item">
              <span>Highest Collection Offer:</span>
              <span>{collectionOffer}</span>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          {isActive ? (
            <button className="btn-secondary" onClick={() => onUnequip(pin)}>
              Unequip Pin
            </button>
          ) : (
            <button className="btn-primary" onClick={() => onEquip(pin)}>
              Equip Pin
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PinDetailModal;

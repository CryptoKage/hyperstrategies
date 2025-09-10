// ==============================================================================
// START: PASTE THIS ENTIRE BLOCK into your new src/components/PinListerModal.jsx
// ==============================================================================
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/api';
import { PinImage } from './UserPins';
import InputField from './InputField';

const PinListerModal = ({ isOpen, onClose, inactivePins, onListSuccess }) => {
  const { t } = useTranslation();

  const [selectedPinId, setSelectedPinId] = useState('');
  const [price, setPrice] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  // When the modal opens, pre-select the first available pin
  useEffect(() => {
    if (isOpen && inactivePins.length > 0) {
      setSelectedPinId(inactivePins[0].pin_id);
    } else if (!isOpen) {
      // Reset form when modal closes
      setSelectedPinId('');
      setPrice('');
      setError('');
      setIsProcessing(false);
    }
  }, [isOpen, inactivePins]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setError('');
    try {
      await api.post('/pins-marketplace/listings/list', {
        pinId: parseInt(selectedPinId, 10),
        price: parseFloat(price)
      });
      onListSuccess(); // This will tell the profile page to refresh its data
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to list pin. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  const selectedPinDetails = inactivePins.find(p => p.pin_id === parseInt(selectedPinId, 10));

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button onClick={onClose} className="modal-close-btn">×</button>
        <h2>List a Pin for Sale</h2>
        <p className="modal-subtitle">Select a pin from your collection and set a price in USDC.</p>
        
        <form onSubmit={handleSubmit}>
          {error && <p className="error-message">{error}</p>}
          
          <div className="form-group">
            <label htmlFor="pin-select">Select Pin to List</label>
            <select id="pin-select" value={selectedPinId} onChange={(e) => setSelectedPinId(e.target.value)} disabled={inactivePins.length === 0}>
              {inactivePins.length > 0 ? (
                inactivePins.map(pin => (
                  <option key={pin.pin_id} value={pin.pin_id}>{pin.pin_name} (ID: {pin.pin_id})</option>
                ))
              ) : (
                <option>You have no inactive pins to list.</option>
              )}
            </select>
          </div>
          
          {selectedPinDetails && (
            <div className="list-preview-card">
              <PinImage pinName={selectedPinDetails.pin_name} imageFilename={selectedPinDetails.image_filename} />
              <p>{selectedPinDetails.pin_description}</p>
            </div>
          )}

          <InputField 
            label="Set Price (USDC)"
            id="list-price"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="e.g., 50.00"
            required
          />

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={isProcessing}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={isProcessing || !selectedPinId || !price}>
              {isProcessing ? 'Listing...' : 'Confirm & List Pin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PinListerModal;
// ==============================================================================
// END OF FILE
// ==============================================================================

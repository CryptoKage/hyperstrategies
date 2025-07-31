// src/components/InfoModal.jsx

import React from 'react';

// This component is purely presentational. It doesn't need the 't' function itself,
// as the translated title and children will be passed in as props from the parent.
const InfoModal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="modal-close-btn">×</button>
        <h2>{title}</h2>
        <div className="info-modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default InfoModal;
// src/components/InfoModal.jsx

import React from 'react';

// This is now a simple, generic modal for displaying any information.
const InfoModal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="modal-close-btn">×</button>
        {/* The title is passed in as a prop */}
        <h2>{title}</h2>
        {/* The body of the modal is passed in as children */}
        <div className="info-modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default InfoModal;
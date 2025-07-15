// src/components/AddToHomeScreenPrompt.jsx
import React from 'react';
import ShareIcon from './ShareIcon'; // We will create this small icon component next

const AddToHomeScreenPrompt = ({ onClose }) => {
  return (
    <div className="ios-prompt-overlay">
      <div className="ios-prompt-content">
        <button onClick={onClose} className="ios-prompt-close">×</button>
        <h3>Install HyperStrategies App</h3>
        <p>For the best experience, add our app to your home screen.</p>
        <div className="ios-instructions">
          <p>1. Tap the <strong>Share</strong> icon below.</p>
          <ShareIcon />
          <p>2. Scroll down and tap <strong>"Add to Home Screen"</strong>.</p>
        </div>
      </div>
    </div>
  );
};

export default AddToHomeScreenPrompt;
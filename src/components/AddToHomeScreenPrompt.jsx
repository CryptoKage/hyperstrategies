// src/components/AddToHomeScreenPrompt.jsx

import React from 'react';
import { useTranslation } from 'react-i18next';
import ShareIcon from './ShareIcon';

const AddToHomeScreenPrompt = ({ onClose }) => {
  const { t } = useTranslation();

  return (
    <div className="ios-prompt-overlay">
      <div className="ios-prompt-content">
        <button onClick={onClose} className="ios-prompt-close">×</button>
        <h3>{t('add_to_home_screen.title')}</h3>
        <p>{t('add_to_home_screen.subtitle')}</p>
        <div className="ios-instructions">
          <p dangerouslySetInnerHTML={{ __html: t('add_to_home_screen.step1') }} />
          <ShareIcon />
          <p dangerouslySetInnerHTML={{ __html: t('add_to_home_screen.step2') }} />
        </div>
      </div>
    </div>
  );
};

export default AddToHomeScreenPrompt;
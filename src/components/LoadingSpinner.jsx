import React from 'react';
import { useTranslation } from 'react-i18next'; // Import the hook

const LoadingSpinner = () => {
  const { t } = useTranslation(); // Initialize the translation function

  return (
    <div className="balance-loading-icon">
      <span className="loading-spinner" aria-label="loading" />
      {/* --- THIS IS THE FIX --- */}
      {/* We now use the 't' function to get the text from our JSON files */}
      <span className="tooltip-text">
        {t('common.pending_withdrawal_tooltip')}
      </span>
    </div>
  );
};

export default LoadingSpinner;

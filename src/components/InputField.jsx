// src/components/InputField.jsx

import React from 'react';
import { useTranslation } from 'react-i18next';

const InputField = ({ label, id, type = 'text', value, onChange, placeholder, required = false, onMaxClick = null }) => {
  const { t } = useTranslation();

  return (
    <div className="input-group">
      <div className="input-label-wrapper">
        <label htmlFor={id} className="input-label">
          {label}
        </label>
        {onMaxClick && (
          <button type="button" onClick={onMaxClick} className="btn-max">
            {t('common.max')} 
          </button>
        )}
      </div>
      <input
        type={type}
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="input-field"
      />
    </div>
  );
};

export default InputField;
// src/components/InputField.jsx

import React from 'react';

const InputField = ({ label, id, type = 'text', value, onChange, placeholder, required = false, onMaxClick = null }) => {
  return (
    <div className="input-group">
      <div className="input-label-wrapper">
        <label htmlFor={id} className="input-label">
          {label}
        </label>
        {/* The "Max" button only appears if an onMaxClick function is provided */}
        {onMaxClick && (
          <button type="button" onClick={onMaxClick} className="btn-max">
            Max
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
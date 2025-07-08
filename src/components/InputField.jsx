// src/components/InputField.jsx
import React from 'react';

const InputField = ({ label, id, type = 'text', value, onChange, placeholder, required = false }) => {
  return (
    <div className="input-group">
      <label htmlFor={id} className="input-label">
        {label}
      </label>
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
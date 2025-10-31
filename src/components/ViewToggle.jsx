import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/view-toggle.css';

const ViewToggle = ({ label, options = [], variant = 'light', alignment = 'center' }) => {
  if (!options.length) {
    return null;
  }

  return (
    <div className={`view-toggle view-toggle--${variant} view-toggle--align-${alignment}`}>
      {label ? <span className="view-toggle__label">{label}</span> : null}
      <div className="view-toggle__rail" role="tablist" aria-label={label || 'View options'}>
        {options.map(({ id, label: optionLabel, to, isActive }) => {
          const key = id || optionLabel;
          if (isActive) {
            return (
              <span
                key={key}
                className="view-toggle__chip view-toggle__chip--active"
                role="tab"
                aria-selected="true"
              >
                {optionLabel}
              </span>
            );
          }

          return (
            <Link
              key={key}
              to={to}
              className="view-toggle__chip"
              role="tab"
              aria-selected="false"
            >
              {optionLabel}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default ViewToggle;

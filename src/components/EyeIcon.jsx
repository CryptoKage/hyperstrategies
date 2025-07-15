// src/components/EyeIcon.jsx

import React from 'react';

const EyeIcon = ({ isHidden }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ height: '20px', width: '20px' }}>
    {isHidden ? (
      // The "hidden" case is fine because it only returns one <path> element
      <path d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0010 15c-2.485 0-4.733-.825-6.5-2.428a11.9 11.9 0 01-1.34-1.572A1 1 0 002 11V9a1 1 0 00-1-1H0a1 1 0 00-1 1v2a1 1 0 001 1h1a1 1 0 001-1v-2h-.293l-1.473-1.473zM10 5c2.485 0 4.733.825 6.5 2.428a11.9 11.9 0 011.34 1.572A1 1 0 0018 9v2a1 1 0 001 1h1a1 1 0 001-1v-2a1 1 0 00-1-1h-1a1 1 0 00-1 1v2h.293l1.473-1.473A10.014 10.014 0 0010 5z" />
    ) : (
      // ✅ THE FIX: Wrap the two <path> elements in a React Fragment
      <>
        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
      </>
    )}
  </svg>
);

export default EyeIcon;
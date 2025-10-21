import React, { useEffect, useState } from 'react';
import '../styles/how-it-works.css';

const STORAGE_KEY = 'hs-cookie-consent';

const CookieBanner = ({ banner }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      setVisible(true);
    }
  }, []);

  const handleChoice = (value) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, value);
    }
    setVisible(false);
  };

  if (!banner || !visible) {
    return null;
  }

  return (
    <div className="cookie-banner" role="dialog" aria-live="polite" aria-label="Cookie consent">
      <p>{banner.text}</p>
      <div className="cookie-banner__actions">
        <button type="button" className="btn-primary" onClick={() => handleChoice('accepted')}>
          {banner.actions?.accept || 'Accept'}
        </button>
        <button type="button" className="btn-outline" onClick={() => handleChoice('rejected')}>
          {banner.actions?.reject || 'Reject'}
        </button>
        {banner.actions?.manage && (
          <button type="button" className="btn-link" onClick={() => handleChoice('managed')}>
            {banner.actions.manage}
          </button>
        )}
      </div>
    </div>
  );
};

export default CookieBanner;

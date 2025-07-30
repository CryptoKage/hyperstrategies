// src/components/Footer.jsx

import React from 'react';

// NO IMPORTS for the icons are needed here.

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer__contact">Contact: info@hyperstrategies.xyz</div>
      
      <div className="footer__socials">
        <span>Follow us:</span>
        {/* Replace '#' with your actual social media URLs */}
        <a href="#" target="_blank" rel="noopener noreferrer" className="social-link" title="Follow us on X">
          {/* We now use a direct, absolute path to the public folder */}
          <img src="/icons/x-icon.png" alt="X Icon" className="social-icon" />
        </a>
        <a href="#" target="_blank" rel="noopener noreferrer" className="social-link" title="Join our Telegram">
          <img src="/icons/telegram-icon.png" alt="Telegram Icon" className="social-icon" />
        </a>
      </div>

      <div className="footer__disclaimer">This is not financial advice. Use at your own risk.</div>
    </footer>
  );
};

export default Footer;
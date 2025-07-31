// src/components/Footer.jsx

import React from 'react';

// No imports are needed for icons in the public folder

const Footer = () => {
  return (
    <footer className="footer">
          
      <div className="footer__socials">
        <span>Follow us:</span>
        <a href="https://x.com/hyperstrats" target="_blank" rel="noopener noreferrer" className="social-link" title="Follow us on X">
          <img src="/icons/x-icon-black.svg" alt="X Icon" className="social-icon" />
        </a>
        <a href="https://t.me/hyperstrategies" target="_blank" rel="noopener noreferrer" className="social-link" title="Join our Telegram">
          <img src="/icons/telegram-icon.svg" alt="Telegram Icon" className="social-icon" />
        </a>
      </div>

      {/* --- NEW Legal Links Section --- */}
      <div className="footer__legal">
        {/* Replace '#' with your actual GitBook URL when you have it */}
        <a href="#" target="_blank" rel="noopener noreferrer">Documentation</a>
        <span className="separator">|</span>
        {/* Replace '#' with your actual T&Cs URL when you have it */}
        <a href="#" target="_blank" rel="noopener noreferrer">Terms & Conditions</a>
      </div>
    </footer>
  );
};

export default Footer;
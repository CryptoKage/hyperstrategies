// src/components/Footer.jsx

import React from 'react';

// --- NEW --- Import the SVG files as components
import { ReactComponent as XIcon } from '../assets/x-icon.svg';
import { ReactComponent as TelegramIcon } from '../assets/telegram.svg';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer__contact">Contact: info@hyperstrategies.xyz</div>
      
      {/* --- NEW Social Links Section --- */}
      <div className="footer__socials">
        <span>Follow us:</span>
        {/* Replace '#' with your actual social media URLs */}
        <a href="#" target="_blank" rel="noopener noreferrer" className="social-link" title="Follow us on X">
          <XIcon />
        </a>
        <a href="#" target="_blank" rel="noopener noreferrer" className="social-link" title="Join our Telegram">
          <TelegramIcon />
        </a>
      </div>

      <div className="footer__disclaimer">This is not financial advice. Use at your own risk.</div>
    </footer>
  );
};

export default Footer;
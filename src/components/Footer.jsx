// src/components/Footer.jsx

import React from 'react';

// --- Vercel Build Cache Nudge: Version 2 ---
import xIconPath from '../assets/x-icon.svg';
import telegramIconPath from '../assets/telegram.svg';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer__contact">Contact: info@hyperstrategies.xyz</div>
      
      <div className="footer__socials">
        <span>Follow us:</span>
        {/* Replace '#' with your actual social media URLs */}
        <a href="#" target="_blank" rel="noopener noreferrer" className="social-link" title="Follow us on X">
          <img src={xIconPath} alt="X Icon" className="social-icon" />
        </a>
        <a href="#" target="_blank" rel="noopener noreferrer" className="social-link" title="Join our Telegram">
          <img src={telegramIconPath} alt="Telegram Icon" className="social-icon" />
        </a>
      </div>

      <div className="footer__disclaimer">This is not financial advice. Use at your own risk.</div>
    </footer>
  );
};

export default Footer;
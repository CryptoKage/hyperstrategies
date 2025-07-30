// src/components/Footer.jsx

import React from 'react';

// --- IMPORTING .PNG FILES ---
import xIconPath from '../assets/x-icon.png';
import telegramIconPath from '../assets/telegram-icon.png';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer__contact">...</div>
      <div className="footer__socials">
        <span>Follow us:</span>
        <a href="#"><img src={xIconPath} alt="X Icon" className="social-icon" /></a>
        <a href="#"><img src={telegramIconPath} alt="Telegram Icon" className="social-icon" /></a>
      </div>
      <div className="footer__disclaimer">...</div>
    </footer>
  );
};

export default Footer;
// src/components/Footer.jsx

import React from 'react';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="footer">
      {/* Contact info removed as per your last file version */}
      
      <div className="footer__socials">
        <span>{t('footer.follow_us')}</span>
        <a href="https://x.com/hyperstrats" target="_blank" rel="noopener noreferrer" className="social-link" title="Follow us on X">
          <img src="/icons/x-icon-black.svg" alt="X Icon" className="social-icon" />
        </a>
        <a href="https://t.me/hyperstrategies" target="_blank" rel="noopener noreferrer" className="social-link" title="Join our Telegram">
          <img src="/icons/telegram-icon.svg" alt="Telegram Icon" className="social-icon" />
        </a>
      </div>

      <div className="footer__legal">
        <a href="#" target="_blank" rel="noopener noreferrer">{t('footer.documentation')}</a>
        <span className="separator">|</span>
        <a href="#" target="_blank" rel="noopener noreferrer">{t('footer.terms')}</a>
      </div>
    </footer>
  );
};

export default Footer;
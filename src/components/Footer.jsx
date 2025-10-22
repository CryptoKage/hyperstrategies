// src/components/Footer.jsx

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="footer">
      <div className="footer__socials">
        <span>{t('footer.follow_us')}</span>
        <a href="https://x.com/hyperstrats" target="_blank" rel="noopener noreferrer" className="social-link" title="Follow us on X">
          <img src="/icons/x-icon.png" alt="X Icon" className="social-icon" />
        </a>
        <a href="https://t.me/hyperstrategies" target="_blank" rel="noopener noreferrer" className="social-link" title="Join our Telegram">
          <img src="/icons/telegram-logo.png" alt="Telegram Icon" className="social-icon" />
        </a>
      </div>

      <div className="footer__legal">
        <a href="https://hs0-3.gitbook.io/hs-docs/" target="_blank" rel="noopener noreferrer">
          {t('footer.documentation', 'Docs')}
        </a>
        <span className="separator">|</span>
        <a href="https://hs0-3.gitbook.io/hs-docs/" target="_blank" rel="noopener noreferrer">
          {t('footer.user_guide', 'User Guide')}
        </a>
        <span className="separator">|</span>
        <Link to="/fees">{t('fees_page.nav_fees', 'Fees')}</Link>
        <span className="separator">|</span>
        <Link to="/legal">{t('footer.terms_link', 'Legal')}</Link>
      </div>
    </footer>
  );
};

export default Footer;

// src/components/Footer.jsx

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import siteCopy from '../data/howItWorksContent.json';

const Footer = () => {
  const { t } = useTranslation();
  const { footer = {}, legal = {} } = siteCopy;

  return (
    <footer className="footer">
      <div className="footer__socials">
        <span>{footer.tag || t('footer.follow_us')}</span>
        {(footer.social || []).map((item) => (
          <a
            key={item.href}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="social-link"
            title={item.label}
          >
            {item.label}
          </a>
        ))}
        {footer.status && (
          <a href={footer.status.href} target="_blank" rel="noopener noreferrer" className="social-link" title={footer.status.label}>
            {footer.status.label}
          </a>
        )}
      </div>

      <div className="footer__legal">
        <a href="https://hyper-strategies.gitbook.io/hyper-strategies-docs/" target="_blank" rel="noopener noreferrer">
          {t('footer.documentation', 'Docs')}
        </a>
        <span className="separator">|</span>
        <a href="https://hyper-strategies.gitbook.io/hyper-strategies-docs/user-guide/user-guide-getting-started" target="_blank" rel="noopener noreferrer">
          {t('footer.user_guide', 'User Guide')}
        </a>
        <span className="separator">|</span>
        <Link to="/fees">{t('fees_page.nav_fees', 'Fees')}</Link>
        <span className="separator">|</span>
        <Link to="/legal">{t('footer.terms_link', 'Legal')}</Link>
      </div>

      {legal.links?.length > 0 && (
        <div className="footer__legal footer__legal--secondary">
          {legal.links.map((link) => (
            <Link key={link.href} to={link.href}>
              {link.label}
            </Link>
          ))}
        </div>
      )}

      {footer.contact && (
        <div className="footer__contact">
          <a href={footer.contact.href}>{footer.contact.label}</a>
        </div>
      )}

      {legal.footnote && <p className="footer__footnote">{legal.footnote}</p>}
    </footer>
  );
};

export default Footer;

// src/components/Header.jsx

import React, { useState } from 'react'; // 1. Import useState
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../assets/logo.png';

// A simple SVG component for the hamburger icon
const HamburgerIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor">
    <path d="M4 6H20M4 12H20M4 18H20" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const Header = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  // 2. State to manage the mobile menu's open/closed status
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const changeLanguage = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  // Helper to close menu when a link is clicked
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="header">
      <Link to="/" className="header__left" onClick={closeMobileMenu}>
        <img src={Logo} alt={t('header.alt_logo')} className="header__logo" />
        <span className="header__title">Hyper Strategies</span>
      </Link>
      
      {/* 3. This container is now specifically for the DESKTOP view */}
      <div className="header__right--desktop">
        <select className="header__language-select" onChange={changeLanguage} value={i18n.language}>
          <option value="en">EN</option>
          <option value="de">DE</option>
        </select>

        {user ? (
          <>
            <Link to="/dashboard" className="header__button">{t('header.dashboard')}</Link>
            <Link to="/wallet" className="header__button">{t('header.wallet')}</Link>
            <Link to="/profile" className="header__button">{t('header.profile')}</Link>
            {user.account_tier >= 2 && (
              <Link to="/tabs-market" className="header__button header__button--glow">{t('header.tab_market')}</Link>
            )}
            {user.isAdmin && (<Link to="/admin" className="header__button header__button--admin">{t('header.admin')}</Link>)}
            <button onClick={handleLogout} className="header__button header__button--primary">{t('header.logout')}</button>
          </>
        ) : (
          <>
            <Link to="/login" className="header__button">{t('header.signin')}</Link>
            <Link to="/register" className="header__button header__button--primary">{t('header.register')}</Link>
          </>
        )}
      </div>

      {/* 4. This is the new hamburger button for MOBILE view */}
      <div className="header__right--mobile">
          <button className="hamburger-button" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Open menu">
              <HamburgerIcon />
          </button>
      </div>

      {/* 5. This is the new MOBILE menu OVERLAY that appears when open */}
      {isMobileMenuOpen && (
          <div className="mobile-menu-overlay">
              <button className="mobile-menu__close-btn" onClick={closeMobileMenu}>×</button>
              <div className="mobile-menu-content">
                  {user ? (
                      <>
                          <Link to="/dashboard" className="mobile-menu__link" onClick={closeMobileMenu}>{t('header.dashboard')}</Link>
                          <Link to="/wallet" className="mobile-menu__link" onClick={closeMobileMenu}>{t('header.wallet')}</Link>
                          <Link to="/profile" className="mobile-menu__link" onClick={closeMobileMenu}>{t('header.profile')}</Link>
                          {user.account_tier >= 2 && <Link to="/tabs-market" className="mobile-menu__link" onClick={closeMobileMenu}>{t('header.tab_market')}</Link>}
                          {user.isAdmin && <Link to="/admin" className="mobile-menu__link" onClick={closeMobileMenu}>{t('header.admin')}</Link>}
                          <button onClick={() => { handleLogout(); closeMobileMenu(); }} className="mobile-menu__button">{t('header.logout')}</button>
                      </>
                  ) : (
                      <>
                          <Link to="/login" className="mobile-menu__link" onClick={closeMobileMenu}>{t('header.signin')}</Link>
                          <Link to="/register" className="mobile-menu__link" onClick={closeMobileMenu}>{t('header.register')}</Link>
                      </>
                  )}
                  <div className="mobile-menu__language-select-wrapper">
                      <select className="header__language-select" onChange={changeLanguage} value={i18n.language}>
                          <option value="en">EN</option>
                          <option value="de">DE</option>
                      </select>
                  </div>
              </div>
          </div>
      )}
    </header>
  );
};

export default Header;
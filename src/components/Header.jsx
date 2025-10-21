// /src/components/Header.jsx

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../assets/logo.png';
import api from '../api/api';
import TierProgressBar from './TierProgressBar';

const HamburgerIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor">
    <path d="M4 6H20M4 12H20M4 18H20" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const Header = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const changeLanguage = (e) => {
    const selectedLang = e.target.value;
    if (selectedLang === 'troll' && user) {
      api.post('/user/mint-troll-pin').catch(err => console.error("Troll pin minting failed:", err));
    }
    i18n.changeLanguage(selectedLang);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Set scrolled to true if user has scrolled more than 10px down
      setScrolled(window.scrollY > 10);
    };

    // Add event listener when the component mounts
    window.addEventListener('scroll', handleScroll);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header className="header">
      <Link to="/" className="header__left" onClick={closeMobileMenu}>
        <img src={Logo} alt={t('header.alt_logo')} className="header__logo" />
        <span className="header__title">Hyper Strategies</span>
      </Link>
      
      <div className="header__right--desktop">
        <nav className="header__nav">
          <Link to="/how-it-works" className="header__button" onClick={closeMobileMenu}>
            How it works
          </Link>
          {user ? (
            <>
              <Link to="/dashboard" className="header__button">{t('header.dashboard')}</Link>
              <Link to="/wallet" className="header__button">{t('header.wallet')}</Link>
              <Link to="/rewards" className="header__button">{t('header.rewards', 'Rewards')}</Link>
              <Link to="/profile" className="header__button">{t('header.profile')}</Link>
              {user.isAdmin && (
                <Link to="/admin" className="header__button header__button--admin">{t('header.admin')}</Link>
              )}
            </>
          ) : (
            <>
              <Link to="/investor" className="header__button">{t('header.investor', 'Investor')}</Link>
            </>
          )}
        </nav>

        {/* --- THE FIX: Place the XP Bar inside the right-hand container for stability --- */}
        {user && <TierProgressBar />}

        <div className="header__cta-group">
          <select className="header__language-select" onChange={changeLanguage} value={i18n.language}>
            <option value="en">EN</option>
            <option value="de">DE</option>
            <option value="eu">EU</option>
            <option value="troll">Troll</option>
          </select>

          {user ? (
            <button onClick={handleLogout} className="header__button header__button--primary">{t('header.logout')}</button>
          ) : (
            <>
              <Link to="/login" className="header__button">{t('header.signin')}</Link>
              <Link to="/register" className="header__button header__button--primary">{t('header.register')}</Link>
            </>
          )}
        </div>
      </div>

      <div className="header__right--mobile">
          {user && <TierProgressBar />}
          <button className="hamburger-button" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Open menu">
              <HamburgerIcon />
          </button>
      </div>
      
          {isMobileMenuOpen && (
          <div className="mobile-menu-overlay">
              <button className="mobile-menu__close-btn" onClick={closeMobileMenu}>×</button>
              <div className="mobile-menu-content">
                  <Link to="/how-it-works" className="mobile-menu__link" onClick={closeMobileMenu}>How it works</Link>
                  {user ? (
                      <>
            {/* Link to Dashboard remains as a quick access point */}
            <Link to="/dashboard" className="mobile-menu__link" onClick={closeMobileMenu}>{t('header.dashboard')}</Link>
            
            {/* Admin link for admins */}
            {user.isAdmin && (
                <Link to="/admin" className="mobile-menu__link" onClick={closeMobileMenu}>{t('header.admin')}</Link>
            )}

            {/* Logout is the primary action */}
            <button onClick={() => { handleLogout(); closeMobileMenu(); }} className="mobile-menu__button">{t('header.logout')}</button>
        </>
    ) : (
        <>
            {/* For logged-out users, show Sign In and Register */}
            <Link to="/login" className="mobile-menu__link" onClick={closeMobileMenu}>{t('header.signin')}</Link>
            <Link to="/register" className="mobile-menu__link" onClick={closeMobileMenu}>{t('header.register')}</Link>
        </>
    )}
                  <div className="mobile-menu__language-select-wrapper">
                      <select className="header__language-select" onChange={changeLanguage} value={i18n.language}>
                          <option value="en">EN</option>
                          <option value="de">DE</option>
                          <option value="eu">EU</option>
                          <option value="troll">Troll</option>
                      </select>
                  </div>
              </div>
          </div>
      )}
    </header>
  );
};

export default Header;

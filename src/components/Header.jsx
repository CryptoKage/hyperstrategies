// src/components/Header.jsx

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../assets/logo.png';

const Header = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const changeLanguage = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header__left" onClick={() => navigate('/')}>
        <img src={Logo} alt="Hyper Strategies" className="header__logo" />
        <span className="header__title">Hyper Strategies</span>
      </div>
      <div className="header__right">
        <select
          className="header__language-select"
          onChange={changeLanguage}
          value={i18n.language}
        >
          <option value="en">EN</option>
          <option value="de">DE</option>
        </select>

        {user ? (
          <>
            <Link to="/dashboard" className="header__button">Dashboard</Link>
            {/* ✅ ADD THIS WALLET LINK */}
            <Link to="/wallet" className="header__button">Wallet</Link>
            <button onClick={handleLogout} className="header__button header__button--primary">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="header__button">Sign In</Link>
            <Link to="/register" className="header__button header__button--primary">
              Register
            </Link>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
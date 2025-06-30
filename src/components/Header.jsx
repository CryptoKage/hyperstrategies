// src/components/Header.jsx

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // 1. Import the auth hook
import Logo from '../assets/logo.png';

const Header = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // 2. Get the user and logout function from context

  const changeLanguage = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  const handleLogout = () => {
    logout(); // This clears the user state and localStorage
    navigate('/login'); // Redirect to login after logout
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

        {/* --- THIS IS THE NEW LOGIC --- */}
        {/* 3. We conditionally render buttons based on whether the user exists. */}
        {user ? (
          <>
            <Link to="/dashboard" className="header__button">Dashboard</Link>
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
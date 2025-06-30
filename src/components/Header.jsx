import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Logo from '../assets/logo.png';
import { useAuth } from '../context/AuthContext'; 

const Header = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const { isLoggedIn, user, logout } = useAuth(); 

  const handleLogout = () => {
    logout();
    navigate('/'); 
  };

  const changeLanguage = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <header className="header">
      <div className="header__left" onClick={() => navigate('/')}>
        <img src={Logo} alt="Hyper Strategies Logo" className="header__logo" />
        {/* ✅ CHANGE #1: Added a clickable text link to home */}
        <span className="header__brand-name">Hyper Strategies</span>
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

        {isLoggedIn ? (
          <div className="header__user-info">
            {/* ✅ CHANGE #2: Changed the user email span into a clickable button */}
            <button 
              className="header__user-button" 
              onClick={() => navigate('/dashboard')}
            >
              {user?.email || 'My Dashboard'}
            </button>
            <button className="btn-outline" onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <div className="header__auth-buttons">
            <button className="btn-secondary" onClick={() => navigate('/login')}>
              Sign In
            </button>
            <button className="btn-primary" onClick={() => navigate('/register')}>
              Register
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
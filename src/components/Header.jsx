import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Logo from '../assets/logo.png'; // use your logo file here

const Header = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();

  const changeLanguage = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <header style={styles.header}>
      <div style={styles.left} onClick={() => navigate('/')}>
        <img src={Logo} alt="Hyper Strategies" style={styles.logo} />
      </div>
      <div>
        <select
          style={styles.languageSelect}
          onChange={changeLanguage}
          value={i18n.language}
        >
          <option value="en">EN</option>
          <option value="de">DE</option>
        </select>
      </div>
    </header>
  );
};

const styles = {
  header: {
    backgroundColor: '#0e0e10',
    borderBottom: '1px solid #222',
    padding: '12px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
  },
logo: {
  height: '60px', // ⬅️ Increase to 64px or even 80px
  objectFit: 'contain',

  },
  languageSelect: {
    backgroundColor: '#1a1a1d',
    border: '1px solid #444',
    color: '#e4e4e7',
    borderRadius: '4px',
    padding: '6px 10px',
    fontSize: '14px',
  },
};

export default Header;

import React, { useRef /*, useEffect */ } from 'react';
import { Routes, Route } from 'react-router-dom';
import App from '../App';
import MetaMaskLogo from '../assets/metamask.svg';
import { useTranslation } from 'react-i18next';
import SelfServe from './SelfServe';
import Header from '../components/Header';
import Managed from './Managed';
import Airdrop from './Airdrop';
import Investor from './Investor';
import Home from './Home';
import Legal from './Legal';
import Layout from '../components/Layout';





const pageStyle = {
  padding: '80px 20px',
  textAlign: 'center',
  fontSize: '18px',
  backgroundColor: '#f9f9f9',
  minHeight: '100vh',
};

const styles = {
  headline: {
    fontSize: '28px',
    fontWeight: 'bold',
    marginBottom: '12px',
  },
  subtext: {
    maxWidth: '600px',
    margin: '0 auto 40px',
    color: '#666',
  },
  card: {
    background: '#fff',
    padding: '24px',
    borderRadius: '12px',
    maxWidth: '500px',
    margin: '0 auto',
    boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
  },
  bullets: {
    textAlign: 'left',
    paddingLeft: '0',
    listStyle: 'none',
    fontSize: '16px',
    marginTop: '16px',
    lineHeight: '1.6',
  },
  foxWrap: {
    marginTop: '40px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
  foxImage: {
    width: '60px',
    height: '60px',
    transition: 'transform 0.05s ease-out',
  },
  foxText: {
    marginTop: '12px',
    color: '#555',
    fontSize: '14px',
  },
};

const Router = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/airdrop" element={<Airdrop />} />
      <Route path="/self-serve" element={<SelfServe />} />
      <Route path="/managed" element={<Managed />} />
      <Route path="/investor" element={<Investor />} />
      <Route path="/managed" element={<Managed />} />
      <Route path="/legal" element={<Legal />} />
    </Routes>
  );
};

export default Router;

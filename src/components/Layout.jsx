// src/components/Layout.jsx

import React from 'react';
import Header from './Header';
import Footer from './Footer';
import InteractiveBackground from './InteractiveBackground';
import PlasmaEffect from './PlasmaEffect';

const Layout = ({ children, showInteractiveBackground = true }) => {
  return (
    <div className="layout-wrapper">
      <PlasmaEffect />
      {showInteractiveBackground && <InteractiveBackground />}
      <Header />
      <main className="main-content">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;

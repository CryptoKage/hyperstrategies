// src/components/Layout.jsx

import React from 'react';
import Header from './Header';
import Footer from './Footer';
import InteractiveBackground from './InteractiveBackground';
import PlasmaEffect from './PlasmaEffect';

const Layout = ({ children }) => {
  return (
    <div className="layout-wrapper">
      <PlasmaEffect />
      <InteractiveBackground />
      <Header />
      <main className="main-content"> {/* Ensure this class is here */}
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
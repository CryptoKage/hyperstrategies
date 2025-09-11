// ==============================================================================
// FINAL, DEFINITIVE Layout.jsx
// ==============================================================================
import React from 'react';
import Header from './Header';
import Footer from './Footer';
import InteractiveBackground from './InteractiveBackground';
import PlasmaEffect from './PlasmaEffect';

const Layout = ({ children, showInteractiveBackground = true }) => {
  return (
    <>
      <PlasmaEffect />
      {showInteractive-background && <InteractiveBackground />}
      
      <div className="layout-wrapper">
        <Header />
        <main className="main-content">
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Layout;
// ==============================================================================
// END OF REPLACEMENT
// ==============================================================================

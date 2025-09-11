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
    // We add a new class 'has-animated-bg' to act as our hook
    <div className="layout-wrapper has-animated-bg">
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
// ==============================================================================
// END OF REPLACEMENT
// ==============================================================================

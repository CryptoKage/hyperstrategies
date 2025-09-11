// ==============================================================================
// FINAL, DEFINITIVE Layout.jsx
// ==============================================================================
import React from 'react';
import Header from 'components/Header'; // Use absolute path from src
import Footer from 'components/Footer'; // Use absolute path from src
import InteractiveBackground from 'components/InteractiveBackground'; // Use absolute path from src
import PlasmaEffect from 'components/PlasmaEffect'; // Use absolute path from src

const Layout = ({ children, showInteractiveBackground = true }) => {
  return (
    <>
      <PlasmaEffect />
      {showInteractiveBackground && <InteractiveBackground />}
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

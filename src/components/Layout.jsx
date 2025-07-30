// src/components/Layout.jsx

import React from 'react';
import Header from './Header';
// 1. Import our upgraded footer (remember we renamed it to break the cache)
import MainFooter from './MainFooter'; 
// 2. Import our two new background effect components
import InteractiveBackground from './InteractiveBackground';
import PlasmaEffect from './PlasmaEffect';

const Layout = ({ children }) => {
  return (
    // The main wrapper for the entire application
    <div className="layout-wrapper">
      
      {/* 3. The background effects are placed here, at the top level */}
      {/* They will sit behind all other content on every page */}
      <PlasmaEffect />
      <InteractiveBackground />
      
      <Header />
      
      {/* The 'main' element is where your page-specific content will render */}
      <main className="main-content">
        {children}
      </main>

      {/* 4. We now use our proper, upgraded footer component */}
      <MainFooter />
    </div>
  );
};

export default Layout;
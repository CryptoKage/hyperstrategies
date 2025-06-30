// src/components/Layout.jsx

import React from 'react';
import Header from './Header';
import { useLocation } from 'react-router-dom';

// REMOVE the styles object for the wrapper. We will move this to CSS.

const Layout = ({ children }) => {
  const location = useLocation();

  return (
    // Use className instead of inline style
    <div className="layout-wrapper">
      <Header />
      <main style={styles.main}>{children}</main>

      {/* Footer */}
      <footer style={styles.footer}>
        <p style={styles.text}>© Hyper Strategies 2025</p>
        <a href="/legal" style={styles.link}>Legal Notice</a>
      </footer>
    </div>
  );
};

// Keep the other styles, just remove the 'wrapper' property from it
const styles = {
  main: {
    flex: 1,
  },
  footer: {
    padding: '24px',
    textAlign: 'center',
    borderTop: '1px solid #1a2e24',
    backgroundColor: '#0e1a14', // We can leave this for now or move it too
  },
  text: {
    margin: '0',
    color: '#999',
    fontSize: '14px',
  },
  link: {
    display: 'block',
    marginTop: '8px',
    fontSize: '14px',
    color: '#3fbaf3',
    textDecoration: 'none',
  },
};

export default Layout;
import React from 'react';
import Header from './Header';
import { useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const location = useLocation();

  return (
    <div className="layout-wrapper" style={styles.wrapper}>
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

const styles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: '#0e1a14', // consistent background
  },
  main: {
    flex: 1,
  },
  footer: {
    padding: '24px',
    textAlign: 'center',
    borderTop: '1px solid #1a2e24',
    backgroundColor: '#0e1a14',
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

import React from 'react';

const Footer = () => {
  return (
    <footer style={styles.footer}>
      <div>Contact: info@hyperstrategies.xyz</div>
      <div style={{ marginTop: '8px' }}>Follow us: Telegram | Twitter</div>
      <div style={styles.disclaimer}>This is not financial advice. Use at your own risk.</div>
    </footer>
  );
};

const styles = {
  footer: {
    backgroundColor: '#ffffff',
    borderTop: '1px solid #ddd',
    textAlign: 'center',
    padding: '24px',
    fontSize: '14px',
    color: '#666',
    marginTop: '40px'
  },
  disclaimer: {
    fontSize: '12px',
    marginTop: '8px',
  }
};

export default Footer;

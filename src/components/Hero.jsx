import React from 'react';

const Hero = () => {
  return (
    <section style={styles.hero}>
      <h1 style={styles.headline}>Automated trading made accessible.</h1>
      <p style={styles.subheading}>
        For passive investors, self-directed traders, and early supporters.
      </p>
      <div style={styles.buttons}>
        <button className="btn-primary" style={styles.button}>Join the Airdrop</button>
        <button className="btn-outline" style={styles.button}>Speak With Us</button>
      </div>
    </section>
  );
};

const styles = {
  hero: {
    backgroundColor: '#f9f9f9',
    padding: '80px 24px',
    textAlign: 'center',
  },
  headline: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#111827',
  },
  subheading: {
    fontSize: '18px',
    color: '#6b7280',
    marginTop: '8px',
  },
  buttons: {
    marginTop: '32px',
    display: 'flex',
    justifyContent: 'center',
    gap: '16px',
    flexWrap: 'wrap',
  },
  button: {
    minWidth: '160px',
  },
};

export default Hero;

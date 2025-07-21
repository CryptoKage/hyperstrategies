import React from 'react';
import Layout from '../components/Layout';
import { useTranslation } from 'react-i18next';

const Investor = () => {
  const { t } = useTranslation();

  return (
    <Layout>
      <section style={styles.section}>
        <h1 style={styles.title}>{t('investor.headline')}</h1>
        <p style={styles.subtitle}>{t('investor.subtext')}</p>

        <a
          href="https://x.com/cryptokage"
          target="_blank"
          rel="noopener noreferrer"
          style={styles.button}
        >
          {t('investor.cta')}
        </a>
      </section>
    </Layout>
  );
};

const styles = {
  section: {
    maxWidth: '720px',
    margin: '0 auto',
    padding: '60px 20px',
    textAlign: 'center',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: '16px',
  },
  subtitle: {
    fontSize: '18px',
    color: '#ccc',
    marginBottom: '32px',
  },
  button: {
    background: '#3fbaf3',
    color: '#000',
    padding: '12px 24px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: 'bold',
    display: 'inline-block',
    marginTop: '12px',
    // No hover styling or color change to avoid disappearing text
  },
};

export default Investor;

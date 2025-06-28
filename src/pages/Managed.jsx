import React from 'react';
import Layout from '../components/Layout';
import { useTranslation } from 'react-i18next';

const Managed = () => {
  const { t } = useTranslation();

  return (
    <Layout>
      <section style={styles.section}>
        <h1 style={styles.title}>{t('managed.headline')}</h1>
        <p style={styles.subtitle}>{t('managed.subtext')}</p>

        <a
          href="https://t.me/hyperstrategies"
          target="_blank"
          rel="noopener noreferrer"
          style={styles.button}
        >
          {t('managed.cta')}
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
  },
};

export default Managed;

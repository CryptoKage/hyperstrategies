import React from 'react';
import Layout from '../components/Layout';
import { useTranslation } from 'react-i18next';

const Legal = () => {
  const { t } = useTranslation();

  return (
    <Layout>
      <section style={styles.container}>
        <h1 style={styles.title}>{t('legal.title')}</h1>

        <p><strong>{t('legal.company')}</strong></p>
        <p>{t('legal.address')}</p>
        <p>{t('legal.email')}</p>

        <h2 style={styles.section}>{t('legal.disclaimerTitle')}</h2>
        <p>{t('legal.disclaimer1')}</p>
        <p>{t('legal.disclaimer2')}</p>
        <p>{t('legal.disclaimer3')}</p>

        <h2 style={styles.section}>{t('legal.rightsTitle')}</h2>
        <p>{t('legal.rights')}</p>
      </section>
    </Layout>
  );
};

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '60px 20px',
    color: '#ccc',
    lineHeight: 1.7,
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    marginBottom: '24px',
    color: '#fff',
  },
  section: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginTop: '32px',
    marginBottom: '12px',
    color: '#fff',
  }
};

export default Legal;

// src/pages/Legal.jsx

import React from 'react';
import Layout from '../components/Layout';
import { useTranslation } from 'react-i18next';
import content from '../data/howItWorksContent.json';

const Legal = () => {
  const { t } = useTranslation();
  const { disclosures = {}, legal = {} } = content;

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

        {Object.values(disclosures).length > 0 && (
          <>
            <h2 style={styles.section}>Disclosures</h2>
            <ul style={styles.list}>
              {Object.entries(disclosures).map(([key, value]) => (
                <li key={key}>{value}</li>
              ))}
            </ul>
          </>
        )}

        {legal.links?.length > 0 && (
          <div style={styles.links}>
            {legal.links.map((link) => (
              <a key={link.href} href={link.href} style={styles.link}>
                {link.label}
              </a>
            ))}
          </div>
        )}

        {legal.footnote && <p style={styles.footnote}>{legal.footnote}</p>}
      </section>
    </Layout>
  );
};

// The styles object remains largely consistent with additional helpers for disclosures
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
  },
  list: {
    paddingLeft: '20px',
    color: '#ccc',
    lineHeight: 1.6,
  },
  links: {
    marginTop: '32px',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
  },
  link: {
    color: '#00F5A0',
  },
  footnote: {
    marginTop: '24px',
    color: '#888',
    fontSize: '0.9rem',
  },
};

export default Legal;

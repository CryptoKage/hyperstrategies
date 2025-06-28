import React from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';

const SelfServe = () => {
  const { t } = useTranslation();

  return (
    <Layout>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '16px' }}>
          {t('selfserve.headline')}
        </h1>
        <p style={{ fontSize: '16px', color: '#a0a0a0', marginBottom: '32px', maxWidth: '680px', marginInline: 'auto' }}>
          {t('selfserve.subtext')}
        </p>

        <div className="card" style={{ padding: '40px 32px', maxWidth: '640px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>
            {t('selfserve.callout')}
          </h2>
          <p style={{ fontSize: '16px', color: '#ccc' }}>{t('selfserve.comingSoon')}</p>
        </div>
      </div>
    </Layout>
  );
};

export default SelfServe;

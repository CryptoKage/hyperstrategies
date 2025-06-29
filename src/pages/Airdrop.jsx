import React from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';
import MetaMaskLogo from '../assets/metamask.svg';
import LedgerLogo from '../assets/ledgerlogo.png';

const Airdrop = () => {
  const { t } = useTranslation();

  return (
    <Layout>
      <div style={{ textAlign: 'center' }}>
        <h1>{t('airdrop.headline')}</h1>
        <p style={{ color: '#aaa', marginBottom: '32px' }}>{t('airdrop.subtext')}</p>

        <div className="card" style={{ display: 'inline-block', padding: '24px 40px', textAlign: 'left' }}>
          <h2>{t('airdrop.requirementsTitle')}</h2>
          <ul>
            {t('airdrop.bullets', { returnObjects: true }).map((item, idx) => (
              <li key={idx}>✅ {item}</li>
            ))}
          </ul>
        </div>

        <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'center', gap: '60px', flexWrap: 'wrap' }}>
          {/* MetaMask */}
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>{t('airdrop.browserWallet')}</p>
            <a href="https://metamask.io" target="_blank" rel="noreferrer">
              <img src={MetaMaskLogo} alt="Metamask" style={{ width: '60px', marginBottom: '8px', cursor: 'pointer' }} />
            </a>
            <p style={{ fontSize: '14px', color: '#999' }}>{t('airdrop.metamaskText')}</p>
          </div>

          {/* Ledger */}
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>{t('airdrop.hardwareWallet')}</p>
            <a href="https://www.ledger.com" target="_blank" rel="noreferrer">
              <img src={LedgerLogo} alt="Ledger" style={{ width: '60px', marginBottom: '8px', cursor: 'pointer' }} />
            </a>
            <p style={{ fontSize: '14px', color: '#999' }}>{t('airdrop.ledgerText')}</p>
          </div>
        </div>

        <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <a
            href="https://t.me/hyperstrategies"
            target="_blank"
            rel="noreferrer"
            className="btn-primary"
          >
            {t('airdrop.joinTelegram')}
          </a>
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSesgE4CqUxM4uKx1G6fXn8gba2sVojpyYum3dw70YeEvqmbjQ/viewform?usp=header"
            target="_blank"
            rel="noreferrer"
            className="btn-outline"
          >
            {t('airdrop.submitWallet')}
          </a>
        </div>
      </div>
    </Layout>
  );
};

export default Airdrop;

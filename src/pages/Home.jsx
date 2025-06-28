import React from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import ChartImage from '../assets/chart-placeholder.png';
import LogoImage from '../assets/logo2.png';

const section = {
  maxWidth: '1024px',
  margin: '0 auto',
  padding: '40px 20px',
};

const Home = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const cards = [
    { icon: '📩', title: t('home.cards.airdrop.title'), text: t('home.cards.airdrop.text'), route: '/airdrop' },
    { icon: '⚙️', title: t('home.cards.self.title'), text: t('home.cards.self.text'), route: '/self-serve' },
    { icon: '📈', title: t('home.cards.managed.title'), text: t('home.cards.managed.text'), route: '/managed' },
    { icon: '💼', title: t('home.cards.invest.title'), text: t('home.cards.invest.text'), route: '/investor' },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="hero" style={{ ...section, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '32px' }}>
        <div style={{ flex: 1, minWidth: '300px' }}>
          <img src={LogoImage} alt="logo" style={{ width: '80%', maxWidth: '320px', marginBottom: '24px' }} />
          <h1 className="hero-headline">{t('home.hero.headline')}</h1>
          <p className="hero-subtext">{t('home.hero.subtext')}</p>
          <div className="button-row">
            <button className="btn-primary" onClick={() => navigate('/airdrop')}>
              {t('home.hero.cta1')}
            </button>
            <button className="btn-outline" onClick={() => navigate('/investor')}>
              {t('home.hero.cta2')}
            </button>
          </div>
        </div>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <img src={ChartImage} alt="chart" className="hero-image" />
        </div>
      </section>

      {/* Platform Description */}
      <section className="section" style={section}>
        <h2>{t('home.about.title')}</h2>
        <ul className="platform-list">
          {t('home.about.bullets', { returnObjects: true }).map((item, idx) => (
            <li key={idx}>• {item}</li>
          ))}
        </ul>
      </section>

      {/* Path Selector */}
      <section className="section" style={section}>
        <h2>{t('home.cards.title')}</h2>
        <div className="card-grid">
          {cards.map((card, idx) => (
            <div key={idx} className="card">
              <div className="card-icon">{card.icon}</div>
              <h3 className="card-title">{card.title}</h3>
              <p className="card-text">{card.text}</p>
              <button className="btn-primary card-button" onClick={() => navigate(card.route)}>
                {t('home.cards.select')}
              </button>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default Home;

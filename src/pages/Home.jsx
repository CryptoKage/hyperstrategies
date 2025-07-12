import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import ReactRotatingText from 'react-rotating-text';

import Layout from '../components/Layout';
import CardSection from '../components/CardSection';
import ChartImage from '../assets/chart-placeholder.png';
import LogoImage from '../assets/logo2.png';

const Home = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const rotatingWords = ['Experimental', 'Automated', 'Hedgefund', 'Smart', 'Hyper'];

  const homePageCards = [
    {
      icon: '📩',
      title: t('home.cards.airdrop.title'),
      description: t('home.cards.airdrop.text'),
      route: '/airdrop',
    },
    {
      icon: '⚙️',
      title: t('home.cards.self.title'),
      description: t('home.cards.self.text'),
      route: '/self-serve',
    },
    {
      icon: '📈',
      title: t('home.cards.managed.title'),
      description: t('home.cards.managed.text'),
      route: '/managed',
    },
    {
      icon: '💼',
      title: t('home.cards.invest.title'),
      description: t('home.cards.invest.text'),
      route: '/investor',
    },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <img src={LogoImage} alt="Hyper Strategies Logo" className="hero-logo" />

          <h1 className="hero-headline">
            <ReactRotatingText
              items={rotatingWords}
              className="rotating-text"
              color="#007AFF"
              cursor={true}
              pause={1500}
              typingInterval={60}
              deletingInterval={40}
            />
            -strategies
          </h1>

          <p className="hero-subtext">{t('home.hero.subtext')}</p>

          <div className="button-row">
            <a
              href="https://t.me/hyperstrategies"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              Join The Community
            </a>
            <button className="btn-outline" onClick={() => navigate('/investor')}>
              {t('home.hero.cta2')}
            </button>
          </div>
        </div>

        {/* Rotating text + chart image */}
        <div className="hero-image-container">
          <div className="rotating-chart-wrapper">
            <img src={ChartImage} alt="Trading Chart" className="hero-image" />
          </div>
        </div>
      </section>

      {/* Platform Description Section */}
      <section className="about-section">
        <h2>{t('home.about.title')}</h2>
        <ul className="platform-list">
          {t('home.about.bullets', { returnObjects: true }).map((item, idx) => (
            <li key={idx}>• {item}</li>
          ))}
        </ul>
      </section>

      {/* Path Selector Section */}
      <section className="path-selector-section">
        <h2>{t('home.cards.title')}</h2>
        <CardSection cards={homePageCards} />
      </section>
    </Layout>
  );
};

export default Home;

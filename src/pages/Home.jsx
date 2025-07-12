import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import RotatingText from '../components/RotatingText';

import Layout from '../components/Layout';
import CardSection from '../components/CardSection';
import ChartImage from '../assets/chart-placeholder.png';
// 🔴 Remove text-based logo to avoid repetition

const Home = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const rotatingWords = ['EXPERIMENTAL', 'AUTOMATED', 'HEDGEFUND', 'SMART', 'HYPER'];

  const homePageCards = [
    { icon: '📩', title: t('home.cards.airdrop.title'), description: t('home.cards.airdrop.text'), route: '/airdrop' },
    { icon: '⚙️', title: t('home.cards.self.title'), description: t('home.cards.self.text'), route: '/self-serve' },
    { icon: '📈', title: t('home.cards.managed.title'), description: t('home.cards.managed.text'), route: '/managed' },
    { icon: '💼', title: t('home.cards.invest.title'), description: t('home.cards.invest.text'), route: '/investor' },
  ];

  return (
    <Layout>
      <section className="hero-section">
        <div className="hero-content">
          {/* Logo image only (no text) */}
          
          <h1 className="hero-headline">
            <RotatingText
              texts={rotatingWords}
              mainClassName="text-rotate-bg"
              staggerFrom="last"
              rotationInterval={2500}
              loop={false}
            />
            -STRATEGIES
          </h1>

          <p className="hero-subtext">{t('home.hero.subtext')}</p>

          <div className="button-row">
            <a href="https://t.me/hyperstrategies" target="_blank" rel="noopener noreferrer" className="btn-primary">
              JOIN THE COMMUNITY
            </a>
            <button className="btn-outline" onClick={() => navigate('/investor')}>
              {t('home.hero.cta2')}
            </button>
          </div>
        </div>

        <div className="hero-image-container">
          <img src={ChartImage} alt="Trading Chart" className="hero-image" />
        </div>
      </section>

      <section className="about-section">
        <h2>{t('home.about.title')}</h2>
        <ul className="platform-list">
          {t('home.about.bullets', { returnObjects: true }).map((item, idx) => (
            <li key={idx}>• {item}</li>
          ))}
        </ul>
      </section>

      <section className="path-selector-section">
        <h2>{t('home.cards.title')}</h2>
        <CardSection cards={homePageCards} />
      </section>
    </Layout>
  );
};

export default Home;

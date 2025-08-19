import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import GalaxyCanvas from '../components/GalaxyCanvas';
import RotatingText from '../components/RotatingText';

const Home = () => {
  const { t } = useTranslation();
  const [uiOpacity, setUiOpacity] = useState(1);
  const cardKeys = ['managed', 'airdrop', 'self', 'investor'];

  const handleScroll = (scrollOffset) => {
    const fadeStart = 0.02;
    const fadeEnd = 0.15;
    if (scrollOffset > fadeStart) {
      const newOpacity = 1 - (scrollOffset - fadeStart) / (fadeEnd - fadeStart);
      setUiOpacity(Math.max(0, newOpacity));
    } else {
      setUiOpacity(1);
    }
  };

  const defaultRotatingWords = ['AUTOMATED', 'HEDGEFUND', 'EXPERIMENTAL', 'HYPER'];
  let rotatingWords = t('home.rotating_words', { returnObjects: true });
  if (!Array.isArray(rotatingWords)) {
    console.warn("Missing or invalid translation for 'home.rotating_words'. Falling back to defaults.");
    rotatingWords = defaultRotatingWords;
  }

  return (
    <div>
      <div className="home-3d-wrapper">
        <GalaxyCanvas onScrollUpdate={handleScroll} />

        <div
          className="home-3d-ui-container"
          style={{ opacity: uiOpacity, pointerEvents: uiOpacity > 0.1 ? 'auto' : 'none' }}
        >
          <section className="hero-section-3d">
            <div className="hero-content">
              <h1 className="hero-headline">
                <RotatingText texts={rotatingWords} suffix="-STRATEGIES" />
              </h1>
              <p className="hero-subtext">{t('home.hero.subtext', 'Automated Trading Solutions, Curated Crypto Vaults.')}</p>
              <div className="button-row" style={{ justifyContent: 'center' }}>
                <Link to="/register" className="btn-primary btn-large">{t('home.hero.register_now', 'Register Now')}</Link>
                <Link to="/login" className="btn-outline btn-large">{t('home.hero.sign_in', 'Sign In')}</Link>
              </div>
            </div>
          </section>

          {uiOpacity > 0 && (
            <div className="scroll-cue-3d">
              <span>Scroll Down to Explore</span>
              <div className="scroll-arrow">↓</div>
            </div>
          )}
        </div>
      </div>

      <section className="home-card-listings">
        <h2>{t('home.cards.title')}</h2>
        <ul>
          {cardKeys.map((key) => (
            <li key={key}>{t(`home.cards.${key}.title`)}</li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default Home;

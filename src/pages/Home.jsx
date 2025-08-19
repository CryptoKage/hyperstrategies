import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import GalaxyCanvas from '../components/GalaxyCanvas';
import RotatingText from '../components/RotatingText';

const Home = () => {
  const { t } = useTranslation();
  const [uiOpacity, setUiOpacity] = useState(1);

  // --- THE FIX: The handleScroll function must be defined here ---
  const handleScroll = (scrollOffset) => {
    const fadeStart = 0.05;
    const fadeEnd = 0.2;
    
    if (scrollOffset > fadeStart) {
      const newOpacity = 1 - (scrollOffset - fadeStart) / (fadeEnd - fadeStart);
      setUiOpacity(Math.max(0, Math.min(1, newOpacity)));
    } else {
      setUiOpacity(1);
    }
  };

  const rotatingWords = t('home.rotating_words', { returnObjects: true }) || [];

  const pointerClass = uiOpacity <= 0.1 ? ' pointer-none' : '';

  return (
    <div className="home-3d-wrapper">
      <GalaxyCanvas onScrollUpdate={handleScroll} />

      <div
        className={`home-3d-ui-container${pointerClass}`}
        style={{ opacity: uiOpacity }}
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

        <div className="scroll-cue-3d">
          <span>Scroll Down to Explore</span>
          <div className="scroll-arrow">↓</div>
        </div>
      </div>
    </div>
  );
};

export default Home;

// src/pages/Home.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import GalaxyCanvas from '../components/GalaxyCanvas';
import RotatingText from '../components/RotatingText';

// --- THE FIX: We no longer need a separate CSS file for this page.
// All styles are now in global.css, which is imported by src/index.js

const Home = () => {
  const { t } = useTranslation();
  const rotatingWords = t('home.rotating_words', { returnObjects: true });

  // We are creating a simplified version that does not use the Layout component
  // because it's a fullscreen experience. The Header and Footer are omitted on this page.
  
  return (
    <div className="home-3d-wrapper">
      <GalaxyCanvas />

      <div className="home-3d-ui-container">
        <section className="hero-section-3d">
          <div className="hero-content">
            <h1 className="hero-headline">
              <RotatingText texts={rotatingWords} />
            </h1>
            <p className="hero-subtext">{t('home.hero.subtext', 'Automated Trading Solutions, Curated Crypto Vaults.')}</p>
            <div className="button-row">
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

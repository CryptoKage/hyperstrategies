// src/pages/Home.jsx
// This is the new root component for our 3D homepage experience.

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import GalaxyCanvas from '../components/GalaxyCanvas'; // Import our new 3D canvas

// We'll create a new, separate CSS file for this page to avoid conflicts.
import '../styles/home3d.css'; 

const Home = () => {
  const { t } = useTranslation();

  return (
    // We don't use the standard Layout here because this page is a fullscreen experience.
    // However, we will still include the Header and Footer manually.
    <div className="home-3d-wrapper">
      {/* The 3D canvas sits in the background, filling the entire screen. */}
      <GalaxyCanvas />

      {/* --- This is the HTML User Interface that sits ON TOP of the 3D canvas --- */}
      <div className="home-3d-ui-container">
        <section className="hero-section-3d">
          <div className="hero-content">
            <h1 className="hero-headline">
              {/* We can re-add the RotatingText later if we want */}
              HYPER-STRATEGIES
            </h1>
            <p className="hero-subtext">{t('home.hero.subtext', 'Automated Trading Solutions, Curated Crypto Vaults.')}</p>
            <div className="button-row">
              <Link to="/register" className="btn-primary btn-large">{t('home.hero.register_now', 'Register Now')}</Link>
              <Link to="/login" className="btn-outline btn-large">{t('home.hero.sign_in', 'Sign In')}</Link>
            </div>
          </div>
        </section>

        {/* This is a simple cue to tell users they can scroll. */}
        <div className="scroll-cue-3d">
          <span>Scroll Down to Explore</span>
          <div className="scroll-arrow">↓</div>
        </div>
      </div>
    </div>
  );
};

export default Home;

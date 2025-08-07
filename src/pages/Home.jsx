// src/pages/Home.jsx

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import RotatingText from '../components/RotatingText';
import useInstallPrompt from '../hooks/useInstallPrompt';
import useIsIOS from '../hooks/useIsIOS';
import AddToHomeScreenPrompt from '../components/AddToHomeScreenPrompt';

import Layout from '../components/Layout';
import ChartImage from '../assets/chart-placeholder.png';
import InteractiveBackground from '../components/InteractiveBackground';

const Home = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { promptInstall, canInstall, isAppInstalled } = useInstallPrompt();
  const { isIOS } = useIsIOS();
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);

  // --- MODIFIED --- Load rotating words and cards from the translation file
  const rotatingWords = t('home.rotating_words', { returnObjects: true }) || [];
const homePageCards = [
    { 
      icon: '🏆', 
      title: t('home.cards.airdrop.title'), 
      description: t('home.cards.airdrop.text'), 
      route: '/xpleaderboard',
      buttonText: t('card_section.select_button')
    },
    { 
      icon: '⚙️', 
      title: t('home.cards.self.title'), 
      description: t('home.cards.self.text'), 
      type: 'coming_soon',
      buttonText: t('home.cards.self.button')
    },
    { 
      icon: '📈', 
      title: t('home.cards.managed.title'), 
      description: t('home.cards.managed.text'), 
      route: '/login',
      buttonText: t('card_section.select_button')
    },
    { 
      icon: '💼', 
      title: t('home.cards.investor.title'), 
      description: t('home.cards.investor.text'), 
      type: 'link',
      url: '#', // Replace with your GitBook URL
      buttonText: t('home.cards.investor.button')
    },
  ];

  return (
    <>
      <Layout>
        <div className="hero-section-wrapper">
          <InteractiveBackground />
          <section className="hero-section">
            <div className="hero-content">
              <h1 className="hero-headline">
                <RotatingText
                  texts={rotatingWords}
                  mainClassName="text-rotate-bg"
                  staggerFrom="last"
                  rotationInterval={2500}
                  loop={'twice'}
                />
                -STRATEGIES
              </h1>
              <p className="hero-subtext">{t('home.hero.subtext')}</p>
              <div className="button-row">
                <a href="https://t.me/hyperstrategies" target="_blank" rel="noopener noreferrer" className="btn-primary">
                  {t('home.hero.join_community')}
                </a>
                
                {canInstall && !isAppInstalled && (
                  <button className="btn-outline" onClick={promptInstall}>
                    {t('home.hero.install_app')}
                  </button>
                )}
                
                {isIOS && !isAppInstalled && (
                  <button className="btn-outline" onClick={() => setShowIOSPrompt(true)}>
                    {t('home.hero.install_app')}
                  </button>
                )}
              </div>
            </div>
            <div className="hero-image-container">
              <img src={ChartImage} alt="Trading Chart" className="hero-image" />
            </div>
          </section>
        </div>

        <section className="path-selector-section">
          <h2>{t('home.cards.title')}</h2>
          <CardSection cards={homePageCards} />
        </section>
      </Layout>
      
      {showIOSPrompt && <AddToHomeScreenPrompt onClose={() => setShowIOSPrompt(false)} />}
    </>
  );
};

export default Home;

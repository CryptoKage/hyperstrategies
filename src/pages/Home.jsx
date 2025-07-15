// src/pages/Home.jsx

import React, { useState } from 'react'; // ✅ 1. Import useState here
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import RotatingText from '../components/RotatingText';
import useInstallPrompt from '../hooks/useInstallPrompt';
import useIsIOS from '../hooks/useIsIOS';
import AddToHomeScreenPrompt from '../components/AddToHomeScreenPrompt';

import Layout from '../components/Layout';
import CardSection from '../components/CardSection';
import ChartImage from '../assets/chart-placeholder.png';

const Home = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { promptInstall, canInstall, isAppInstalled } = useInstallPrompt();
  const { isIOS } = useIsIOS();
  const [showIOSPrompt, setShowIOSPrompt] = useState(false); // ✅ This is now correct

  const rotatingWords = ['EXPERIMENTAL', 'AUTOMATED', 'HEDGEFUND', 'SMART', 'HYPER'];

  const homePageCards = [
    { icon: '🏆', title: t('home.cards.airdrop.title'), description: t('home.cards.airdrop.text'), route: '/xpleaderboard' },
    { icon: '⚙️', title: t('home.cards.self.title'), description: t('home.cards.self.text'), route: '/self-serve' },
    { icon: '📈', title: t('home.cards.managed.title'), description: t('home.cards.managed.text'), route: '/managed' },
    { icon: '💼', title: t('home.cards.invest.title'), description: t('home.cards.invest.text'), route: '/investor' },
  ];

  return (
    <>
      <Layout>
        <section className="hero-section">
          <div className="hero-content">
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
                {t('home.hero.join_community')}
              </a>
              
              {/* --- ✅ 2. This is the new, complete button logic --- */}

              {/* Case 1: On a supported browser (Chrome/Edge) AND the app isn't installed */}
              {canInstall && !isAppInstalled && (
                <button className="btn-outline" onClick={promptInstall}>
                  {t('home.hero.install_app')}
                </button>
              )}
              
              {/* Case 2: On an iOS device AND the app isn't installed */}
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

        <section className="path-selector-section">
          <h2>{t('home.cards.title')}</h2>
          <CardSection cards={homePageCards} />
        </section>
      </Layout>
      
      {/* ✅ 3. Conditionally render the iOS prompt overlay */}
      {showIOSPrompt && <AddToHomeScreenPrompt onClose={() => setShowIOSPrompt(false)} />}
    </>
  );
};

export default Home;
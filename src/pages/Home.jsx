import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import RotatingText from '../components/RotatingText';
import useInstallPrompt from '../hooks/useInstallPrompt';
import useIsIOS from '../hooks/useIsIOS';
import AddToHomeScreenPrompt from '../components/AddToHomeScreenPrompt';
import InteractiveBackground from '../components/InteractiveBackground';
import PlasmaEffect from '../components/PlasmaEffect';

// --- THE FIX: We NO LONGER import the image here ---
// import ChartImage from '../assets/chart-placeholder.png';

const Home = () => {
  const { t, ready } = useTranslation();
  const navigate = useNavigate();
  const { promptInstall, canInstall, isAppInstalled } = useInstallPrompt();
  const { isIOS } = useIsIOS();
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  
  if (!ready) {
    return <div style={{ backgroundColor: '#040e21', height: '100vh' }}>Loading...</div>;
  }

  const rotatingWords = t('home.rotating_words', { returnObjects: true }) || [];
  
  const homePageCards = [
    { 
      icon: '🏆', 
      title: t('home.cards.airdrop.title'), 
      description: t('home.cards.airdrop.text'), 
      route: '/xpleaderboard',
      buttonText: t('card_section.view_leaderboard')
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
      buttonText: t('card_section.invest_now')
    },
    { 
      icon: '💼', 
      title: t('home.cards.investor.title'), 
      description: t('home.cards.investor.text'), 
      type: 'link',
      url: 'https://hyper-strategies.gitbook.io/hyper-strategies-docs/',
      buttonText: t('home.cards.investor.button')
    },
  ];

  return (
    <>
      <div className="home-page-wrapper">
        <PlasmaEffect />
        <InteractiveBackground />
        
        <div className="hero-section-wrapper">
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
                <Link to="/register" className="btn-primary btn-large">
                  {t('home.hero.register_now', 'Register Now')}
                </Link>
                <Link to="/login" className="btn-outline btn-large">
                  {t('home.hero.sign_in', 'Sign In')}
                </Link>
              </div>

            </div>
            <div className="hero-image-container">
              {/* --- THE FIX: Use a direct public path for the image src --- */}
              <img src="/images/chart-placeholder.png" alt="Trading Chart" className="hero-image" />
            </div>
          </section>
        </div>
        
        <section className="path-selector-section">
          { /* ... (rest of your card section code is perfect) ... */ }
        </section>
      </div>
      
      {showIOSPrompt && <AddToHomeScreenPrompt onClose={() => setShowIOSPrompt(false)} />}
    </>
  );
};

export default Home;

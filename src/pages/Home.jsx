import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import RotatingText from 'components/RotatingText'; // Using absolute path
import useInstallPrompt from 'hooks/useInstallPrompt'; // Using absolute path
import useIsIOS from 'hooks/useIsIOS';                 // Using absolute path
import AddToHomeScreenPrompt from 'components/AddToHomeScreenPrompt'; // Using absolute path
import InteractiveBackground from 'components/InteractiveBackground';   // Using absolute path
import PlasmaEffect from 'components/PlasmaEffect';                   // Using absolute path

// --- THE FIX: Use an absolute path from the 'src' directory ---
import ChartImage from 'assets/chart-placeholder.png'; 

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
              <img src={ChartImage} alt="Trading Chart" className="hero-image" />
            </div>
          </section>
        </div>
        
        <section className="path-selector-section">
          <h2>{t('home.cards.title')}</h2>
          <div className="card-grid">
            {homePageCards.map((card, idx) => (
              <div 
                key={idx} 
                className={`card ${card.type !== 'coming_soon' ? 'card--clickable' : ''}`}
                onClick={() => {
                  if (card.type === 'link') {
                    window.open(card.url, '_blank', 'noopener,noreferrer');
                  } else if (card.route) {
                    navigate(card.route);
                  }
                }}
              >
                <div className="card__icon">{card.icon}</div>
                <div className="card__content">
                  <h3 className="card__title">{card.title}</h3>
                  <p className="card__description">{card.description}</p>
                </div>
                <div className="card__footer">
                  <button 
                    className={card.type === 'coming_soon' ? 'btn-secondary' : 'btn-primary'}
                    disabled={card.type === 'coming_soon'}
                  >
                    {card.buttonText}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
      
      {showIOSPrompt && <AddToHomeScreenPrompt onClose={() => setShowIOSPrompt(false)} />}
    </>
  );
};

export default Home;

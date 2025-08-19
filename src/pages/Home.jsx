import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import RotatingText from '../components/RotatingText';
import useInstallPrompt from '../hooks/useInstallPrompt';
import useIsIOS from '../hooks/useIsIOS';
import AddToHomeScreenPrompt from '../components/AddToHomeScreenPrompt';
import Layout from '../components/Layout';
import ChartImage from '../assets/chart-placeholder.png';

const ConstellationSection = ({
  icon,
  title,
  description,
  buttonText,
  type,
  onClick,
}) => (
  <section className="constellation-section">
    <div className="card">
      <div className="card__icon">{icon}</div>
      <div className="card__content">
        <h3 className="card__title">{title}</h3>
        <p className="card__description">{description}</p>
      </div>
      <div className="card__footer">
        <button
          className={type === 'coming_soon' ? 'btn-secondary' : 'btn-primary'}
          disabled={type === 'coming_soon'}
          onClick={type === 'coming_soon' ? undefined : onClick}
        >
          {buttonText}
        </button>
      </div>
    </div>
  </section>
);

const Home = () => {
  const { t, ready } = useTranslation();
  const navigate = useNavigate();
  const { promptInstall, canInstall, isAppInstalled } = useInstallPrompt();
  const { isIOS } = useIsIOS();
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  
  if (!ready) {
    return <Layout><div>Loading...</div></Layout>;
  }

  const rotatingWords = t('home.rotating_words', { returnObjects: true }) || [];
  
  // --- REVERTED: Using the original homePageCards array structure ---
  const homePageCards = [
    { 
      icon: '🏆', 
      title: t('home.cards.airdrop.title'), 
      description: t('home.cards.airdrop.text'), 
      route: '/xpleaderboard',
      buttonText: t('home.cards.airdrop.button')
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
      buttonText: t('home.cards.managed.button')
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
      <Layout>
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
                <Link to="/register" className="btn-primary">{t('home.hero.register_now')}</Link>
                <Link to="/login" className="btn-outline">{t('home.hero.sign_in')}</Link>
                {/* Kept the install buttons as they are good UX */}
                {canInstall && !isAppInstalled && (
                  <button className="btn-outline" onClick={promptInstall}>{t('home.hero.install_app')}</button>
                )}
                {isIOS && !isAppInstalled && (
                  <button className="btn-outline" onClick={() => setShowIOSPrompt(true)}>{t('home.hero.install_app')}</button>
                )}
              </div>
            </div>
            {/* --- REVERTED: Added the ChartImage back --- */}
            <div className="hero-image-container">
              <img src={ChartImage} alt="Trading Chart" className="hero-image" />
            </div>
          </section>
        </div>
        
        <div className="constellation-wrapper">
          {homePageCards.map((card, idx) => (
            <ConstellationSection
              key={idx}
              icon={card.icon}
              title={card.title}
              description={card.description}
              buttonText={card.buttonText}
              type={card.type}
              onClick={() => {
                if (card.type === 'link') {
                  window.open(card.url, '_blank', 'noopener,noreferrer');
                } else if (card.route) {
                  navigate(card.route);
                }
              }}
            />
          ))}
        </div>
      </Layout>
      
      {showIOSPrompt && <AddToHomeScreenPrompt onClose={() => setShowIOSPrompt(false)} />}
    </>
  );
};

export default Home;

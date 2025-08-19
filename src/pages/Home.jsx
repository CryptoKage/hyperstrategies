import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import Layout from '../components/Layout';
import RotatingText from '../components/RotatingText';
import useInstallPrompt from '../hooks/useInstallPrompt';
import useIsIOS from '../hooks/useIsIOS';
import AddToHomeScreenPrompt from '../components/AddToHomeScreenPrompt';
import coreVaultBg from '../assets/core.png';
import apecoinVaultBg from '../assets/apecoin.png';

const Home = () => {
  const { t, ready } = useTranslation();
  const navigate = useNavigate();
  const { promptInstall, canInstall, isAppInstalled } = useInstallPrompt();
  const { isIOS } = useIsIOS();
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);

  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  // We'll adjust the scale animation to be more subtle
  const journeyScale = useTransform(scrollYProgress, [0, 1], [0.9, 1.1]);

  if (!ready) {
    return <Layout><div>Loading...</div></Layout>;
  }

  const rotatingWords = t('home.rotating_words', { returnObjects: true }) || [];
  
  return (
    <div className="home-page-container"> 
      <Layout>
        <motion.div style={{ opacity: heroOpacity }}>
          <section className="hero-section">
            <div className="hero-content">
              <h1 className="hero-headline">
                <RotatingText texts={rotatingWords} mainClassName="text-rotate-bg" />
                -STRATEGIES
              </h1>
              <p className="hero-subtext">{t('home.hero.subtext')}</p>
              <div className="button-row">
                <Link to="/register" className="btn-primary btn-large">{t('home.hero.register_now')}</Link>
                <Link to="/login" className="btn-outline btn-large">{t('home.hero.sign_in')}</Link>
                {canInstall && !isAppInstalled && (
                  <button className="btn-outline btn-large" onClick={promptInstall}>
                    {t('home.hero.install_app')}
                  </button>
                )}
                {isIOS && !isAppInstalled && (
                  <button className="btn-outline btn-large" onClick={() => setShowIOSPrompt(true)}>
                    {t('home.hero.install_app')}
                  </button>
                )}
              </div>
            </div>
          </section>
        </motion.div>

        <section className="journey-section">
          <h2>{t('home.journey.title')}</h2>
          <motion.div 
            className="card-grid-narrative"
            style={{ scale: journeyScale }}
          >
            {/* Card 1: The Vaults */}
            <div className="card-narrative">
              <div className="card-narrative-visual">
                <img src={coreVaultBg} alt="Core Vault" className="vault-preview-image" />
                <img src={apecoinVaultBg} alt="ApeCoin Vault" className="vault-preview-image behind" />
              </div>
              <div className="card__content">
                <h3 className="card__title">{t('home.journey.vaults.title')}</h3>
                <p className="card__description">{t('home.journey.vaults.description')}</p>
              </div>
              <div className="card__footer">
                <button className="btn-primary" onClick={() => navigate('/login')}>{t('home.journey.vaults.button')}</button>
              </div>
            </div>

            {/* Card 2: Competition & Rewards */}
            <div className="card-narrative">
               <div className="card-narrative-visual icon">🏆</div>
              <div className="card__content">
                <h3 className="card__title">{t('home.journey.rewards.title')}</h3>
                <p className="card__description">{t('home.journey.rewards.description')}</p>
              </div>
              <div className="card__footer">
                <button className="btn-primary" onClick={() => navigate('/xpleaderboard')}>{t('home.journey.rewards.button')}</button>
              </div>
            </div>

            {/* Card 3: The Future */}
            <div className="card-narrative">
              <div className="card-narrative-visual icon">⚙️</div>
              <div className="card__content">
                <h3 className="card__title">{t('home.journey.future.title')}</h3>
                <p className="card__description">{t('home.journey.future.description')}</p>
              </div>
              <div className="card__footer">
                <button className="btn-secondary" disabled>
                  {t('home.journey.future.button')}
                </button>
              </div>
            </div>

            {/* Card 4: The Library */}
            <div className="card-narrative">
              <div className="card-narrative-visual icon">📚</div>
              <div className="card__content">
                <h3 className="card__title">{t('home.journey.library.title')}</h3>
                <p className="card__description">{t('home.journey.library.description')}</p>
              </div>
              <div className="card__footer">
                <a href="https://hyper-strategies.gitbook.io/hyper-strategies-docs/" target="_blank" rel="noopener noreferrer" className="btn-primary">
                  {t('home.journey.library.button')}
                </a>
              </div>
            </div>
          {/* --- THIS IS THE MISSING CLOSING TAG --- */}
          </motion.div> 
        </section>
      </Layout>
      {showIOSPrompt && <AddToHomeScreenPrompt onClose={() => setShowIOSPrompt(false)} />}
    </div>
  );
};

export default Home;

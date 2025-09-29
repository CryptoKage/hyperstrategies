// /src/pages/HomePage.jsx

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import BlurText from '../components/BlurText'; // Import the new component

const Home = () => {
  const { t } = useTranslation();

  return (
    <Layout>
      <div className="home-container">
        {/* Hero Section */}
        <section className="hero-section">
          
          {/* The new BlurText component replaces the old RotatingText */}
          <BlurText
            text={t('home.hero.headline', 'HYPER-STRATEGIES')}
            direction="bottom"
            animateBy="words"
            className="hero-headline"
            delay={200}
          />

          <p className="hero-subtext">{t('home.hero.subtext', 'Automated Trading Solutions, Curated Crypto Vaults.')}</p>
          <div className="button-row">
            <Link to="/register" className="btn-primary btn-large">{t('home.hero.register_now', 'Register Now')}</Link>
            <Link to="/login" className="btn-outline btn-large">{t('home.hero.sign_in', 'Sign In')}</Link>
          </div>
        </section>

        <section className="home-journey" aria-labelledby="home-journey-title">
          <div className="home-section-heading">
            <span className="eyebrow-text">{t('home.journey.eyebrow', 'Three steps to momentum')}</span>
            <h2 id="home-journey-title">{t('home.journey.title', 'A guided flow for every member')}</h2>
            <p>
              {t(
                'home.journey.subtitle',
                'Whether you prefer to self-serve or go managed, follow the path below to activate capital, XP, and community perks.'
              )}
            </p>
          </div>

          <div className="home-journey__grid">
            <article className="home-journey__step">
              <span className="home-journey__badge">1</span>
              <h3>{t('home.journey.step_one_title', 'Create your account')}</h3>
              <p>
                {t(
                  'home.journey.step_one_copy',
                  'Register in minutes, secure your referral code, and get instant access to our dashboards on desktop or mobile.'
                )}
              </p>
              <div className="home-journey__actions">
                <Link to="/register" className="btn-pill">
                  {t('home.journey.step_one_cta', 'Start registration')} →
                </Link>
              </div>
            </article>

            <article className="home-journey__step">
              <span className="home-journey__badge">2</span>
              <h3>{t('home.journey.step_two_title', 'Select a vault experience')}</h3>
              <p>
                {t(
                  'home.journey.step_two_copy',
                  'Pick between automated strategies, managed portfolios, or investor-grade syndicates that match your risk appetite.'
                )}
              </p>
              <div className="home-journey__actions">
                <Link to="/dashboard" className="btn-pill">
                  {t('home.journey.step_two_cta', 'Explore vaults')} →
                </Link>
              </div>
            </article>

            <article className="home-journey__step">
              <span className="home-journey__badge">3</span>
              <h3>{t('home.journey.step_three_title', 'Equip pins & earn rewards')}</h3>
              <p>
                {t(
                  'home.journey.step_three_copy',
                  'Head to the new pins hub to curate your loadout, then claim XP boosts and rewards tailored to your tier.'
                )}
              </p>
              <div className="home-journey__actions">
                <Link to="/pins" className="btn-pill">
                  {t('home.journey.step_three_cta', 'Visit pins hub')} →
                </Link>
              </div>
            </article>
          </div>
        </section>

      </div>
    </Layout>
  );
};

export default Home;

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import RotatingText from '../components/RotatingText';

// Card Component - moved directly into Home.jsx for simplicity
// REMOVED link and linkText props as the entire card is now the link.
const Card = ({ title, text }) => (
  <div className="home-card">
    <h3>{title}</h3>
    <p>{text}</p>
  </div>
);

const Home = () => {
  const { t } = useTranslation();

  const rotatingWords = t('home.rotating_words', { returnObjects: true }) || [];

  return (
    <Layout>
      <div className="home-container">
        {/* Hero Section */}
        <section className="hero-section">
          <h1 className="hero-headline">
            <RotatingText texts={rotatingWords} suffix="-STRATEGIES" />
          </h1>
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
                <Link to="/register" className="btn-link">
                  {t('home.journey.step_one_cta', 'Start registration')}
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
                <Link to="/dashboard" className="btn-link">
                  {t('home.journey.step_two_cta', 'Explore vaults')}
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
                <Link to="/pins" className="btn-link">
                  {t('home.journey.step_three_cta', 'Visit pins hub')}
                </Link>
              </div>
            </article>
          </div>
        </section>

        {/* --- THIS IS THE CORRECTED CARDS SECTION --- */}
        <section className="card-section">
          {/* Card 1: Invest in Vaults (Links to Dashboard) */}
          <Link to="/dashboard" className="card-link-wrapper">
            <Card
              title={t('home.cards.managed.title', 'Managed Vaults')}
              text={t('home.cards.managed.text', 'Access our flagship strategies with active, discretionary management.')}
            />
          </Link>

          {/* Card 2: Automated Strategies (No Link, so no wrapper) */}
          <Card
            title={t('home.cards.automated.title', 'Automated Strategies')}
            text={t('home.cards.automated.text', 'Explore fully-automated, quantitative strategies trading 24/7.')}
          />

          {/* Card 3: Syndicates (Links to Profile) */}
          <Link to="/profile" className="card-link-wrapper">
            <Card
              title={t('home.cards.syndicate.title', 'Community Syndicates')}
              text={t('home.cards.syndicate.text', 'Join with your community to unlock shared benefits and revenue streams.')}
            />
          </Link>
          
          {/* Card 4: XP System (Links to Rewards) */}
          <Link to="/rewards" className="card-link-wrapper">
            <Card
              title={t('home.cards.referral.title', 'Referral & XP System')}
              text={t('home.cards.referral.text', 'Earn XP, climb tiers, and unlock rewards by inviting others to the platform.')}
            />
          </Link>
        </section>
      </div>
    </Layout>
  );
};

export default Home;

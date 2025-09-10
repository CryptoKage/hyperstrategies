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

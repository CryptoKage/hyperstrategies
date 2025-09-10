import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import RotatingText from '../components/RotatingText';

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
          <p className="hero-subtext">{t('home.hero.subtext')}</p>
          <div className="button-row">
            <Link to="/register" className="btn-primary btn-large">{t('home.hero.register_now')}</Link>
            <Link to="/login" className="btn-outline btn-large">{t('home.hero.sign_in')}</Link>
          </div>
        </section>

        {/* Cards Section */}
        <section className="card-section">
          <Link to="/dashboard" className="card-link-wrapper"><Card title={t('home.cards.managed.title')} text={t('home.cards.managed.text')} /></Link>
          <Card title={t('home.cards.automated.title')} text={t('home.cards.automated.text')} />
          <Link to="/profile" className="card-link-wrapper"><Card title={t('home.cards.syndicate.title')} text={t('home.cards.syndicate.text')} /></Link>
          <Link to="/rewards" className="card-link-wrapper"><Card title={t('home.cards.referral.title')} text={t('home.cards.referral.text')} /></Link>
        </section>
      </div>
    </Layout>
  );
};

export default Home;

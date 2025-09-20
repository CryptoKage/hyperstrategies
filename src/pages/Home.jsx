import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import RotatingText from '../components/RotatingText';
import GalaxyCanvas from '../components/GalaxyCanvas';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';
import { useAnimationSettings } from '../context/AnimationSettingsContext';

const floatingCardKeys = ['managed', 'airdrop', 'self'];
const gridCardKeys = ['managed', 'airdrop', 'self', 'investor'];

const cardFallbacks = {
  managed: {
    title: 'Managed Vaults',
    text: 'Access our flagship strategies with active, discretionary management.',
    link: '/login',
  },
  airdrop: {
    title: 'XP, Tiers & Leaderboard',
    text: 'Engage with the platform to earn XP, climb account tiers, and compete for future token allocations.',
    link: '/xpleaderboard',
  },
  self: {
    title: 'Strategy Builder Engine',
    text: 'Coming Soon: A powerful engine to build, backtest, and deploy your own automated trading strategies.',
    link: '',
  },
  investor: {
    title: 'Hyper Strategies Info',
    text: 'Learn about Hyper-Strategies from our Gitbook.',
    link: 'https://hyper-strategies.gitbook.io/hyper-strategies-docs/',
  },
};

const Card = ({ title, text, isHighlighted }) => (
  <div className={`home-card${isHighlighted ? ' home-card--active' : ''}`}>
    <h3>{title}</h3>
    <p>{text}</p>
  </div>
);

const isExternalLink = (link) => /^https?:\/\//i.test(link);

const Home = () => {
  const { t } = useTranslation();
  const prefersReducedMotion = usePrefersReducedMotion();
  const { settings } = useAnimationSettings();
  const { general: { showNetwork } = { showNetwork: true } } = settings || {};

  const rotatingWords = t('home.rotating_words', { returnObjects: true }) || [];

  const floatingCards = useMemo(
    () => floatingCardKeys.map((key) => {
      const fallback = cardFallbacks[key] || { title: key, text: '' };
      return {
        key,
        title: t(`home.cards.${key}.title`, { defaultValue: fallback.title }),
        description: t(`home.cards.${key}.text`, { defaultValue: fallback.text }),
      };
    }),
    [t],
  );

  const [activeCardIndex, setActiveCardIndex] = useState(0);

  useEffect(() => {
    if (!floatingCards.length) {
      setActiveCardIndex(0);
      return;
    }

    if (activeCardIndex > floatingCards.length - 1) {
      setActiveCardIndex(floatingCards.length - 1);
    }
  }, [activeCardIndex, floatingCards.length]);

  const handleScrollUpdate = useCallback((value) => {
    if (!floatingCards.length) {
      return;
    }

    const clamped = Math.min(Math.max(value, 0), 1);
    const nextIndex = Math.min(floatingCards.length - 1, Math.round(clamped * (floatingCards.length - 1)));
    setActiveCardIndex((prev) => (prev === nextIndex ? prev : nextIndex));
  }, [floatingCards.length]);

  const activeCardKey = floatingCards[activeCardIndex]?.key;

  const gridCards = useMemo(
    () => gridCardKeys.map((key) => {
      const fallback = cardFallbacks[key] || { title: key, text: '', link: '' };
      const title = t(`home.cards.${key}.title`, { defaultValue: fallback.title });
      const description = t(`home.cards.${key}.text`, { defaultValue: fallback.text });
      const link = t(`home.cards.${key}.link`, { defaultValue: fallback.link || '' });
      return {
        key,
        title,
        description,
        link: link && link !== `home.cards.${key}.link` ? link : '',
      };
    }),
    [t],
  );

  const floatingCardCount = floatingCards.length;
  const enableGalaxy = showNetwork && !prefersReducedMotion && floatingCardCount > 0;

  const scrollSections = Math.max(floatingCardCount, 1);
  const scrollSpaceHeight = useMemo(() => {
    if (!enableGalaxy) {
      return undefined;
    }

    const totalSections = scrollSections + 1;
    const baseHeight = totalSections * 90;
    return `${Math.max(baseHeight, 240)}vh`;
  }, [enableGalaxy, scrollSections]);

  const homeContent = (
    <div className={`home-container${enableGalaxy ? ' home-container--floating' : ''}`}>
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

      <section className={`card-section${enableGalaxy ? ' card-section--floating' : ''}`}>
        {gridCards.map((card) => {
          const isHighlighted = enableGalaxy && card.key === activeCardKey;
          const cardElement = <Card title={card.title} text={card.description} isHighlighted={isHighlighted} />;

          if (!card.link) {
            return (
              <div key={card.key} className="card-link-wrapper">
                {cardElement}
              </div>
            );
          }

          if (isExternalLink(card.link)) {
            return (
              <a
                key={card.key}
                href={card.link}
                className="card-link-wrapper"
                target="_blank"
                rel="noreferrer"
              >
                {cardElement}
              </a>
            );
          }

          return (
            <Link key={card.key} to={card.link} className="card-link-wrapper">
              {cardElement}
            </Link>
          );
        })}
      </section>
    </div>
  );

  return (
    <Layout showInteractiveBackground={!enableGalaxy} showPlasmaBackground={!enableGalaxy}>
      {enableGalaxy ? (
        <div id="home-3d-wrapper" className="home-3d-wrapper">
          <GalaxyCanvas cards={floatingCards} onScrollUpdate={handleScrollUpdate} />
          <div className="home-3d-ui-container">
            {homeContent}
          </div>
          <div className="home-3d-scroll-space" style={{ height: scrollSpaceHeight }} aria-hidden />
        </div>
      ) : (
        homeContent
      )}
    </Layout>
  );
};

export default Home;

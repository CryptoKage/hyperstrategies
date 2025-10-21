import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import FlowDiagram from '../components/HowItWorks/FlowDiagram';
import StrategyGrid from '../components/HowItWorks/StrategyGrid';
import ProtectionsGrid from '../components/HowItWorks/ProtectionsGrid';
import MetricsPanel from '../components/HowItWorks/MetricsPanel';
import SceneNavigation from '../components/HowItWorks/SceneNavigation';
import flows from '../data/flows.json';
import strategies from '../data/strategies.json';
import protections from '../data/protections.json';
import '../styles/how-it-works.css';

const sceneCopy = [
  {
    id: 0,
    headline: 'Let your capital move intelligently.',
    body: 'Deposit once. Hyper Strategies automatically routes capital between vaults, safety funds, and upcoming initiatives — so your money is always working.',
  },
  {
    id: 1,
    headline: 'The money flow.',
    body: 'On deposit, 80% enters active strategies and 20% routes to the Safety Fund, farming protocols, and our token seeding pool.',
  },
  {
    id: 2,
    headline: 'Our strategies.',
    body: 'Two vaults today: the Core Strategy for balanced growth, and a High-Risk Strategy for amplified exposure on more volatile pairs.',
  },
  {
    id: 3,
    headline: 'Inside a strategy.',
    body: 'Signals → positions → risk controls → rebalance → realize PnL → compound. Algorithmic trading with discretionary overlays and dynamic trailing stops.',
  },
  {
    id: 4,
    headline: 'Security and sustainability.',
    body: 'A portion of deposits strengthens the Safety Fund and is deployed to farming protocols; the buy-back engine and token seeding align long-term incentives.',
  },
  {
    id: 5,
    headline: 'Transparent performance.',
    body: 'Fees use a high-watermark model: 20% of profits after the watermark. Track results and understand variability over time.',
  },
  {
    id: 6,
    headline: 'Community & Syndicates.',
    body: 'Earn through syndicate participation and transparent on-chain rewards. Share performance responsibly and grow together.',
  },
  {
    id: 7,
    headline: 'Ready to start?',
    body: 'Connect your wallet and choose a vault. You can withdraw at any time, subject to venue conditions and market liquidity.',
  },
];

const metrics = [
  { label: 'Net deposits', value: 1250000, suffix: '+', description: 'Illustrative cumulative deposits across Hyper Strategies vaults.' },
  { label: 'Win rate', value: 63, suffix: '%', description: 'Representative win rate from algorithmic and discretionary blends.' },
  { label: 'Max drawdown', value: 18, suffix: '%', description: 'Target maximum drawdown under stressed conditions.' },
  { label: 'Sharpe (informational)', value: 1.8, suffix: '×', description: 'Informational Sharpe ratio using trailing performance.' },
];

const usePrefersReducedMotion = () => {
  const [prefers, setPrefers] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return undefined;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = (event) => setPrefers(event.matches);

    setPrefers(mediaQuery.matches);
    mediaQuery.addEventListener('change', updatePreference);

    return () => mediaQuery.removeEventListener('change', updatePreference);
  }, []);

  return prefers;
};

const HowItWorks = () => {
  const reducedMotion = usePrefersReducedMotion();
  const [activeScene, setActiveScene] = useState(0);
  const sectionRefs = useRef([]);
  const observerRef = useRef(null);

  const registerSection = (index) => (element) => {
    sectionRefs.current[index] = element;
  };

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sceneIndex = Number(entry.target.dataset.sceneIndex);
            setActiveScene(sceneIndex);
          }
        });
      },
      { rootMargin: '-35% 0px -50% 0px', threshold: 0.35 }
    );

    sectionRefs.current.forEach((section) => {
      if (section) observer.observe(section);
    });

    observerRef.current = observer;

    return () => observer.disconnect();
  }, [sceneCopy.length]);

  const handleJump = (index) => {
    const target = sectionRefs.current[index];
    if (target) {
      target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    }
  };

  const strategySteps = useMemo(
    () => [
      'Signal engine listens for quant + discretionary triggers.',
      'Positions are sized with risk controls and scenario checks.',
      'Trailing stops and hedges manage downside in real time.',
      'Positions rebalance as data changes — or flatten entirely.',
      'PnL is realized, fees are calculated above the high-watermark.',
      'Profits compound back into active strategies and reserves.',
    ],
    []
  );

  return (
    <Layout showInteractiveBackground={false}>
      <div className="hiw-page">
        <SceneNavigation scenes={sceneCopy} activeScene={activeScene} onJump={handleJump} />

        <div className="hiw-content">
          {sceneCopy.map((scene, index) => (
            <section
              key={scene.id}
              className="hiw-section"
              id={`scene-${scene.id}`}
              ref={registerSection(index)}
              data-scene-index={index}
              aria-labelledby={`scene-${scene.id}-title`}
            >
              <div className="hiw-section__header">
                <p className="hiw-section__eyebrow">Scene {index + 1}</p>
                <h2 id={`scene-${scene.id}-title`}>{scene.headline}</h2>
                <p className="hiw-section__body">{scene.body}</p>
              </div>

              {index === 0 && (
                <div className="hiw-hero">
                  <p>
                    Hyper Strategies is built for people who want disciplined automation without giving up transparency. Learn how deposits route, how risk is managed, and where community rewards originate.
                  </p>
                  <div className="hiw-cta-row">
                    <Link to="/register" className="btn-primary">Connect wallet</Link>
                    <a href="https://docs.hyper-strategies.com" className="btn-outline" target="_blank" rel="noreferrer">
                      Read the docs
                    </a>
                  </div>
                  {reducedMotion && (
                    <p className="hiw-reduced-motion" role="status">
                      Animations are minimized due to your system settings.
                    </p>
                  )}
                </div>
              )}

              {index === 1 && (
                <div className="hiw-section__module">
                  <FlowDiagram data={flows} reducedMotion={reducedMotion} />
                  {flows.notes && (
                    <ul className="hiw-notes">
                      {flows.notes.map((note) => (
                        <li key={note}>{note}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {index === 2 && (
                <div className="hiw-section__module">
                  <StrategyGrid strategies={strategies} />
                  <div className="hiw-links">
                    <Link to="/strategies" className="btn-outline">
                      Explore strategies
                    </Link>
                    <Link to="/legal" className="hiw-inline-link">
                      Read risk disclosure
                    </Link>
                  </div>
                </div>
              )}

              {index === 3 && (
                <div className="hiw-section__module">
                  <ol className="hiw-steps">
                    {strategySteps.map((step, stepIndex) => (
                      <li key={step} style={{ transitionDelay: `${stepIndex * 80}ms` }}>
                        <span className="hiw-steps__index">{stepIndex + 1}</span>
                        <p>{step}</p>
                      </li>
                    ))}
                  </ol>
                  <p className="hiw-disclaimer">
                    Automation is complemented by discretionary oversight. Controls pause strategies during extreme market or venue events.
                  </p>
                </div>
              )}

              {index === 4 && (
                <div className="hiw-section__module">
                  <ProtectionsGrid protections={protections} />
                </div>
              )}

              {index === 5 && (
                <div className="hiw-section__module">
                  <MetricsPanel metrics={metrics} reducedMotion={reducedMotion} />
                  <p className="hiw-disclaimer">
                    Metrics are illustrative and do not represent guaranteed performance. Always evaluate risk and variability before depositing capital.
                  </p>
                </div>
              )}

              {index === 6 && (
                <div className="hiw-section__module">
                  <div className="hiw-community">
                    <p>
                      Syndicates share curated updates, on-chain dashboards, and referral boosts. Participation earns XP and revenue share tied to verified growth milestones.
                    </p>
                    <ul>
                      <li>On-chain rewards distributed with transparent calculations.</li>
                      <li>Community guidelines require responsible sharing of performance.</li>
                      <li>Alignment with Safety Fund and buy-back programs keeps incentives balanced.</li>
                    </ul>
                    <Link to="/investor" className="btn-outline">
                      Learn about investor onboarding
                    </Link>
                  </div>
                </div>
              )}

              {index === 7 && (
                <div className="hiw-section__module hiw-section__module--cta">
                  <div className="hiw-final-cta">
                    <p>
                      Ready to experience Hyper Strategies? Connect your wallet, choose a vault, and monitor performance with transparency-first reporting.
                    </p>
                    <div className="hiw-cta-row">
                      <Link to="https://app.hyper-strategies.com" className="btn-primary" target="_blank" rel="noreferrer">
                        Launch app
                      </Link>
                      <Link to="/faq" className="btn-outline">
                        Visit the FAQ
                      </Link>
                    </div>
                    <p className="hiw-footnote">
                      Availability may vary by jurisdiction and user eligibility. Digital assets are highly volatile; never invest more than you can afford to lose.
                    </p>
                  </div>
                </div>
              )}
            </section>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default HowItWorks;

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import FlowDiagram from '../components/HowItWorks/FlowDiagram';
import StrategyGrid from '../components/HowItWorks/StrategyGrid';
import ProtectionsGrid from '../components/HowItWorks/ProtectionsGrid';
import MetricsPanel from '../components/HowItWorks/MetricsPanel';
import SceneNavigation from '../components/HowItWorks/SceneNavigation';
import FAQAccordion from '../components/HowItWorks/FAQAccordion';
import CookieBanner from '../components/CookieBanner';
import content from '../data/howItWorksContent.json';
import '../styles/how-it-works.css';

const {
  scenes: sceneCopy,
  flows,
  strategies,
  protections,
  tooltips,
  metricsLabels,
  chartsLegend,
  faq,
  disclosures,
  legal,
  a11y,
  seo,
  consent,
  cta,
  nav,
} = content;

const metricData = [
  {
    key: 'netDeposits',
    value: 1250000,
    prefix: '$',
    description: 'Illustrative cumulative deposits across Hyper Strategies vaults.',
  },
  {
    key: 'pnl',
    value: 320000,
    prefix: '+$',
    description: 'Illustrative profits after fees using a high-watermark model.',
    tooltipKey: 'performanceFee',
  },
  {
    key: 'drawdown',
    value: 18,
    suffix: '%',
    description: 'Target maximum drawdown under stressed conditions.',
  },
  {
    key: 'winRate',
    value: 63,
    suffix: '%',
    description: 'Representative win rate from algorithmic and discretionary blends.',
  },
  {
    key: 'sharpe',
    value: 1.8,
    suffix: '×',
    decimals: 1,
    description: 'Informational Sharpe ratio calculated on illustrative trailing performance.',
    tooltipKey: 'highWatermark',
  },
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
    if (!seo || typeof document === 'undefined') {
      return undefined;
    }

    document.title = seo.title;

    const ensureMeta = (attribute, attributeValue) => {
      if (!attributeValue) return null;
      let tag = document.querySelector(`meta[${attribute}="${attributeValue}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attribute, attributeValue);
        document.head.appendChild(tag);
      }
      return tag;
    };

    const descriptionTag = ensureMeta('name', 'description');
    if (descriptionTag && seo.description) {
      descriptionTag.setAttribute('content', seo.description);
    }

    if (Array.isArray(seo.keywords)) {
      const keywordsTag = ensureMeta('name', 'keywords');
      if (keywordsTag) {
        keywordsTag.setAttribute('content', seo.keywords.join(', '));
      }
    }

    if (seo.ogImage) {
      const ogImageTag = ensureMeta('property', 'og:image');
      if (ogImageTag) {
        ogImageTag.setAttribute('content', seo.ogImage);
      }
    }

    return undefined;
  }, []);

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

  const metrics = useMemo(() => metricData, []);

  const chartLegendItems = useMemo(
    () =>
      Object.entries(chartsLegend || {}).map(([key, label]) => ({
        key,
        label,
      })),
    [chartsLegend]
  );

  const strategySteps = useMemo(
    () => [
      'Signal engine listens for quant + discretionary triggers.',
      'Positions are sized with risk controls and scenario checks.',
      (
        <>
          Trailing stops —
          {' '}
          <abbr title={tooltips?.trailingStop || ''}>dynamic guards</abbr>
          {' '}
          manage downside in real time.
        </>
      ),
      'Positions rebalance as data changes — or flatten entirely.',
      'PnL is realized, fees are calculated above the high-watermark.',
      'Profits compound back into active strategies and reserves.',
    ],
    [tooltips?.trailingStop]
  );

  return (
    <Layout showInteractiveBackground={false}>
      <div className="hiw-page">
        <SceneNavigation
          scenes={sceneCopy}
          activeScene={activeScene}
          onJump={handleJump}
          ariaLabel={a11y?.aria?.sceneNav}
        />

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
                    <Link to="/register" className="btn-primary">{cta?.primary || 'Connect wallet'}</Link>
                    <a href="https://docs.hyper-strategies.com" className="btn-outline" target="_blank" rel="noreferrer">
                      {cta?.seeDocs || 'Read the docs'}
                    </a>
                  </div>
                  {reducedMotion && (
                    <p className="hiw-reduced-motion" role="status">
                      {a11y?.reducedMotionNote}
                    </p>
                  )}
                </div>
              )}

              {index === 1 && (
                <div className="hiw-section__module">
                  <FlowDiagram
                    data={flows}
                    reducedMotion={reducedMotion}
                    ariaLabel={a11y?.alt?.moneyFlow}
                    tooltip={tooltips?.depositSplit}
                  />
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
                      {cta?.secondary || 'Explore strategies'}
                    </Link>
                    <Link to="/legal" className="hiw-inline-link">
                      {cta?.viewLegal || 'View legal'}
                    </Link>
                  </div>
                </div>
              )}

              {index === 3 && (
                <div className="hiw-section__module">
                  <ol className="hiw-steps">
                    {strategySteps.map((step, stepIndex) => (
                      <li key={`step-${stepIndex}`} style={{ transitionDelay: `${stepIndex * 80}ms` }}>
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
                  <MetricsPanel
                    metrics={metrics}
                    reducedMotion={reducedMotion}
                    labelMap={metricsLabels}
                    tooltips={tooltips}
                    legend={chartLegendItems}
                    chartAriaLabel={a11y?.alt?.chart}
                  />
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
                      {scene.body}
                    </p>
                    <div className="hiw-cta-row">
                      <Link to="https://app.hyper-strategies.com" className="btn-primary" target="_blank" rel="noreferrer">
                        {nav?.cta?.label || 'Launch app'}
                      </Link>
                      <Link to="/faq" className="btn-outline">
                        {cta?.learnMore || 'Learn more'}
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
          <section className="hiw-faq-section">
            <div className="hiw-section__header">
              <p className="hiw-section__eyebrow">Questions</p>
              <h2>Frequently asked</h2>
              <p className="hiw-section__body">Still curious? Explore the highlights below.</p>
            </div>
            <FAQAccordion items={faq} ariaLabels={a11y?.aria} />
          </section>

          <section className="hiw-disclosures" aria-labelledby="disclosures-heading">
            <h2 id="disclosures-heading">Disclosures</h2>
            <ul>
              {Object.entries(disclosures || {}).map(([key, value]) => (
                <li key={key}>{value}</li>
              ))}
            </ul>
            <div className="hiw-legal-links">
              {legal?.links?.map((link) => (
                <Link key={link.href} to={link.href} className="hiw-inline-link">
                  {link.label}
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
      <CookieBanner banner={consent?.cookieBanner} />
    </Layout>
  );
};

export default HowItWorks;

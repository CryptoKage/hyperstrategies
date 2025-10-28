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
import copy from '../data/site_copy.json';
import { useTranslation } from 'react-i18next';
import '../styles/how-it-works.css';

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
  const { t } = useTranslation();

  const scenes = useMemo(
    () =>
      (copy.scenes || []).map((scene) => {
        const baseKey = scene.key || `scenes.${scene.id}`;
        return {
          ...scene,
          headline: t(`${baseKey}.headline`, { defaultValue: scene.headline }),
          body: t(`${baseKey}.body`, { defaultValue: scene.body }),
        };
      }),
    [t]
  );

  const flowData = useMemo(() => {
    const distribution = copy.flow?.distribution ?? {};
    const labels = copy.flow?.labels ?? {};
    const mainPercent = flows.mainPercent ?? 80;
    const sideTotal = Math.max(0, 100 - mainPercent);
    const sideFlows = [
      { key: 'safety', fallback: flows.sideFlows?.[0] },
      { key: 'farming', fallback: flows.sideFlows?.[1] },
      { key: 'token', fallback: flows.sideFlows?.[2] },
    ]
      .map(({ key, fallback }) => {
        const proportion = distribution[key];
        const percent =
          typeof proportion === 'number'
            ? Math.round(proportion * sideTotal)
            : fallback?.percent;
        const label = labels[key] || fallback?.label;
        if (!label || percent == null) {
          return null;
        }
        return {
          label,
          percent,
          color: fallback?.color,
        };
      })
      .filter(Boolean);

    return {
      depositLabel: labels.deposit || t('flow.deposit', { defaultValue: flows.depositLabel }),
      mainFlowLabel: labels.main || flows.mainFlowLabel,
      mainPercent,
      sideFlows,
      notes: (flows.notes || []).map((note, index) =>
        t(`flow.notes.${index}`, { defaultValue: note })
      ),
    };
  }, [t]);

  const strategiesData = useMemo(
    () =>
      strategies.map((strategy) => {
        const baseKey = `cards.${strategy.id}`;
        return {
          ...strategy,
          name: t(`${baseKey}.title`, { defaultValue: strategy.name }),
          short: t(`${baseKey}.body`, { defaultValue: strategy.short }),
          risk: strategy.risk,
          badges: strategy.badges,
          disclaimer: strategy.disclaimer
            ? t(`${baseKey}.disclaimer`, { defaultValue: strategy.disclaimer })
            : strategy.disclaimer,
        };
      }),
    [t]
  );

  const protectionsData = useMemo(
    () =>
      protections.map((protection) => {
        const baseKey = `protections.${protection.icon}`;
        return {
          ...protection,
          title: t(`${baseKey}.title`, { defaultValue: protection.title }),
          body: t(`${baseKey}.body`, { defaultValue: protection.body }),
        };
      }),
    [t]
  );

  const metrics = useMemo(
    () => [
      {
        label: t('howItWorks.metrics.netDeposits', { defaultValue: 'Net deposits' }),
        value: 40000,
        suffix: '+',
        description: t('howItWorks.metrics.netDepositsDescription', {
          defaultValue: 'Illustrative cumulative deposits across Hyper Strategies vaults.',
        }),
      },
      {
        label: t('howItWorks.metrics.winRate', { defaultValue: 'Win rate' }),
        value: 29.8,
        suffix: '%',
        description: t('howItWorks.metrics.winRateDescription', {
          defaultValue: 'Representative win rate from algorithmic and discretionary blends.',
        }),
      },
      {
        label: t('howItWorks.metrics.maxDrawdown', { defaultValue: 'Max drawdown' }),
        value: 2,
        suffix: '%',
        description: t('howItWorks.metrics.maxDrawdownDescription', {
          defaultValue: 'Target maximum drawdown under stressed conditions.',
        }),
      },
      {
        label: t('howItWorks.metrics.sharpe', { defaultValue: 'Sharpe (informational)' }),
        value: 1.8,
        suffix: '×',
        description: t('howItWorks.metrics.sharpeDescription', {
          defaultValue: 'Informational Sharpe ratio using trailing performance.',
        }),
      },
    ],
    [t]
  );

  useEffect(() => {
    sectionRefs.current = sectionRefs.current.slice(0, scenes.length);
  }, [scenes.length]);

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
  }, [scenes.length]);

  const registerSection = (index) => (element) => {
    sectionRefs.current[index] = element;
    if (element) {
      element.dataset.sceneIndex = index;
    }
  };

  const handleJump = (index) => {
    const target = sectionRefs.current[index];
    if (target) {
      target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    }
  };

  const strategySteps = useMemo(() => {
    if (Array.isArray(copy.innerLoop) && copy.innerLoop.length > 0) {
      return copy.innerLoop.map((step, stepIndex) =>
        t(`howItWorks.innerLoop.${stepIndex}`, {
          defaultValue: `${step}`,
        })
      );
    }

    return [
      'Signal engine listens for quant + discretionary triggers.',
      'Positions are sized with risk controls and scenario checks.',
      'Trailing stops and hedges manage downside in real time.',
      'Positions rebalance as data changes — or flatten entirely.',
      'PnL is realized, fees are calculated above the high-watermark.',
      'Profits compound back into active strategies and reserves.',
    ];
  }, [t]);

  return (
    <Layout showInteractiveBackground={false}>
      <div className="hiw-page">
        <SceneNavigation scenes={scenes} activeScene={activeScene} onJump={handleJump} />

        <div className="hiw-content">
          {scenes.map((scene, index) => (
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
                    {t('howItWorks.hero.body', {
                      defaultValue:
                        'Hyper Strategies is built for people who want disciplined automation without giving up transparency. Learn how deposits route, how risk is managed, and where community rewards originate.',
                    })}
                  </p>
                  <div className="hiw-cta-row">
                    <Link to="/register" className="btn-primary">
                      {t('cta.connect')}
                    </Link>
                    <a
                      href="https://hs0-3.gitbook.io/hs-docs/"
                      className="btn-outline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {t('howItWorks.hero.readDocs', { defaultValue: 'Read the docs' })}
                    </a>
                  </div>
                  {reducedMotion && (
                    <p className="hiw-reduced-motion" role="status">
                      {t('howItWorks.hero.reducedMotion', {
                        defaultValue: 'Animations are minimized due to your system settings.',
                      })}
                    </p>
                  )}
                </div>
              )}

              {index === 1 && (
                <div className="hiw-section__module">
                  <FlowDiagram data={flowData} reducedMotion={reducedMotion} />
                  {flowData.notes?.length > 0 && (
                    <ul className="hiw-notes">
                      {flowData.notes.map((note, noteIndex) => (
                        <li key={`${note}-${noteIndex}`}>{note}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {index === 2 && (
                <div className="hiw-section__module">
                  <StrategyGrid strategies={strategiesData} />
                  <div className="hiw-links">
                    <Link to="/dashboard" className="btn-outline">
                      {t('cta.explore')}
                    </Link>
                    <Link to="/legal" className="hiw-inline-link">
                      {t('howItWorks.links.riskDisclosure', { defaultValue: 'Read risk disclosure' })}
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
                    {t('howItWorks.steps.disclaimer', {
                      defaultValue:
                        'Automation is complemented by discretionary oversight. Controls pause strategies during extreme market or venue events.',
                    })}
                  </p>
                </div>
              )}

              {index === 4 && (
                <div className="hiw-section__module">
                  <ProtectionsGrid protections={protectionsData} />
                </div>
              )}

              {index === 5 && (
                <div className="hiw-section__module">
                  <MetricsPanel metrics={metrics} reducedMotion={reducedMotion} />
                  <p className="hiw-disclaimer">
                    {t('howItWorks.metrics.disclaimer', {
                      defaultValue:
                        'Metrics are illustrative and do not represent guaranteed performance. Always evaluate risk and variability before depositing capital.',
                    })}
                  </p>
                </div>
              )}

              {index === 6 && (
                <div className="hiw-section__module">
                  <div className="hiw-community">
                    <p>
                      {t('howItWorks.community.body', {
                        defaultValue:
                          'Syndicates share curated updates, on-chain dashboards, and referral boosts. Participation earns XP and revenue share tied to verified growth milestones.',
                      })}
                    </p>
                    <ul>
                      <li>
                        {t('howItWorks.community.bulletOne', {
                          defaultValue: 'On-chain rewards distributed with transparent calculations.',
                        })}
                      </li>
                      <li>
                        {t('howItWorks.community.bulletTwo', {
                          defaultValue: 'Community guidelines require responsible sharing of performance.',
                        })}
                      </li>
                      <li>
                        {t('howItWorks.community.bulletThree', {
                          defaultValue: 'Alignment with Safety Fund and buy-back programs keeps incentives balanced.',
                        })}
                      </li>
                    </ul>
                    <Link to="/investor" className="btn-outline">
                      {t('howItWorks.community.cta', { defaultValue: 'Learn about investor onboarding' })}
                    </Link>
                  </div>
                </div>
              )}

              {index === 7 && (
                <div className="hiw-section__module hiw-section__module--cta">
                  <div className="hiw-final-cta">
                    <p>
                      {t('howItWorks.final.body', {
                        defaultValue:
                          'Ready to experience Hyper Strategies? Connect your wallet, choose a vault, and monitor performance with transparency-first reporting.',
                      })}
                    </p>
                    <div className="hiw-cta-row">
                      <Link
                        to="https://app.hyper-strategies.com"
                        className="btn-primary"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {t('howItWorks.final.launch', { defaultValue: 'Launch app' })}
                      </Link>
                      <Link to="/faq" className="btn-outline">
                        {t('howItWorks.final.faq', { defaultValue: 'Visit the FAQ' })}
                      </Link>
                    </div>
                    <p className="hiw-footnote">
                      {t('howItWorks.final.footnote', {
                        defaultValue:
                          'Availability may vary by jurisdiction and user eligibility. Digital assets are highly volatile; never invest more than you can afford to lose.',
                      })}
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

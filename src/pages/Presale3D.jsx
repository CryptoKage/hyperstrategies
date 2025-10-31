import React, { useEffect, useMemo, useRef, useState } from 'react';
import Layout from '../components/Layout';
import FlowSceneCubes from '../components/HowItWorks3D/FlowSceneCubes';
import ScrollSceneController from '../components/HowItWorks3D/ScrollSceneController';
import ParallaxFallback from '../components/HowItWorks3D/ParallaxFallback';
import ViewToggle from '../components/ViewToggle';
import { useTranslation } from 'react-i18next';
import '../styles/how-it-works-rail.css';

const SCROLL_SCENES = [
  { id: 'overview', start: 0, end: 0.18 },
  { id: 'moneyFlow', start: 0.18, end: 0.45 },
  { id: 'strategy', start: 0.45, end: 0.72 },
  { id: 'innerLoop', start: 0.72, end: 1 },
];

const Presale3D = () => {
  const railRef = useRef(null);
  const canvasRef = useRef(null);
  const panelsRef = useRef([]);
  const [sceneAPI, setSceneAPI] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const { t } = useTranslation();

  const sections = useMemo(
    () => [
      {
        id: 'overview',
        headline: t('presale3d.scenes.overview.headline', {
          defaultValue: 'Ease of use from day one',
        }),
        body: t('presale3d.scenes.overview.body', {
          defaultValue:
            'Seamless onboarding, autopilot deposits, and transparent dashboards make the Hyper Strategies presale feel familiar even if this is your first allocation.',
        }),
      },
      {
        id: 'moneyFlow',
        headline: t('presale3d.scenes.moneyFlow.headline', {
          defaultValue: 'Hedged operations, real-time guardrails',
        }),
        body: t('presale3d.scenes.moneyFlow.body', {
          defaultValue:
            'Quantitative and discretionary desks work together, routing capital across high conviction strategies, safety reserves, and farming flywheels with live risk oversight.',
        }),
      },
      {
        id: 'strategy',
        headline: t('presale3d.scenes.strategy.headline', {
          defaultValue: 'Token value tied to performance',
        }),
        body: t('presale3d.scenes.strategy.body', {
          defaultValue:
            'Holding the presale token means participating in buy-backs, fee sharing, and performance dividends paid in USDC when growth hurdles are cleared.',
        }),
      },
      {
        id: 'innerLoop',
        headline: t('presale3d.scenes.innerLoop.headline', {
          defaultValue: 'Claim your spot in the next distribution',
        }),
        body: t('presale3d.scenes.innerLoop.body', {
          defaultValue:
            'Reserve an allocation, connect your wallet, and track deposits in real time as you earn XP towards higher tiers and expanded presale access.',
        }),
      },
    ],
    [t]
  );

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = (event) => setPrefersReducedMotion(event.matches);

    setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', updatePreference);

    return () => mediaQuery.removeEventListener('change', updatePreference);
  }, []);

  useEffect(() => {
    panelsRef.current = panelsRef.current.slice(0, sections.length);
  }, [sections.length]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => Number(a.target.dataset.index) - Number(b.target.dataset.index));

        if (visible.length > 0) {
          setActiveIndex(Number(visible[0].target.dataset.index));
        }
      },
      { threshold: 0.5 }
    );

    panelsRef.current.forEach((panel, index) => {
      if (panel) {
        panel.dataset.index = index;
        observer.observe(panel);
      }
    });

    return () => observer.disconnect();
  }, [sections.length]);

  const registerPanel = (index) => (element) => {
    panelsRef.current[index] = element;
    if (element) {
      element.dataset.index = index;
    }
  };

  const handleDotClick = (index) => {
    const target = panelsRef.current[index];
    if (!target) return;

    target.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'center',
    });
  };

  return (
    <Layout showInteractiveBackground={false}>
      <div className="hw-toggle-bar">
        <ViewToggle
          label={t('presale3d.toggle.label', { defaultValue: 'Presale views' })}
          alignment="end"
          variant="dark"
          options={[
            {
              id: '2d',
              label: t('presale3d.toggle.2d', { defaultValue: 'Presale overview' }),
              to: '/presale-info',
              isActive: false,
            },
            {
              id: '3d',
              label: t('presale3d.toggle.3d', { defaultValue: '3D journey' }),
              to: '/presale-3d',
              isActive: true,
            },
          ]}
        />
      </div>
      <div className="hw-root">
        <div className="hw-rail" ref={railRef}>
          <canvas className="hw-rail-canvas" ref={canvasRef} aria-hidden="true" />
          {!prefersReducedMotion ? (
            <>
              <FlowSceneCubes
                containerRef={railRef}
                canvasRef={canvasRef}
                onReady={setSceneAPI}
              />
              {sceneAPI && (
                <ScrollSceneController
                  sceneAPI={sceneAPI}
                  scenes={SCROLL_SCENES}
                />
              )}
            </>
          ) : (
            <ParallaxFallback scenes={sections} />
          )}

          <nav className="hw-sidebar" aria-label={t('presale3d.progress', { defaultValue: 'Presale highlights' })}>
            {sections.map((section, index) => (
              <button
                key={section.id}
                type="button"
                className={`hw-dot${activeIndex === index ? ' active' : ''}`}
                onClick={() => handleDotClick(index)}
                aria-current={activeIndex === index ? 'step' : undefined}
                aria-label={section.headline}
              />
            ))}
          </nav>
        </div>

        <main className="hw-content">
          {sections.map((section, index) => (
            <section
              key={section.id}
              className="hw-card"
              aria-labelledby={`presale-scene-${section.id}`}
              ref={registerPanel(index)}
            >
              <h2 id={`presale-scene-${section.id}`}>{section.headline}</h2>
              <p>{section.body}</p>
            </section>
          ))}
        </main>
      </div>
    </Layout>
  );
};

export default Presale3D;

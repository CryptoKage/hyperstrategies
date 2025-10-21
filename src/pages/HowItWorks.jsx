import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';
import copy from '../data/site_copy.json';
import FlowSceneCubes from '../components/HowItWorks3D/FlowSceneCubes';
import ScrollCameraController from '../components/HowItWorks3D/ScrollCameraController';
import ParallaxFallback from '../components/HowItWorks3D/ParallaxFallback';
import { useTranslation } from 'react-i18next';
import '../styles/how-it-works-3d.css';

const KEYFRAMES = [
  { t: 0, camera: { pos: [0, 2.2, 6.5], lookAt: [0, 0.6, 0] }, onEnter: 'overview', section: 0 },
  { t: 0.14, camera: { pos: [1.7, 1.9, 4.5], lookAt: [0.4, 0.55, 0] }, onEnter: 'moneyFlow', section: 1 },
  { t: 0.28, camera: { pos: [-1.35, 1.4, 3.5], lookAt: [0.1, 0.3, 0] }, onEnter: 'strategyHub', section: 2 },
  { t: 0.42, camera: { pos: [0.15, 1.1, 2.4], lookAt: [0.1, 0.25, 0.1] }, onEnter: 'innerLoop', section: 3 },
  { t: 0.56, camera: { pos: [1.95, 1.15, 2.8], lookAt: [1.4, 0.35, 0.2] }, onEnter: 'security', section: 4 },
  { t: 0.7, camera: { pos: [-1.7, 1.0, 2.2], lookAt: [-1.1, 0.25, -0.1] }, onEnter: 'fees', section: 5 },
  { t: 0.84, camera: { pos: [1.65, 1.45, -0.1], lookAt: [1.4, 0.4, -0.4] }, onEnter: 'rewards', section: 6 },
  { t: 0.98, camera: { pos: [-2.6, 1.1, 2.4], lookAt: [-2.2, 0.2, -0.1] }, onEnter: 'reporting', section: 7 },
];

const SUPPORTED_LOCALES = ['en', 'de', 'troll'];

const HowItWorks = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [sceneAPI, setSceneAPI] = useState(null);
  const [activeScene, setActiveScene] = useState(0);
  const { i18n } = useTranslation();
  const location = useLocation();
  const [locale, setLocale] = useState(() =>
    SUPPORTED_LOCALES.includes(i18n.language) ? i18n.language : 'en'
  );

  const canvasRef = useRef(null);
  const overlayRef = useRef(null);
  const panelsRef = useRef([]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const requested = params.get('lang');
    if (requested && SUPPORTED_LOCALES.includes(requested) && requested !== i18n.language) {
      i18n.changeLanguage(requested);
    }
  }, [i18n, location.search]);

  useEffect(() => {
    const handleLanguageChange = (lang) => {
      setLocale(SUPPORTED_LOCALES.includes(lang) ? lang : 'en');
    };

    handleLanguageChange(i18n.language);
    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  const scenes = useMemo(
    () =>
      (copy.scenes || []).map((scene) => {
        const baseKey = scene.key || `scenes.${scene.id}`;
        return {
          ...scene,
          headline: T(`${baseKey}.headline`, locale),
          body: T(`${baseKey}.body`, locale),
        };
      }),
    [locale]
  );

  const infoCards = useMemo(() => copy.infoCards || [], []);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return undefined;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = (event) => setPrefersReducedMotion(event.matches);

    setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', updatePreference);

    return () => mediaQuery.removeEventListener('change', updatePreference);
  }, []);

  useEffect(() => {
    if (!prefersReducedMotion) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.target.dataset.index - b.target.dataset.index);
        if (visible.length > 0) {
          const index = Number(visible[0].target.dataset.index);
          setActiveScene(index);
        }
      },
      { threshold: 0.5 }
    );

    panelsRef.current.forEach((panel) => {
      if (panel) observer.observe(panel);
    });

    return () => observer.disconnect();
  }, [prefersReducedMotion, scenes.length]);

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

  const rootStyle = useMemo(() => ({
    minHeight: `${Math.max(1, scenes.length + 1) * 100}vh`,
  }), [scenes.length]);

  return (
    <Layout showInteractiveBackground={false}>
      <div className="howitworks-root" style={rootStyle}>
        <aside className="howitworks-sidebar" aria-label="How it works progress">
          <ul>
            {scenes.map((scene, index) => (
              <li key={scene.id}>
                <button
                  type="button"
                  className={`dot${activeScene === index ? ' active' : ''}`}
                  onClick={() => handleDotClick(index)}
                  aria-current={activeScene === index ? 'step' : undefined}
                  aria-label={`Go to ${scene.headline}`}
                >
                  <span aria-hidden="true" />
                  <span className="sr-only">{scene.headline}</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {!prefersReducedMotion && (
          <>
            <canvas ref={canvasRef} className="howitworks-canvas" aria-hidden="true" />
            <div ref={overlayRef} className="howitworks-overlay" aria-hidden="true" />
            <FlowSceneCubes
              canvasRef={canvasRef}
              overlayRef={overlayRef}
              onReady={setSceneAPI}
              locale={locale}
            />
            {sceneAPI && (
              <ScrollCameraController
                sceneAPI={sceneAPI}
                keyframes={KEYFRAMES}
                onSectionChange={setActiveScene}
              />
            )}
          </>
        )}

        {prefersReducedMotion && <ParallaxFallback scenes={scenes} />}

        <main className="howitworks-panels">
          {scenes.map((scene, index) => (
            <section
              key={scene.id}
              className="panel"
              aria-labelledby={`howitworks-${scene.id}`}
              ref={registerPanel(index)}
            >
              <header>
                <p className="panel-eyebrow">Scene {index + 1}</p>
                <h2 id={`howitworks-${scene.id}`}>{scene.headline}</h2>
              </header>
              <p>{scene.body}</p>
            </section>
          ))}
        </main>

        {infoCards.length > 0 && (
          <section
            className="howitworks-cards"
            aria-labelledby="howitworks-cards-title"
          >
            <div className="howitworks-cards__header">
              <h2 id="howitworks-cards-title">{T('cta.explore', locale)}</h2>
              <p>{T('cta.connect', locale)}</p>
            </div>
            <div className="howitworks-cards__grid">
              {infoCards.map((card) => {
                const title = T(`cards.${card.id}.title`, locale);
                const body = T(`cards.${card.id}.body`, locale);
                const badge = card.badge ? T(`cards.${card.id}.badge`, locale) : null;
                return (
                  <article key={card.id} className="howitworks-card">
                    {badge && <span className="howitworks-card__badge">{badge}</span>}
                    <h3>{title}</h3>
                    <p>{body}</p>
                  </article>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
};

export default HowItWorks;

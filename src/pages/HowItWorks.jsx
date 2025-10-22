import React, { useEffect, useMemo, useRef, useState } from 'react';
import Layout from '../components/Layout';
import FlowSceneCubes from '../components/HowItWorks3D/FlowSceneCubes';
import ScrollSceneController from '../components/HowItWorks3D/ScrollSceneController';
import copy from '../data/site_copy.json';
import { useTranslation } from 'react-i18next';
import '../styles/how-it-works-rail.css';
import { T } from '../utils/i18n';

const SUPPORTED_LOCALES = ['en', 'de', 'troll'];

const SCROLL_SCENES = [
  { id: 'overview', start: 0, end: 0.18 },
  { id: 'moneyFlow', start: 0.18, end: 0.45 },
  { id: 'strategy', start: 0.45, end: 0.72 },
  { id: 'innerLoop', start: 0.72, end: 1 },
];

const HowItWorks = () => {
  const railRef = useRef(null);
  const canvasRef = useRef(null);
  const panelsRef = useRef([]);
  const [sceneAPI, setSceneAPI] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const { i18n } = useTranslation();

  const locale = useMemo(
    () => (SUPPORTED_LOCALES.includes(i18n.language) ? i18n.language : 'en'),
    [i18n.language]
  );

  const scenes = useMemo(() => (copy.scenes || []).slice(0, 8), []);

  const localizedScenes = useMemo(
    () =>
      scenes.map((scene) => {
        const baseKey = scene.key || `scenes.${scene.id}`;
        const headlineKey = `${baseKey}.headline`;
        const bodyKey = `${baseKey}.body`;
        const translatedHeadline = T(headlineKey, locale);
        const translatedBody = T(bodyKey, locale);
        return {
          ...scene,
          headline: translatedHeadline === headlineKey ? scene.headline || translatedHeadline : translatedHeadline,
          body: translatedBody === bodyKey ? scene.body || translatedBody : translatedBody,
        };
      }),
    [scenes, locale]
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
  }, [localizedScenes.length]);

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
      <div className="hw-root">
        <div className="hw-rail" ref={railRef}>
          <canvas className="hw-rail-canvas" ref={canvasRef} aria-hidden="true" />
          {!prefersReducedMotion && (
            <>
              <FlowSceneCubes
                containerRef={railRef}
                canvasRef={canvasRef}
                onReady={setSceneAPI}
                locale={locale}
              />
              {sceneAPI && (
                <ScrollSceneController
                  sceneAPI={sceneAPI}
                  scenes={SCROLL_SCENES}
                />
              )}
            </>
          )}

          <nav className="hw-sidebar" aria-label="How it works progress">
            {localizedScenes.map((scene, index) => (
              <button
                key={scene.id}
                type="button"
                className={`hw-dot${activeIndex === index ? ' active' : ''}`}
                onClick={() => handleDotClick(index)}
                aria-current={activeIndex === index ? 'step' : undefined}
                aria-label={scene.headline}
              />
            ))}
          </nav>
        </div>

        <main className="hw-content">
          {localizedScenes.map((scene, index) => (
            <section
              key={scene.id}
              className="hw-card"
              aria-labelledby={`hw-scene-${scene.id}`}
              ref={registerPanel(index)}
            >
              <h2 id={`hw-scene-${scene.id}`}>{scene.headline}</h2>
              <p>{scene.body}</p>
            </section>
          ))}
        </main>
      </div>
    </Layout>
  );
};

export default HowItWorks;

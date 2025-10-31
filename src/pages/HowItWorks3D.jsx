import React, { useEffect, useMemo, useRef, useState } from 'react';
import Layout from '../components/Layout';
import FlowSceneCubes from '../components/HowItWorks3D/FlowSceneCubes';
import ScrollSceneController from '../components/HowItWorks3D/ScrollSceneController';
import ParallaxFallback from '../components/HowItWorks3D/ParallaxFallback';
import ViewToggle from '../components/ViewToggle';
import copy from '../data/site_copy.json';
import { useTranslation } from 'react-i18next';
import '../styles/how-it-works-rail.css';

const SCROLL_SCENES = [
  { id: 'overview', start: 0, end: 0.18 },
  { id: 'moneyFlow', start: 0.18, end: 0.45 },
  { id: 'strategy', start: 0.45, end: 0.72 },
  { id: 'innerLoop', start: 0.72, end: 1 },
];

const HowItWorks3D = () => {
  const railRef = useRef(null);
  const canvasRef = useRef(null);
  const panelsRef = useRef([]);
  const [sceneAPI, setSceneAPI] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const { t } = useTranslation();

  const scenes = useMemo(() => (copy.scenes || []).slice(0, 8), []);

  const localizedScenes = useMemo(
    () =>
      scenes.map((scene) => {
        const baseKey = scene.key || `scenes.${scene.id}`;
        return {
          ...scene,
          headline: t(`${baseKey}.headline`, { defaultValue: scene.headline }),
          body: t(`${baseKey}.body`, { defaultValue: scene.body }),
        };
      }),
    [scenes, t]
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
    panelsRef.current = panelsRef.current.slice(0, localizedScenes.length);
  }, [localizedScenes.length]);

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
      <div className="hw-toggle-bar">
        <ViewToggle
          label={t('howItWorks.toggle.label', { defaultValue: 'Choose your view' })}
          alignment="end"
          variant="dark"
          options={[
            {
              id: '2d',
              label: t('howItWorks.toggle.2d', { defaultValue: 'Immersive 2D' }),
              to: '/how-it-works',
              isActive: false,
            },
            {
              id: '3d',
              label: t('howItWorks.toggle.3d', { defaultValue: 'Interactive 3D' }),
              to: '/how-it-works-3d',
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
            <ParallaxFallback scenes={localizedScenes} />
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

export default HowItWorks3D;

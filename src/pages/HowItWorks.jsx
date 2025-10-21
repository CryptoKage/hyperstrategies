import React, { useEffect, useRef, useState } from 'react';
import Layout from '../components/Layout';
import copy from '../data/site_copy.json';
import FlowScene from '../components/HowItWorks3D/FlowScene';
import ScrollCameraController from '../components/HowItWorks3D/ScrollCameraController';
import ParallaxFallback from '../components/HowItWorks3D/ParallaxFallback';
import '../styles/how-it-works-3d.css';

const KEYFRAMES = [
  { t: 0, camera: { pos: [0, 2.2, 6.5], lookAt: [0, 0.6, 0] }, onEnter: 'overview' },
  { t: 0.25, camera: { pos: [1.6, 1.8, 4.2], lookAt: [0.4, 0.5, 0] }, onEnter: 'moneyFlow' },
  { t: 0.55, camera: { pos: [-1.2, 1.3, 3.6], lookAt: [0, 0.3, 0] }, onEnter: 'strategyHub' },
  { t: 0.85, camera: { pos: [0, 0.9, 2.6], lookAt: [0, 0.2, 0] }, onEnter: 'innerLoop' },
];

const HowItWorks = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [sceneAPI, setSceneAPI] = useState(null);
  const [activeScene, setActiveScene] = useState(0);

  const canvasRef = useRef(null);
  const overlayRef = useRef(null);
  const panelsRef = useRef([]);
  const scenes = copy.scenes.slice(0, 4);

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

  return (
    <Layout showInteractiveBackground={false}>
      <div className="howitworks-root">
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
            <FlowScene canvasRef={canvasRef} overlayRef={overlayRef} onReady={setSceneAPI} />
            {sceneAPI && (
              <ScrollCameraController
                sceneAPI={sceneAPI}
                keyframes={KEYFRAMES}
                onSectionChange={setActiveScene}
              />
            )}
          </>
        )}

        {prefersReducedMotion && <ParallaxFallback copy={copy} />}

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
      </div>
    </Layout>
  );
};

export default HowItWorks;

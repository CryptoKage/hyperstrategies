import React, { useEffect, useRef } from 'react';

export default function ParallaxFallback({ scenes = [] }) {
  const containerRef = useRef(null);
  const layersRef = useRef([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const handleScroll = () => {
      const rect = container.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 1;
      const progress = 1 - rect.top / (viewportHeight * 2);
      layersRef.current.forEach((layer, index) => {
        if (!layer) return;
        const depth = index / layersRef.current.length;
        const translate = progress * (20 * depth);
        layer.style.transform = `translateY(${translate}vh)`;
      });
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  return (
    <div className="parallax-fallback" ref={containerRef} aria-hidden="true">
      <div
        className="parallax-layer parallax-layer--back"
        ref={(el) => {
          layersRef.current[0] = el;
        }}
      />
      <div
        className="parallax-layer parallax-layer--mid"
        ref={(el) => {
          layersRef.current[1] = el;
        }}
      />
      <div
        className="parallax-layer parallax-layer--front"
        ref={(el) => {
          layersRef.current[2] = el;
        }}
      >
        <ul>
          {scenes.slice(0, 4).map((scene) => (
            <li key={scene.id}>
              <h3>{scene.headline}</h3>
              <p>{scene.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

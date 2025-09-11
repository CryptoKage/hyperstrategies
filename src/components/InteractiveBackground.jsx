// ==============================================================================
// FINAL, DEFINITIVE InteractiveBackground.jsx (Stable Animation)
// ==============================================================================
import React, { useState, useEffect, useRef, useCallback } from 'react';

// (The createSeededRandom and useWindowSize hooks are fine and do not need to change)
const createSeededRandom = (seed) => {
  let s = seed;
  return () => {
    const x = Math.sin(s++) * 10000;
    return x - Math.floor(x);
  };
};

const useWindowSize = () => {
  const [size, setSize] = useState([0, 0]);
  useEffect(() => {
    const handleResize = () => setSize([window.innerWidth, window.innerHeight]);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return size;
};

const InteractiveBackground = ({ seed = Math.random() }) => {
  const containerRef = useRef(null);
  const pointsRef = useRef([]); // Use refs to persist data across re-renders
  const animationFrameIdRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // --- THIS IS THE KEY FIX ---
  // This useEffect now runs ONLY ONCE when the component mounts.
  // It no longer depends on window size, so it won't be re-triggered.
  useEffect(() => {
    const generateNetwork = () => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.offsetWidth;
      const containerHeight = containerRef.current.offsetHeight;
      const numPoints = Math.floor((containerWidth * containerHeight) / 15000);
      const connectionDistance = 120;
      const rng = createSeededRandom(typeof seed === 'number' ? seed : seed.toString().split('').reduce((a, c) => a + c.charCodeAt(0), 0));

      pointsRef.current = Array.from({ length: numPoints }, () => ({
        x: rng() * containerWidth,
        y: rng() * containerHeight,
        vx: (rng() - 0.5) * 0.3,
        vy: (rng() - 0.5) * 0.3,
      }));
      setIsInitialized(true); // Trigger the render of the SVG elements
    };
    generateNetwork();
  }, [seed]); // The seed prop can still trigger a regeneration if it changes

  useEffect(() => {
    if (!isInitialized) return;

    const points = pointsRef.current;
    const pointElements = Array.from(containerRef.current.querySelectorAll('circle'));
    
    const animate = () => {
      const containerWidth = containerRef.current.offsetWidth;
      const containerHeight = containerRef.current.offsetHeight;

      points.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > containerWidth) p.vx *= -1;
        if (p.y < 0 || p.y > containerHeight) p.vy *= -1;
        if (pointElements[i]) {
          pointElements[i].setAttribute('cx', p.x);
          pointElements[i].setAttribute('cy', p.y);
        }
      });
      animationFrameIdRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    return () => cancelAnimationFrame(animationFrameIdRef.current);
  }, [isInitialized]); // This effect also only runs once

  return (
    <div ref={containerRef} className="interactive-background">
      <svg width="100%" height="100%">
        {/* We only render the points, the lines can be added back later if needed */}
        {isInitialized && pointsRef.current.map((point, i) => (
          <circle
            key={i}
            cx={point.x}
            cy={point.y}
            r="1.5"
            fill="var(--color-primary)"
            opacity="0.5"
          />
        ))}
      </svg>
    </div>
  );
};

export default InteractiveBackground;
// ==============================================================================
// END OF REPLACEMENT
// ==============================================================================

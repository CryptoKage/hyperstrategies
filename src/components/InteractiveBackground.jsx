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
  const pointsRef = useRef([]);
  const animationFrameIdRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const generateNetwork = () => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.offsetWidth;
      const containerHeight = containerRef.current.offsetHeight;
      const numPoints = Math.floor((containerWidth * containerHeight) / 20000); // Fewer points for performance
      const rng = createSeededRandom(typeof seed === 'number' ? seed : seed.toString().split('').reduce((a, c) => a + c.charCodeAt(0), 0));

      pointsRef.current = Array.from({ length: numPoints }, () => ({
        x: rng() * containerWidth,
        y: rng() * containerHeight,
        vx: (rng() - 0.5) * 0.15, // --- SLOWER SPEED ---
        vy: (rng() - 0.5) * 0.15, // --- SLOWER SPEED ---
      }));
      setIsInitialized(true);
    };
    generateNetwork();
  }, [seed]);

  useEffect(() => {
    if (!isInitialized) return;

    const points = pointsRef.current;
    const pointElements = Array.from(containerRef.current.querySelectorAll('circle'));
    const lineElements = []; // We will create these now

    const svg = containerRef.current.querySelector('svg');
    const connectionDistance = 150;

    // --- RE-INTRODUCE LINE CREATION ---
    for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            svg.prepend(line); // Prepend to draw behind points
            lineElements.push(line);
        }
    }

    const animate = () => {
      const containerWidth = containerRef.current.offsetWidth;
      const containerHeight = containerRef.current.offsetHeight;

      points.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > containerWidth) p.vx *= -1;
        if (p.y < 0 || p.y > containerHeight) p.vy *= -1;
        if (pointElements[i]) {
          pointElements[i].setAttribute('cx', p.x);
          pointElements[i].setAttribute('cy', p.y);
        }
      });
      
      // --- RE-INTRODUCE LINE DRAWING LOGIC ---
      let lineIndex = 0;
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const p1 = points[i];
          const p2 = points[j];
          const distance = Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
          const lineEl = lineElements[lineIndex];
          if (lineEl) {
            if (distance < connectionDistance) {
              lineEl.setAttribute('x1', p1.x); lineEl.setAttribute('y1', p1.y);
              lineEl.setAttribute('x2', p2.x); lineEl.setAttribute('y2', p2.y);
              lineEl.setAttribute('stroke', 'var(--color-border)');
              lineEl.setAttribute('stroke-opacity', 1 - distance / connectionDistance);
            } else {
              lineEl.setAttribute('stroke-opacity', 0); // Hide the line
            }
          }
          lineIndex++;
        }
      }

      animationFrameIdRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    return () => cancelAnimationFrame(animationFrameIdRef.current);
  }, [isInitialized]);

  return (
    <div ref={containerRef} className="interactive-background">
      <svg width="100%" height="100%">
        {isInitialized && pointsRef.current.map((point, i) => (
          <circle key={i} cx={point.x} cy={point.y} r="1.5" fill="var(--color-primary)" opacity="0.5" />
        ))}
      </svg>
    </div>
  );
};

export default InteractiveBackground;

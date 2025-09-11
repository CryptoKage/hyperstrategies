// src/components/InteractiveBackground.jsx

import React, { useState, useEffect, useRef, useCallback } from 'react';

// Simple seeded random number generator to ensure deterministic patterns
const createSeededRandom = (seed) => {
  let s = seed;
  return () => {
    const x = Math.sin(s++) * 10000;
    return x - Math.floor(x);
  };
};

// --- FIX 1: Make the hook server-side-rendering (SSR) safe ---
// This hook now safely handles cases where `window` is not defined.
const useWindowSize = () => {
  const [size, setSize] = useState([0, 0]); // Default to 0,0 on the server
  useEffect(() => {
    // This code only runs on the client, where `window` exists.
    const handleResize = () => setSize([window.innerWidth, window.innerHeight]);
    handleResize(); // Set initial size
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return size;
};

// Accept a `seed` prop so each instance can generate a unique node pattern

const InteractiveBackground = ({ seed = Math.random() }) => {
  const [width, height] = useWindowSize();
  const containerRef = useRef(null);

  // --- THIS IS THE FIX ---
  // We will store the points and lines directly in state.
  // This ensures that whenever they are regenerated, the component MUST re-render.
  const [points, setPoints] = useState([]);
  const [lines, setLines] = useState([]);
  
  const animationFrameIdRef = useRef(null);

  const generateNetwork = useCallback(() => {
    if (!containerRef.current) return;
    
    const containerWidth = containerRef.current.offsetWidth;
    const containerHeight = containerRef.current.offsetHeight;
    const numPoints = Math.floor((containerWidth * containerHeight) / 15000);
    const connectionDistance = 120;
    const rng = createSeededRandom(typeof seed === 'number' ? seed : seed.toString().split('').reduce((a, c) => a + c.charCodeAt(0), 0));

    // Generate new point data
    const newPoints = Array.from({ length: numPoints }, () => ({
      x: rng() * containerWidth, y: rng() * containerHeight,
      vx: (rng() - 0.5) * 0.3, vy: (rng() - 0.5) * 0.3,
    }));

    // Generate new line data
    const newLines = [];
    for (let i = 0; i < newPoints.length; i++) {
      for (let j = i + 1; j < newPoints.length; j++) {
        const p1 = newPoints[i]; const p2 = newPoints[j];
        const distance = Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
        if (distance < connectionDistance) {
          newLines.push({ p1_index: i, p2_index: j, opacity: 1 - distance / connectionDistance });
        }
      }
    }

    // Set the state, which forces a re-render
    setPoints(newPoints);
    setLines(newLines);
  }, [seed]);

  useEffect(() => {
    const timeoutId = setTimeout(() => generateNetwork(), 500);
    return () => clearTimeout(timeoutId);
  }, [width, height, generateNetwork]);
  
  // The animation loop now reads from state and uses refs for DOM nodes
  useEffect(() => {
    const pointElements = Array.from(containerRef.current.querySelectorAll('circle'));
    const lineElements = Array.from(containerRef.current.querySelectorAll('line'));

    // We still use a ref for the point data inside the animation to avoid dependency issues
    const pointsDataRef = { current: points };

    const animate = () => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.offsetWidth;
      const containerHeight = containerRef.current.offsetHeight;

      pointsDataRef.current.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > containerWidth) p.vx *= -1;
        if (p.y < 0 || p.y > containerHeight) p.vy *= -1;
        if (pointElements[i]) {
          pointElements[i].setAttribute('cx', p.x);
          pointElements[i].setAttribute('cy', p.y);
        }
      });
      
      lineElements.forEach((lineEl, i) => {
        const lineData = lines[i];
        if (!lineData) return;
        const p1 = pointsDataRef.current[lineData.p1_index];
        const p2 = pointsDataRef.current[lineData.p2_index];
        if (p1 && p2) {
          lineEl.setAttribute('x1', p1.x); lineEl.setAttribute('y1', p1.y);
          lineEl.setAttribute('x2', p2.x); lineEl.setAttribute('y2', p2.y);
        }
      });

      animationFrameIdRef.current = requestAnimationFrame(animate);
    };
    
    if (points.length > 0) {
        animate();
    }
    return () => cancelAnimationFrame(animationFrameIdRef.current);
  }, [points, lines]); // Re-start the animation if points/lines change

  return (
    <div ref={containerRef} className="interactive-background">
      <svg width="100%" height="100%">
        {lines.map((line, i) => (
          <line
            key={i}
            x1={points[line.p1_index]?.x} y1={points[line.p1_index]?.y}
            x2={points[line.p2_index]?.x} y2={points[line.p2_index]?.y}
            stroke="var(--color-border)" strokeOpacity={line.opacity}
          />
        ))}
        {points.map((point, i) => (
          <circle
            key={i}
            cx={point.x} cy={point.y} r="2" fill="var(--color-primary)"
          />
        ))}
      </svg>
    </div>
  );
};

export default InteractiveBackground;

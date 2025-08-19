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

  // --- FIX 2: Use `useRef` for all animation data to prevent re-renders ---
  const pointsRef = useRef([]);
  const linesRef = useRef([]);
  const pointElementsRef = useRef([]);
  const lineElementsRef = useRef([]);
  const animationFrameIdRef = useRef(null);

  // --- FIX 3: Use a single state to trigger the initial render ---
  // We only need to render the SVG elements ONCE. After that, we manipulate them directly.
  const [isInitialized, setIsInitialized] = useState(false);

   const colorPalette = {
    primary: 'var(--color-primary)', // #3fbaf3
    buy: '#4ade80',      // A nice, vibrant green
    sell: '#f87171'      // A complementary red
  };


  const generateNetwork = useCallback(() => {
    if (!containerRef.current) return;
    
    const containerWidth = containerRef.current.offsetWidth;
    const containerHeight = containerRef.current.offsetHeight;
    
    const numPoints = Math.floor((containerWidth * containerHeight) / 15000);
    const connectionDistance = 120;

    const rng = createSeededRandom(typeof seed === 'number' ? seed : seed.toString().split('').reduce((a, c) => a + c.charCodeAt(0), 0));

    // Reset element references when regenerating
    pointElementsRef.current = [];
    lineElementsRef.current = [];

    // Generate points and store them in the ref, NOT state.
    pointsRef.current = Array.from({ length: numPoints }, () => {
      // --- THE FIX: Assign a random color to each point on creation ---
      let color = colorPalette.primary;
      const rand = rng();
      if (rand < 0.05) { // 5% chance of being a "buy" node
        color = colorPalette.buy;
      } else if (rand > 0.95) { // 5% chance of being a "sell" node
        color = colorPalette.sell;
      }

      return {
        x: rng() * containerWidth,
        y: rng() * containerHeight,
        vx: (rng() - 0.5) * 0.3,
        vy: (rng() - 0.5) * 0.3,
        color: color // Store the color with the point
      };
    });

    // Generate lines and store them in the ref, NOT state.
    const newLines = [];
    for (let i = 0; i < pointsRef.current.length; i++) {
      for (let j = i + 1; j < pointsRef.current.length; j++) {
        const p1 = pointsRef.current[i];
        const p2 = pointsRef.current[j];
        const distance = Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
        if (distance < connectionDistance) {
          newLines.push({
            p1_index: i, // Store indices instead of object references
            p2_index: j,
            opacity: 1 - distance / connectionDistance,
          });
        }
      }
    }
    linesRef.current = newLines;

    // Trigger the one-time render
    setIsInitialized(true);
  }, [seed]);

  // Regenerate network on resize
  useEffect(() => {
    // Debounce resize to prevent rapid regeneration
    const timeoutId = setTimeout(() => generateNetwork(), 500);
    return () => clearTimeout(timeoutId);
  }, [width, height, generateNetwork]);
  
  // --- FIX 4: The new, high-performance animation loop ---
  useEffect(() => {
    if (!isInitialized) return; // Don't start animating until the network is generated

    const animate = () => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.offsetWidth;
      const containerHeight = containerRef.current.offsetHeight;

      // Update point positions in the ref
      pointsRef.current.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > containerWidth) p.vx *= -1;
        if (p.y < 0 || p.y > containerHeight) p.vy *= -1;

        // Directly manipulate the DOM element attributes, bypassing React's render cycle
        const pointElement = pointElementsRef.current[i];
        if (pointElement) {
          pointElement.setAttribute('cx', p.x);
          pointElement.setAttribute('cy', p.y);
        }
      });
      
      // Update line positions by reading from the updated points ref
      linesRef.current.forEach((line, i) => {
        const p1 = pointsRef.current[line.p1_index];
        const p2 = pointsRef.current[line.p2_index];
        const lineElement = lineElementsRef.current[i];
        if (lineElement && p1 && p2) {
          lineElement.setAttribute('x1', p1.x);
          lineElement.setAttribute('y1', p1.y);
          lineElement.setAttribute('x2', p2.x);
          lineElement.setAttribute('y2', p2.y);
        }
      });

      animationFrameIdRef.current = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationFrameIdRef.current);
  }, [isInitialized]);

  return (
    <div ref={containerRef} className="interactive-background">
      <svg width="100%" height="100%">
        {/* --- FIX 5: Render based on the refs and populate the element refs --- */}
        {/* This JSX now only runs ONCE when isInitialized becomes true. */}
        {isInitialized && linesRef.current.map((line, i) => (
          <line
            key={i}
            ref={el => lineElementsRef.current[i] = el} // Store the DOM element
            x1={pointsRef.current[line.p1_index]?.x}
            y1={pointsRef.current[line.p1_index]?.y}
            x2={pointsRef.current[line.p2_index]?.x}
            y2={pointsRef.current[line.p2_index]?.y}
            stroke="var(--color-border)"
            strokeOpacity={line.opacity}
          />
        ))}
        {isInitialized && pointsRef.current.map((point, i) => (
          <circle
            key={i}
            ref={el => pointElementsRef.current[i] = el} // Store the DOM element
            cx={point.x}
            cy={point.y}
            r="2"
            fill="var(--color-primary)"
          />
        ))}
      </svg>
    </div>
  );
};

export default InteractiveBackground;

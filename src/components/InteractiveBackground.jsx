// src/components/InteractiveBackground.jsx

import React, { useState, useEffect, useRef, useCallback } from 'react';

// A simple hook to get window dimensions and handle resizing
const useWindowSize = () => {
  const [size, setSize] = useState([window.innerWidth, window.innerHeight]);
  useEffect(() => {
    const handleResize = () => setSize([window.innerWidth, window.innerHeight]);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return size;
};

const InteractiveBackground = () => {
  const [points, setPoints] = useState([]);
  const [lines, setLines] = useState([]);
  const [width, height] = useWindowSize();
  const containerRef = useRef(null);

  const generateNetwork = useCallback(() => {
    if (!containerRef.current) return;
    
    const containerWidth = containerRef.current.offsetWidth;
    const containerHeight = containerRef.current.offsetHeight;
    
    // Adjust point density based on screen size
    const numPoints = Math.floor((containerWidth * containerHeight) / 15000);
    const connectionDistance = 120; // How close points need to be to connect

    // Generate random points (nodes)
    const newPoints = Array.from({ length: numPoints }, () => ({
      x: Math.random() * containerWidth,
      y: Math.random() * containerHeight,
      // Add velocity for subtle movement
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
    }));
    setPoints(newPoints);

    // Generate lines (edges) based on proximity
    const newLines = [];
    for (let i = 0; i < newPoints.length; i++) {
      for (let j = i + 1; j < newPoints.length; j++) {
        const p1 = newPoints[i];
        const p2 = newPoints[j];
        const distance = Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
        if (distance < connectionDistance) {
          newLines.push({
            p1: i,
            p2: j,
            opacity: 1 - distance / connectionDistance, // Lines are fainter the longer they are
          });
        }
      }
    }
    setLines(newLines);
  }, []);

  // Regenerate network on resize
  useEffect(() => {
    generateNetwork();
  }, [width, height, generateNetwork]);
  
  // Animation loop
  useEffect(() => {
    let animationFrameId;
    const animate = () => {
      setPoints(currentPoints => {
        if (!containerRef.current) return currentPoints;
        const containerWidth = containerRef.current.offsetWidth;
        const containerHeight = containerRef.current.offsetHeight;

        return currentPoints.map(p => {
          let newX = p.x + p.vx;
          let newY = p.y + p.vy;

          // Bounce off the walls
          if (newX < 0 || newX > containerWidth) p.vx *= -1;
          if (newY < 0 || newY > containerHeight) p.vy *= -1;
          
          return { ...p, x: newX, y: newY };
        });
      });
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div ref={containerRef} className="interactive-background">
      <svg width="100%" height="100%">
        {lines.map((line, i) => (
          <line
            key={i}
            x1={points[line.p1]?.x}
            y1={points[line.p1]?.y}
            x2={points[line.p2]?.x}
            y2={points[line.p2]?.y}
            stroke="var(--color-border)"
            strokeOpacity={line.opacity}
          />
        ))}
        {points.map((point, i) => (
          <circle
            key={i}
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
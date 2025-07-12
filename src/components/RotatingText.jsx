// src/components/RotatingText.jsx
import React, { forwardRef, useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './RotatingText.css'; // contains your provided rotating text CSS

const RotatingText = forwardRef(({
  texts = [],
  mainClassName = 'text-rotate',
  staggerFrom = 'last',
  initial = { y: '100%', opacity: 0 },
  animate = { y: '0%', opacity: 1 },
  exit = { y: '-120%', opacity: 0 },
  staggerDuration = 0.025,
  transition = { type: 'spring', damping: 30, stiffness: 400 },
  rotationInterval = 2500,
}, ref) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const chars = useMemo(
    () => Array.from(texts[currentIndex] || ''),
    [texts, currentIndex]
  );

  // Cycle through texts at interval
  useEffect(() => {
    const id = setInterval(() => {
      setCurrentIndex(i => (i + 1) % texts.length);
    }, rotationInterval);
    return () => clearInterval(id);
  }, [texts, rotationInterval]);

  return (
    <motion.span className={mainClassName}>
      <span className="text-rotate-sr-only">{texts[currentIndex]}</span>
      <AnimatePresence mode="wait">
        <motion.span
          key={currentIndex}
          className="text-rotate"
          initial={initial}
          animate={animate}
          exit={exit}
          transition={transition}
        >
          {chars.map((char, i) => {
            const delay =
              staggerFrom === 'last'
                ? (chars.length - 1 - i) * staggerDuration
                : i * staggerDuration;
            return (
              <motion.span
                key={i}
                className="text-rotate-element"
                initial={initial}
                animate={animate}
                exit={exit}
                transition={{ ...transition, delay }}
              >
                {char}
              </motion.span>
            );
          })}
        </motion.span>
      </AnimatePresence>
    </motion.span>
  );
});

export default RotatingText;

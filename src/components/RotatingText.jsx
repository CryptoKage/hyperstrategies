// src/components/RotatingText.jsx

import React, { forwardRef, useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './RotatingText.css';

const RotatingText = forwardRef(({
  texts = [],
  mainClassName = 'text-rotate',
  loop = true, // We'll keep the loop prop for flexibility
  staggerFrom = 'last',
  initial = { y: '100%', opacity: 0 },
  animate = { y: '0%', opacity: 1 },
  exit = { y: '-120%', opacity: 0 },
  staggerDuration = 0.025,
  transition = { type: 'spring', damping: 30, stiffness: 400 },
  rotationInterval = 2500,
}, ref) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // --- NEW --- We use a ref to track the number of loops completed.
  // A ref is like a state variable that doesn't cause re-renders when it changes.
  const loopsCompleted = useRef(0);

  const chars = useMemo(
    () => Array.from(texts[currentIndex] || ''),
    [texts, currentIndex]
  );

  useEffect(() => {
    if (texts.length <= 1) return;

    const id = setInterval(() => {
      setCurrentIndex(prevIndex => {
        const nextIndex = prevIndex + 1;

        // --- NEW LOGIC ---
        // The core of the "cycle twice, then stop" feature.
        if (loop === 'twice') {
          // Check if we just completed a full loop
          if (nextIndex % texts.length === 0) {
            loopsCompleted.current += 1;
          }

          // If we have completed 2 loops and are about to show the last word again...
          if (loopsCompleted.current >= 2 && nextIndex % texts.length === texts.length - 1) {
            clearInterval(id); // Stop the animation timer.
            return nextIndex % texts.length; // Set the index to the last word.
          }
        }
        
        // This is the original looping logic.
        return nextIndex % texts.length;
      });
    }, rotationInterval);

    return () => clearInterval(id);
  }, [texts, rotationInterval, loop]);

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
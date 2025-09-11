// src/components/PlasmaEffect.jsx

import React, { useRef, useEffect } from 'react';
import { createNoise3D } from 'simplex-noise';

// --- OPTIMIZATION 1: Define constants outside the component ---
// This prevents them from being redefined on every render.
const SCALING_FACTOR = 8; // Render at 1/8th resolution. Higher number = better performance.
const primaryColor = { r: 63, g: 186, b: 243 };
const secondaryColor = { r: 4, g: 14, b: 33 };
const noiseScale = 0.005;
const timeScale = 0.0005;

const PlasmaEffect = () => {
  const mainCanvasRef = useRef(null);
  
  // --- OPTIMIZATION 2: Use refs for everything that doesn't trigger a re-render ---
  const offscreenCanvasRef = useRef(document.createElement('canvas'));
  const imageDataRef = useRef(null);
  const simplexRef = useRef(createNoise3D());
  const animationFrameIdRef = useRef(null);

  useEffect(() => {
    const mainCanvas = mainCanvasRef.current;
    const mainCtx = mainCanvas.getContext('2d', { alpha: false }); // alpha: false can be faster

    const offscreenCanvas = offscreenCanvasRef.current;
    const offscreenCtx = offscreenCanvas.getContext('2d');
    
    let time = 0;

    const resizeCanvas = () => {
      // Set the size of the main, visible canvas
      mainCanvas.width = window.innerWidth;
      mainCanvas.height = window.innerHeight * 0.6;
      
      // Set the size of the small, off-screen canvas
      offscreenCanvas.width = mainCanvas.width / SCALING_FACTOR;
      offscreenCanvas.height = mainCanvas.height / SCALING_FACTOR;
      
      // --- OPTIMIZATION 3: Allocate image data ONLY ONCE during resize ---
      imageDataRef.current = offscreenCtx.createImageData(offscreenCanvas.width, offscreenCanvas.height);
    };

    const animate = () => {
      const imageData = imageDataRef.current;
      if (!imageData) { // Safety check
        animationFrameIdRef.current = requestAnimationFrame(animate);
        return;
      }
      
      const data = imageData.data;
      const simplex = simplexRef.current;

      // --- OPTIMIZATION 4: Loop over the SMALL canvas size ---
      // This loop now runs (SCALING_FACTOR * SCALING_FACTOR) times less.
      // e.g., for a scaling factor of 8, this is 64x fewer calculations!
      for (let y = 0; y < offscreenCanvas.height; y++) {
        for (let x = 0; x < offscreenCanvas.width; x++) {
          const index = (y * offscreenCanvas.width + x) * 4;
          const noise = simplex(x * noiseScale, y * noiseScale, time * timeScale);
          const t = Math.min(0.7, (noise + 1) / 2);
          
          data[index] = secondaryColor.r + t * (primaryColor.r - secondaryColor.r);
          data[index + 1] = secondaryColor.g + t * (primaryColor.g - secondaryColor.g);
          data[index + 2] = secondaryColor.b + t * (primaryColor.b - secondaryColor.b);
          data[index + 3] = 255;
        }
      }

      // 1. Draw the low-res plasma onto the small off-screen canvas
      offscreenCtx.putImageData(imageData, 0, 0);

      // 2. Draw the small canvas onto the large one, letting the GPU handle scaling
      mainCtx.imageSmoothingEnabled = true; // Optional: for a softer look
      mainCtx.drawImage(offscreenCanvas, 0, 0, mainCanvas.width, mainCanvas.height);
      
      time++;
      animationFrameIdRef.current = requestAnimationFrame(animate);
    };
    
    resizeCanvas();
    animate();

    // --- OPTIMIZATION 5: Debounce resize handler for better responsiveness ---
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(resizeCanvas, 200);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameIdRef.current);
    };
  }, []);

  return <canvas ref={mainCanvasRef} className="plasma-background" />;
};

export default PlasmaEffect;

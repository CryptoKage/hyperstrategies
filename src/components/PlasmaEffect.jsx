// src/components/PlasmaEffect.jsx

import React, { useEffect, useMemo, useRef } from 'react';
import { createNoise3D } from 'simplex-noise';
import { useAnimationSettings } from '../context/AnimationSettingsContext';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const hexToRgb = (hex) => {
  const sanitized = hex.replace('#', '');
  if (sanitized.length !== 6) {
    return { r: 255, g: 255, b: 255 };
  }

  const r = parseInt(sanitized.slice(0, 2), 16);
  const g = parseInt(sanitized.slice(2, 4), 16);
  const b = parseInt(sanitized.slice(4, 6), 16);
  return { r, g, b };
};

const PlasmaEffect = () => {
  const mainCanvasRef = useRef(null);

  // --- OPTIMIZATION 2: Use refs for everything that doesn't trigger a re-render ---
  const offscreenCanvasRef = useRef(document.createElement('canvas'));
  const imageDataRef = useRef(null);
  const simplexRef = useRef(createNoise3D());
  const animationFrameIdRef = useRef(null);
  const { settings } = useAnimationSettings();

  const plasmaSettings = settings.plasma;

  const scalingFactor = clamp(Number(plasmaSettings.scalingFactor) || 1, 1, 32);
  const heightRatio = clamp(Number(plasmaSettings.heightRatio) || 0.6, 0.1, 1);
  const noiseScale = clamp(Number(plasmaSettings.noiseScale) || 0.005, 0.0001, 0.05);
  const timeScale = clamp(Number(plasmaSettings.timeScale) || 0.0005, 0.00001, 0.01);

  const { primaryColor, secondaryColor } = useMemo(
    () => ({
      primaryColor: hexToRgb(plasmaSettings.primaryColor),
      secondaryColor: hexToRgb(plasmaSettings.secondaryColor),
    }),
    [plasmaSettings.primaryColor, plasmaSettings.secondaryColor],
  );

  useEffect(() => {
    const mainCanvas = mainCanvasRef.current;
    const mainCtx = mainCanvas.getContext('2d', { alpha: false }); // alpha: false can be faster

    const offscreenCanvas = offscreenCanvasRef.current;
    const offscreenCtx = offscreenCanvas.getContext('2d');
    
    let time = 0;

    const resizeCanvas = () => {
      // Set the size of the main, visible canvas
      mainCanvas.width = window.innerWidth;
      mainCanvas.height = window.innerHeight * heightRatio;

      // Set the size of the small, off-screen canvas
      offscreenCanvas.width = Math.max(1, Math.floor(mainCanvas.width / scalingFactor));
      offscreenCanvas.height = Math.max(1, Math.floor(mainCanvas.height / scalingFactor));

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
      // This loop now runs (scalingFactor * scalingFactor) times less.
      // e.g., for a scaling factor of 8, this is 64x fewer calculations!
      for (let y = 0; y < offscreenCanvas.height; y++) {
        for (let x = 0; x < offscreenCanvas.width; x++) {
          const index = (y * offscreenCanvas.width + x) * 4;
          const noise = simplex(x * noiseScale, y * noiseScale, time * timeScale);
          const t = Math.min(0.95, (noise + 1) / 2);

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
  }, [heightRatio, scalingFactor, noiseScale, timeScale, primaryColor, secondaryColor]);

  return <canvas ref={mainCanvasRef} className="plasma-background" />;
};

export default PlasmaEffect;

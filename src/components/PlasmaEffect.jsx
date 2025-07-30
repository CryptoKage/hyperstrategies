// src/components/PlasmaEffect.jsx

import React, { useRef, useEffect } from 'react';
// --- THE FIX ---
// We import the factory function 'createNoise3D' from the library.
import { createNoise3D } from 'simplex-noise';

const PlasmaEffect = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // --- THE FIX ---
    // We call the factory function to get our noise generator.
    const simplex = createNoise3D(); 

    let animationFrameId;
    let time = 0;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      // Let's make it cover a bit more of the screen for a better effect
      canvas.height = window.innerHeight * 0.6; 
    };

    const primaryColor = { r: 63, g: 186, b: 243 };
    const secondaryColor = { r: 4, g: 14, b: 33 };

    const animate = () => {
      const imageData = ctx.createImageData(canvas.width, canvas.height);
      const data = imageData.data;
      const noiseScale = 0.005;
      const timeScale = 0.0005;

      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const index = (y * canvas.width + x) * 4;
          // --- THE FIX ---
          // The function is now just called as simplex(), not simplex.noise3D()
          const noise = simplex(x * noiseScale, y * noiseScale, time * timeScale);
          const t = (noise + 1) / 2;
          
          const r = secondaryColor.r + t * (primaryColor.r - secondaryColor.r);
          const g = secondaryColor.g + t * (primaryColor.g - secondaryColor.g);
          const b = secondaryColor.b + t * (primaryColor.b - secondaryColor.b);
          
          data[index] = r;
          data[index + 1] = g;
          data[index + 2] = b;
          data[index + 3] = 255;
        }
      }

      ctx.putImageData(imageData, 0, 0);
      time++;
      animationFrameId = requestAnimationFrame(animate);
    };
    
    resizeCanvas();
    animate();

    window.addEventListener('resize', resizeCanvas);
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="plasma-background" />;
};

export default PlasmaEffect;
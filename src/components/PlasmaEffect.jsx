// src/components/PlasmaEffect.jsx

import React, { useRef, useEffect } from 'react';
import  SimplexNoise  from 'simplex-noise';

const PlasmaEffect = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const simplex = new SimplexNoise();
    let animationFrameId;
    let time = 0;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight * 0.5; // Only cover the bottom 50%
    };

    // --- Color Palette ---
    // We'll use your brand's primary color and a related blue
    const primaryColor = { r: 63, g: 186, b: 243 }; // Your --color-primary
    const secondaryColor = { r: 4, g: 14, b: 33 };   // Your --color-background

    const animate = () => {
      const imageData = ctx.createImageData(canvas.width, canvas.height);
      const data = imageData.data;
      const noiseScale = 0.005; // How "zoomed in" the noise is
      const timeScale = 0.0005; // How fast it animates

      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const index = (y * canvas.width + x) * 4;
          // Get a noise value between -1 and 1
          const noise = simplex.noise3D(x * noiseScale, y * noiseScale, time * timeScale);
          // Normalize it to a 0-1 range for color interpolation
          const t = (noise + 1) / 2;
          
          // Linearly interpolate between the two colors
          const r = secondaryColor.r + t * (primaryColor.r - secondaryColor.r);
          const g = secondaryColor.g + t * (primaryColor.g - secondaryColor.g);
          const b = secondaryColor.b + t * (primaryColor.b - secondaryColor.b);
          
          data[index] = r;
          data[index + 1] = g;
          data[index + 2] = b;
          data[index + 3] = 255; // Full alpha
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
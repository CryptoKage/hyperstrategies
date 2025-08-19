// src/components/GalaxyCanvas.jsx
import React, { Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ScrollControls, Stars, useScroll } from '@react-three/drei';
import FloatingCard from './FloatingCard';
import { useTranslation } from 'react-i18next';

const CARD_SPACING = 7;

// This new component is our "scene" and contains the animation logic.
const Scene = ({ onScrollUpdate }) => {
  const scroll = useScroll(); // This hook gives us the scroll progress
  const { t } = useTranslation();
  const cards = ['managed', 'airdrop', 'self'];

  useFrame((state) => {
    // This function runs on every frame
    const scrollOffset = scroll.offset;
    // Animate the camera's Z position
    state.camera.position.z = 5 - scrollOffset * (cards.length * CARD_SPACING);
    // Pass the scroll offset up to the Home component
    if (onScrollUpdate) {
      onScrollUpdate(scrollOffset);
    }
  });

  return (
    <>
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      {cards.map((key, index) => (
        <FloatingCard
          key={key}
          title={t(`home.cards.${key}.title`)}
          description={t(`home.cards.${key}.text`)}
          position={[0, 0, -index * CARD_SPACING]}
        />
      ))}
    </>
  );
};

const GalaxyCanvas = ({ onScrollUpdate }) => {
  const { t } = useTranslation();
  const cards = ['managed', 'airdrop', 'self'];

  return (
    <div className="home-3d-canvas">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <Suspense fallback={null}>
          <ScrollControls pages={cards.length} damping={0.25}>
            <Scene onScrollUpdate={onScrollUpdate} />
          </ScrollControls>
        </Suspense>
      </Canvas>
    </div>
  );
};

export default GalaxyCanvas;

// /src/components/GalaxyCanvas.jsx

import React, { Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import FloatingCard from './FloatingCard';
import { useTranslation } from 'react-i18next';

const CARD_SPACING = 7;

// The Scene now just renders objects and animates based on a prop.
const Scene = ({ scrollProgress }) => {
  const { t } = useTranslation();
  const cards = ['managed', 'airdrop', 'self'];

  useFrame((state) => {
    // Animate the camera's Z position based on the scroll progress from the parent
    state.camera.position.z = 5 - scrollProgress * (cards.length * CARD_SPACING);
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

const GalaxyCanvas = ({ scrollProgress }) => {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
      <Suspense fallback={null}>
        <Scene scrollProgress={scrollProgress} />
      </Suspense>
    </Canvas>
  );
};

export default GalaxyCanvas;

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import ScrollManager from './ScrollManager';
import FloatingCard from './FloatingCard';
import { useTranslation } from 'react-i18next';
import * as THREE from 'three';

const CARD_SPACING = 7; // Increased spacing for a better feel
const START_Y = 0; // We'll handle position differently

const GalaxyCanvas = ({ onScrollUpdate }) => {
  const { t } = useTranslation();
  const cards = ['managed', 'airdrop', 'self'];

  return (
    <Canvas
      style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh' }}
      camera={{ position: [0, 0, 5], fov: 75 }}
      gl={{ outputColorSpace: THREE.SRGBColorSpace }}
    >
      <ambientLight intensity={0.8} />
      <pointLight position={[10, 10, 10]} intensity={1.5} />
      <Suspense fallback={null}>
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <ScrollManager
          distance={cards.length * CARD_SPACING}
          onScrollUpdate={onScrollUpdate}
        />
        {/* The cards are now positioned along the Z-axis for the fly-through effect */}
        {cards.map((key, index) => (
          <FloatingCard
            key={key}
            title={t(`home.cards.${key}.title`)}
            description={t(`home.cards.${key}.text`)}
            position={[0, 0, -index * CARD_SPACING]}
            delay={index * 0.2}
          />
        ))}
      </Suspense>
    </Canvas>
  );
};

export default GalaxyCanvas;

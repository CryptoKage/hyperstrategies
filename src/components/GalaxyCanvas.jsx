// src/components/GalaxyCanvas.jsx
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { ScrollControls, Stars } from '@react-three/drei';
import ScrollManager from './ScrollManager'; // Import the brain
import FloatingCard from './FloatingCard'; // Import the card
import { useTranslation } from 'react-i18next';

const CARD_SPACING = 5;
const START_Y = -2;

const GalaxyCanvas = () => {
  const { t } = useTranslation();

  const cards = ['managed', 'airdrop', 'self'];

  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
      {/* Add some ambient light to see the cards */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />

      <Suspense fallback={null}>
        <ScrollControls pages={cards.length} damping={0.3}>
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />

          {/* --- This is where we add our new components --- */}
          <ScrollManager distance={CARD_SPACING * cards.length} />

          {/* We place our cards at different Y positions in the 3D space */}
          {cards.map((key, index) => (
            <FloatingCard
              key={key}
              title={t(`home.cards.${key}.title`)}
              description={t(`home.cards.${key}.text`)}
              position={[0, START_Y - index * CARD_SPACING, 0]}
              delay={index * 0.2}
            />
          ))}
        </ScrollControls>
      </Suspense>
    </Canvas>
  );
};

export default GalaxyCanvas;

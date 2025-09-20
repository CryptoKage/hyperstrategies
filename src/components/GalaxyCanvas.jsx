// src/components/GalaxyCanvas.jsx
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import FloatingCard from './FloatingCard';
import ScrollManager from './ScrollManager';

const CARD_SPACING = 7;

const Scene = ({ cards }) => (
  <>
    <color attach="background" args={['#020617']} />
    <ambientLight intensity={0.6} />
    <Stars radius={80} depth={40} count={4000} factor={4} saturation={0} fade speed={0.6} />
    {cards.map((card, index) => (
      <FloatingCard
        key={card.key}
        title={card.title}
        description={card.description}
        position={[0, 0, -index * CARD_SPACING]}
        delay={index * 0.2}
      />
    ))}
  </>
);

const GalaxyCanvas = ({ cards = [], onScrollUpdate }) => {
  const safeCards = cards.filter(Boolean);
  const travelDistance = safeCards.length * CARD_SPACING;

  return (
    <div className="home-3d-canvas">
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }} dpr={[1, 1.5]}>
        <Suspense fallback={null}>
          <ScrollManager distance={travelDistance} onScrollUpdate={onScrollUpdate} />
          <Scene cards={safeCards} />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default GalaxyCanvas;

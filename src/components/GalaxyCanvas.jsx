/ src/components/GalaxyCanvas.jsx
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { ScrollControls, Stars } from '@react-three/drei';
import ScrollManager from './ScrollManager';
import FloatingCard from './FloatingCard';
import { useTranslation } from 'react-i18next';
import * as THREE from 'three'; // We need to import 'three' to use its constants
const CARD_SPACING = 5;
const START_Y = -2;
const GalaxyCanvas = () => {
const { t } = useTranslation();
const cards = ['managed', 'airdrop', 'self'];
return (
// --- THE FIX IS HERE ---
// We are adding the 'gl' prop to explicitly set the color space.
// This overrides the broken default setting.
<Canvas
camera={{ position: [0, 0, 5], fov: 75 }}
gl={{ outputColorSpace: THREE.SRGBColorSpace }}
>
<ambientLight intensity={0.5} />
<pointLight position={[10, 10, 10]} intensity={1} />
<Suspense fallback={null}>
    <ScrollControls pages={cards.length} damping={0.3}>
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />
      <ScrollManager distance={CARD_SPACING * cards.length} />
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

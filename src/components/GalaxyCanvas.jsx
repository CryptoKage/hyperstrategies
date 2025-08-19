// src/components/GalaxyCanvas.jsx
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { ScrollControls, Stars } from '@react-three/drei';

// This is a placeholder for our future scroll manager
const ScrollManager = () => {
  return null;
};

// This is a placeholder for our future 3D cards
const FloatingCard = ({ position, title }) => {
  return (
    <mesh position={position}>
      {/* We will build the actual card here later */}
    </mesh>
  );
};

const GalaxyCanvas = () => {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
      {/* Suspense is a React feature that lets us show a fallback while 3D assets load */}
      <Suspense fallback={null}>
        {/* ScrollControls is the key. It links the scrollbar to the 3D scene. */}
        <ScrollControls pages={4} damping={0.3}>
          {/* A pre-built, beautiful 3D starfield */}
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />
          
          {/* We will add our 3D cards and scroll manager here later */}
          {/* <ScrollManager /> */}
          {/* <FloatingCard position={[0, 0, 0]} title="Vaults" /> */}
          {/* <FloatingCard position={[0, -5, 0]} title="Leaderboard" /> */}
          
        </ScrollControls>
      </Suspense>
    </Canvas>
  );
};

export default GalaxyCanvas;

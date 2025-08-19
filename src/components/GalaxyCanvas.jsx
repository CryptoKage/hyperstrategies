// src/components/GalaxyCanvas.jsx
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { ScrollControls, Stars } from '@react-three/drei';
import ScrollManager from './ScrollManager'; // Import the brain
import FloatingCard from './FloatingCard';   // Import the card

const GalaxyCanvas = ({ onScroll }) => {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
      {/* Add some ambient light to see the cards */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      
      <Suspense fallback={null}>
        <ScrollControls pages={3} damping={0.3}>
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />
          
            {/* --- This is where we add our new components --- */}
            <ScrollManager onScroll={onScroll} />
          
          {/* We place our cards at different Y positions in the 3D space */}
          <FloatingCard 
            title="Invest in Managed Vaults"
            description="Deposit and let our systems and traders work for you in curated, high-performance vaults."
            position={[0, -2, 0]} 
          />
          <FloatingCard 
            title="XP, Tiers & Leaderboard"
            description="Engage with the platform to earn XP, climb account tiers, and compete for future token allocations."
            position={[0, -7, 0]} 
          />
          <FloatingCard 
            title="Strategy Builder Engine"
            description="Coming Soon: A powerful engine to build, backtest, and deploy your own automated trading strategies."
            position={[0, -12, 0]} 
          />
        </ScrollControls>
      </Suspense>
    </Canvas>
  );
};

export default GalaxyCanvas;

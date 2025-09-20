import React, { useMemo, useRef } from 'react';
import { Float, Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { MathUtils } from 'three';

const FloatingCard = ({ title, description, position, delay = 0 }) => {
  const groupRef = useRef();
  const baseScale = 0.85;
  const speed = useMemo(() => 0.6 + delay * 0.3, [delay]);
  const delaySeconds = delay * 0.4;
  const animationDuration = 0.6;
  const startTimeRef = useRef(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) {
      return;
    }

    if (startTimeRef.current === null) {
      startTimeRef.current = clock.elapsedTime;
    }

    const elapsed = clock.elapsedTime - startTimeRef.current;
    const progress = Math.max(elapsed - delaySeconds, 0);
    const normalized = Math.min(progress / animationDuration, 1);
    const eased = MathUtils.smoothstep(normalized, 0, 1);
    const nextScale = MathUtils.lerp(baseScale, 1, eased);
    groupRef.current.scale.setScalar(nextScale);
  });

  return (
    <Float
      position={position}
      speed={speed}
      rotationIntensity={0.18}
      floatIntensity={0.45}
      floatingRange={[-0.4, 0.4]}
    >
      <group ref={groupRef} scale={baseScale}>
        <Text
          position={[0, 0.5, 0.1]}
          fontSize={0.3}
          color="#3fbaf3"
          anchorX="center"
          anchorY="middle"
        >
          {title}
        </Text>
        <Text
          position={[0, -0.1, 0.1]}
          fontSize={0.15}
          color="#a0aec0"
          maxWidth={3.5}
          textAlign="center"
          anchorX="center"
          anchorY="middle"
          lineHeight={1.5}
        >
          {description}
        </Text>
      </group>
    </Float>
  );
};

export default FloatingCard;

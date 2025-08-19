// src/components/FloatingCard.jsx
import React from 'react';
import { Text, Plane } from '@react-three/drei';

const FloatingCard = ({ title, description, position }) => {
  return (
    <group position={position}>
      <Plane args={[4, 2]} /* width, height */ >
        <meshStandardMaterial color="#101827" metalness={0.1} roughness={0.2} />
      </Plane>
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
        position={[0, 0, 0.1]}
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
  );
};

export default FloatingCard;

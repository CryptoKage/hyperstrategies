// src/components/FloatingCard.jsx
import React from 'react';
import { Text, Plane } from '@react-three/drei';
import { motion } from 'framer-motion';

const FloatingCard = ({ title, description, position, delay = 0 }) => {
  return (
    <motion.group
      position={position}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay }}
    >
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
    </motion.group>
  );
};

export default FloatingCard;

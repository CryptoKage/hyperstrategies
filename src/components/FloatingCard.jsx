import React from 'react';
import { Text } from '@react-three/drei';
import { motion } from 'framer-motion';

const FloatingCard = ({ title, description, position, delay = 0 }) => {
  return (
    <motion.group
      position={position}
      initial={{ opacity: 0, scale: 0.8, y: position[1] + 2 }}
      animate={{ opacity: 1, scale: 1, y: position[1] }}
      transition={{ duration: 0.8, delay, ease: 'easeOut' }}
    >
      <Text
        position={[0, 0.5, 0.1]}
        fontSize={0.3}
        color="#3fbaf3"
        anchorX="center"
        anchorY="middle"
        // --- THE FIX: Removed the 'font' prop to use the default ---
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
        // --- THE FIX: Removed the 'font' prop to use the default ---
      >
        {description}
      </Text>
    </motion.group>
  );
};

export default FloatingCard;

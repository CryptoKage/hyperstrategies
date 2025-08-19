import { useScroll } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

const ScrollManager = ({ distance, onScrollUpdate }) => {
  const scroll = useScroll();

  useFrame((state) => {
    const scrollOffset = scroll.offset;
    // Animate the camera's Z position for a "flying through space" effect
    state.camera.position.z = 5 - scrollOffset * distance;
    
    if (onScrollUpdate) {
      onScrollUpdate(scrollOffset);
    }
  });

  return null;
};

export default ScrollManager;

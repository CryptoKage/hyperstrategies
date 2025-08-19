import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';

const ScrollManager = ({ distance, onScrollUpdate }) => {
  const scrollRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const offset = docHeight > 0 ? scrollY / docHeight : 0;
      scrollRef.current = offset;
      if (onScrollUpdate) {
        onScrollUpdate(offset);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [onScrollUpdate]);

  useFrame((state) => {
    const scrollOffset = scrollRef.current;
    state.camera.position.z = 5 - scrollOffset * distance;
  });

  return null;
};

export default ScrollManager;

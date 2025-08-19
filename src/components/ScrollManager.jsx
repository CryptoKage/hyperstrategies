import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';

const ScrollManager = ({ distance, onScrollUpdate }) => {
  const scrollRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const wrapper = document.querySelector('.home-3d-wrapper');
      const scrollY = window.scrollY;
      const wrapperHeight = wrapper ? wrapper.offsetHeight - window.innerHeight : 0;
      const offset = wrapperHeight > 0 ? Math.min(scrollY / wrapperHeight, 1) : 0;
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

import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';

const ScrollManager = ({ distance = 0, onScrollUpdate, scrollContainerId = 'home-3d-wrapper' }) => {
  const scrollRef = useRef(0);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return () => {};
    }

    const handleScroll = () => {
      const wrapper = document.getElementById(scrollContainerId);
      const scrollY = window.scrollY;
      const wrapperHeight = wrapper ? wrapper.offsetHeight - window.innerHeight : 0;
      const offset = wrapperHeight > 0 ? Math.min(scrollY / wrapperHeight, 1) : 0;
      scrollRef.current = offset;
      if (onScrollUpdate) {
        onScrollUpdate(offset);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [onScrollUpdate, scrollContainerId]);

  useFrame((state) => {
    const scrollOffset = scrollRef.current;
    const travelDistance = Math.max(distance, 0);
    state.camera.position.z = 5 - scrollOffset * travelDistance;
  });

  return null;
};

export default ScrollManager;

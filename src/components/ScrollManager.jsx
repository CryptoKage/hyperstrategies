import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';

const ScrollManager = ({ distance = 0, onScrollUpdate, scrollContainerId = 'home-3d-wrapper' }) => {
  const scrollRef = useRef(0);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return () => {};
    }

    let animationFrame;

    const readProgress = () => {
      const wrapper = document.getElementById(scrollContainerId);

      if (!wrapper) {
        return 0;
      }

      const wrapperRect = wrapper.getBoundingClientRect();
      const wrapperTop = wrapperRect.top + window.scrollY;
      const wrapperHeight = wrapper.offsetHeight;
      const maxScroll = Math.max(wrapperHeight - window.innerHeight, 0);

      if (maxScroll === 0) {
        return 0;
      }

      const relativeScroll = window.scrollY - wrapperTop;
      return Math.min(Math.max(relativeScroll / maxScroll, 0), 1);
    };

    const update = () => {
      const offset = readProgress();
      scrollRef.current = offset;
      if (onScrollUpdate) {
        onScrollUpdate(offset);
      }
    };

    const handleScroll = () => {
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(update);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    handleScroll();

    return () => {
      cancelAnimationFrame(animationFrame);
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

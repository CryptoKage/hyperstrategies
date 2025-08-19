// src/components/ScrollManager.jsx
import { useScroll } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';


const ScrollManager = ({ distance = 15 }) => {
=======

  const scroll = useScroll();

  // useFrame is a hook that runs on every single rendered frame
  useFrame((state) => {
    // state.camera is the main scene camera
    // scroll.offset is a value from 0 (top) to 1 (bottom)
    const scrollOffset = scroll.offset;

    // Animate the camera's Y position based on the scroll

    state.camera.position.y = -scrollOffset * distance; // Total scroll distance


  });

  return null; // This component doesn't render anything visible
};

export default ScrollManager;

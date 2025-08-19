import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber';
import { OrbitControls as ThreeOrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

extend({ OrbitControls: ThreeOrbitControls });

function Controls() {
  const { camera, gl } = useThree();
  const ref = useRef();
  return <orbitControls ref={ref} args={[camera, gl.domElement]} enablePan={false} />;
}

function Stars({ seed }) {
  const group = useRef();
  const positions = useMemo(() => {
    const rng = mulberry32(seed || 1);
    const arr = new Float32Array(1000 * 3);
    for (let i = 0; i < 1000; i++) {
      arr[i * 3] = (rng() - 0.5) * 50;
      arr[i * 3 + 1] = (rng() - 0.5) * 50;
      arr[i * 3 + 2] = (rng() - 0.5) * 50;
    }
    return arr;
  }, [seed]);

  useFrame(() => {
    if (group.current) {
      group.current.rotation.y += 0.0005;
    }
  });

  return (
    <group ref={group}>
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={positions}
            count={positions.length / 3}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial color="#ffffff" size={0.2} sizeAttenuation />
      </points>
    </group>
  );
}

const GalaxyCanvas = ({ seed }) => {
  const handleWheel = (e) => {
    e.preventDefault();
  };
  return (
    <div className="galaxy-canvas" onWheel={handleWheel}>
      <Canvas camera={{ position: [0, 0, 20], fov: 75 }} dpr={[1, 2]}>
        <Controls />
        <Stars seed={seed} />
      </Canvas>
    </div>
  );
};

function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default GalaxyCanvas;

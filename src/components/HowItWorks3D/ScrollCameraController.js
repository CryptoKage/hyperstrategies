import { useEffect, useRef } from 'react';

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const easeInOutQuad = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

export default function ScrollCameraController({ sceneAPI, keyframes, onSectionChange }) {
  const rafRef = useRef(null);
  const lastSection = useRef(-1);
  const lookAtTarget = useRef({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    if (!sceneAPI || !sceneAPI.camera) {
      return undefined;
    }

    const camera = sceneAPI.camera;
    let ticking = false;

    const getProgress = () => {
      const scrollEl = document.scrollingElement || document.documentElement;
      const total = scrollEl.scrollHeight - window.innerHeight;
      if (total <= 0) return 0;
      return clamp(scrollEl.scrollTop / total);
    };

    const updateCamera = (progress) => {
      if (!keyframes || keyframes.length === 0) return;
      let index = keyframes.length - 1;
      for (let i = 0; i < keyframes.length; i += 1) {
        if (progress < keyframes[i].t) {
          index = Math.max(0, i - 1);
          break;
        }
      }

      const start = keyframes[index];
      const end = keyframes[Math.min(index + 1, keyframes.length - 1)];
      const range = Math.max(0.0001, end.t - start.t);
      const local = clamp((progress - start.t) / range);
      const eased = easeInOutQuad(local);

      const interpolate = (a, b) => a + (b - a) * eased;

      camera.position.set(
        interpolate(start.camera.pos[0], end.camera.pos[0]),
        interpolate(start.camera.pos[1], end.camera.pos[1]),
        interpolate(start.camera.pos[2], end.camera.pos[2])
      );

      const target = lookAtTarget.current;
      target.x = interpolate(start.camera.lookAt[0], end.camera.lookAt[0]);
      target.y = interpolate(start.camera.lookAt[1], end.camera.lookAt[1]);
      target.z = interpolate(start.camera.lookAt[2], end.camera.lookAt[2]);
      camera.lookAt(target.x, target.y, target.z);

      if (typeof camera.updateProjectionMatrix === 'function') {
        camera.updateMatrixWorld();
      }

      const section = keyframes[index].section ?? index;
      if (section !== lastSection.current) {
        lastSection.current = section;
        if (keyframes[index]?.onEnter) {
          sceneAPI.triggerEvent?.(keyframes[index].onEnter);
        }
        onSectionChange?.(section);
      }

      const flowStart = keyframes[1] ? keyframes[1].t - 0.07 : 0.2;
      const flowEnd = keyframes[1] ? keyframes[1].t + 0.15 : 0.45;
      const flowProgress = clamp((progress - flowStart) / (flowEnd - flowStart));
      sceneAPI.setFlowMix?.({
        main: flowProgress * (sceneAPI.flowDistribution?.main ?? 0.8),
        safety: flowProgress * (sceneAPI.flowDistribution?.safety ?? 0.1),
        farming: flowProgress * (sceneAPI.flowDistribution?.farming ?? 0.05),
        token: flowProgress * (sceneAPI.flowDistribution?.token ?? 0.05),
      });

      if (progress < flowStart) {
        sceneAPI.triggerEvent?.('overview');
      } else if (progress >= keyframes[keyframes.length - 1].t) {
        sceneAPI.triggerEvent?.('innerLoop');
      }
    };

    const update = () => {
      ticking = false;
      const progress = getProgress();
      updateCamera(progress);
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        rafRef.current = requestAnimationFrame(update);
      }
    };

    const onResize = () => {
      onScroll();
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    update();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [sceneAPI, keyframes, onSectionChange]);

  return null;
}

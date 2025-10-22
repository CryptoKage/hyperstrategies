import { useEffect, useRef } from 'react';

const clamp01 = (value) => Math.min(1, Math.max(0, value));

const EDGE_LABELS = [
  'edge-deposit_strategies',
  'edge-deposit_safety',
  'edge-deposit_farming',
  'edge-deposit_token',
];

const FLOW_EDGES = [
  'deposit->strategies',
  'deposit->safety',
  'deposit->farming',
  'deposit->token',
];

const getProgress = (scrollElement) => {
  const total = scrollElement.scrollHeight - window.innerHeight;
  if (total <= 0) {
    return 0;
  }
  return clamp01(scrollElement.scrollTop / total);
};

const getNormalized = (progress, segment) => {
  if (!segment || segment.end <= segment.start) {
    return 0;
  }
  return clamp01((progress - segment.start) / (segment.end - segment.start));
};

const resetFlows = (sceneAPI) => {
  FLOW_EDGES.forEach((edge) => sceneAPI.setFlowIntensity?.(edge, 0));
  EDGE_LABELS.forEach((label) => sceneAPI.setLabelOpacity?.(label, 0));
};

export default function ScrollSceneController({ sceneAPI, scenes = [] }) {
  const lastSegmentRef = useRef(null);
  const frameRef = useRef(null);
  const lastProgressRef = useRef(0);

  useEffect(() => {
    if (!sceneAPI || !scenes.length) {
      return undefined;
    }

    const scrollElement = document.scrollingElement || document.documentElement;
    const getSegment = (id) => scenes.find((scene) => scene.id === id);

    const overview = getSegment('overview');
    const moneyFlow = getSegment('moneyFlow');
    const strategy = getSegment('strategy');
    const innerLoop = getSegment('innerLoop');

    const applyFlowProgress = (progress) => {
      const moneyProgress = getNormalized(progress, moneyFlow);
      if (moneyProgress > 0 && moneyProgress < 1) {
        sceneAPI.setFlowIntensity?.('deposit->strategies', moneyProgress);
        sceneAPI.setFlowIntensity?.('deposit->safety', clamp01(moneyProgress * 0.25));
        sceneAPI.setFlowIntensity?.('deposit->farming', clamp01(moneyProgress * 0.125));
        sceneAPI.setFlowIntensity?.('deposit->token', clamp01(moneyProgress * 0.125));
        EDGE_LABELS.forEach((label) => sceneAPI.setLabelOpacity?.(label, moneyProgress));
        return;
      }

      if (progress >= (innerLoop?.end ?? 1)) {
        sceneAPI.setFlowIntensity?.('deposit->strategies', 0.4);
        sceneAPI.setFlowIntensity?.('deposit->safety', 0.12);
        sceneAPI.setFlowIntensity?.('deposit->farming', 0.08);
        sceneAPI.setFlowIntensity?.('deposit->token', 0.08);
        EDGE_LABELS.forEach((label) => sceneAPI.setLabelOpacity?.(label, 1));
        return;
      }

      if (progress <= (overview?.end ?? 0)) {
        resetFlows(sceneAPI);
        return;
      }

      if (moneyProgress >= 1) {
        sceneAPI.setFlowIntensity?.('deposit->strategies', 1);
        sceneAPI.setFlowIntensity?.('deposit->safety', 0.25);
        sceneAPI.setFlowIntensity?.('deposit->farming', 0.125);
        sceneAPI.setFlowIntensity?.('deposit->token', 0.125);
        EDGE_LABELS.forEach((label) => sceneAPI.setLabelOpacity?.(label, 1));
        return;
      }

      resetFlows(sceneAPI);
    };

    const emitSegmentEvents = (progress) => {
      const current = scenes.find((scene) => progress >= scene.start && progress < scene.end) || scenes[scenes.length - 1];
      if (!current || current.id === lastSegmentRef.current) {
        return;
      }

      lastSegmentRef.current = current.id;
      switch (current.id) {
        case 'overview':
          resetFlows(sceneAPI);
          sceneAPI.triggerEvent?.('overview');
          break;
        case 'moneyFlow':
          sceneAPI.triggerEvent?.('moneyFlow');
          break;
        case 'strategy':
          sceneAPI.triggerEvent?.('strategyHub');
          sceneAPI.pulseHub?.('strategies', 1.2);
          sceneAPI.pulseHub?.('core', 1.1);
          sceneAPI.pulseHub?.('high', 1.08);
          break;
        case 'innerLoop':
          sceneAPI.triggerEvent?.('innerLoop');
          sceneAPI.pulseHub?.('core', 1.18);
          sceneAPI.pulseHub?.('high', 1.12);
          break;
        default:
          break;
      }
    };

    const updateForProgress = (progress) => {
      lastProgressRef.current = progress;
      emitSegmentEvents(progress);
      applyFlowProgress(progress);
    };

    const handleScroll = () => {
      const progress = getProgress(scrollElement);
      if (progress === lastProgressRef.current) {
        return;
      }
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = null;
        updateForProgress(progress);
      });
    };

    resetFlows(sceneAPI);
    sceneAPI.triggerEvent?.('overview');
    updateForProgress(getProgress(scrollElement));

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      lastSegmentRef.current = null;
      lastProgressRef.current = 0;
      resetFlows(sceneAPI);
      sceneAPI.triggerEvent?.('overview');
    };
  }, [sceneAPI, scenes]);

  return null;
}

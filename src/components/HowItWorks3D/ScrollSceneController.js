import { useEffect, useRef } from 'react';
import { createTimeline } from 'animejs';

const clamp01 = (value) => Math.min(1, Math.max(0, value));

const EDGE_LABELS = [
  'edge-deposit_strategies',
  'edge-deposit_safety',
  'edge-deposit_farming',
  'edge-deposit_token',
];

export default function ScrollSceneController({ sceneAPI, scenes = [] }) {
  const timelineRef = useRef(null);

  useEffect(() => {
    if (!sceneAPI || !scenes.length) {
      return undefined;
    }

    const duration = 10000;
    const getSegment = (id) => scenes.find((scene) => scene.id === id);

    const resetEdges = () => {
      ['deposit->strategies', 'deposit->safety', 'deposit->farming', 'deposit->token'].forEach((edge) => {
        sceneAPI.setFlowIntensity?.(edge, 0);
      });
      EDGE_LABELS.forEach((label) => sceneAPI.setLabelOpacity?.(label, 0));
    };

    resetEdges();
    sceneAPI.triggerEvent?.('overview');

    const timeline = createTimeline({ autoplay: false, duration, playbackEase: 'linear' });
    timelineRef.current = timeline;

    const overview = getSegment('overview');
    if (overview) {
      timeline.add(
        {
          duration: (overview.end - overview.start) * duration,
          onBegin: () => {
            resetEdges();
            sceneAPI.triggerEvent?.('overview');
          },
        },
        overview.start * duration
      );
    }

    const moneyFlow = getSegment('moneyFlow');
    if (moneyFlow) {
      timeline.add(
        {
          duration: (moneyFlow.end - moneyFlow.start) * duration,
          onBegin: () => sceneAPI.triggerEvent?.('moneyFlow'),
          onUpdate: (anim) => {
            const progress = anim.progress;
            sceneAPI.setFlowIntensity?.('deposit->strategies', progress);
            sceneAPI.setFlowIntensity?.('deposit->safety', clamp01(progress * 0.25));
            sceneAPI.setFlowIntensity?.('deposit->farming', clamp01(progress * 0.125));
            sceneAPI.setFlowIntensity?.('deposit->token', clamp01(progress * 0.125));
            EDGE_LABELS.forEach((label) => sceneAPI.setLabelOpacity?.(label, progress));
          },
        },
        moneyFlow.start * duration
      );
    }

    const strategy = getSegment('strategy');
    if (strategy) {
      timeline.add(
        {
          duration: (strategy.end - strategy.start) * duration,
          onBegin: () => {
            sceneAPI.triggerEvent?.('strategyHub');
            sceneAPI.pulseHub?.('strategies', 1.2);
            sceneAPI.pulseHub?.('core', 1.1);
            sceneAPI.pulseHub?.('high', 1.08);
          },
        },
        strategy.start * duration
      );
    }

    const innerLoop = getSegment('innerLoop');
    if (innerLoop) {
      timeline.add(
        {
          duration: (innerLoop.end - innerLoop.start) * duration,
          onBegin: () => {
            sceneAPI.triggerEvent?.('innerLoop');
            sceneAPI.pulseHub?.('core', 1.18);
            sceneAPI.pulseHub?.('high', 1.12);
          },
          onComplete: () => {
            sceneAPI.setFlowIntensity?.('deposit->strategies', 0.4);
            sceneAPI.setFlowIntensity?.('deposit->safety', 0.12);
            sceneAPI.setFlowIntensity?.('deposit->farming', 0.08);
            sceneAPI.setFlowIntensity?.('deposit->token', 0.08);
            EDGE_LABELS.forEach((label) => sceneAPI.setLabelOpacity?.(label, 1));
          },
        },
        innerLoop.start * duration
      );
    }

    const handleScroll = () => {
      const scrollEl = document.scrollingElement || document.documentElement;
      const total = scrollEl.scrollHeight - window.innerHeight;
      const progress = total > 0 ? scrollEl.scrollTop / total : 0;
      timeline.seek(progress * duration);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      timeline.pause();
      timelineRef.current = null;
      resetEdges();
      sceneAPI.triggerEvent?.('overview');
    };
  }, [sceneAPI, scenes]);

  return null;
}

import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { useTranslation } from 'react-i18next';
import copy from '../../data/site_copy.json';

const DEFAULT_FLOW = {
  main: 0.8,
  safety: 0.1,
  farming: 0.05,
  token: 0.05,
};

const FLOW_COUNTS = {
  main: 120,
  safety: 20,
  farming: 12,
  token: 12,
};

const FLOW_SPEED = {
  main: 0.36,
  safety: 0.28,
  farming: 0.3,
  token: 0.3,
};

const CUBE_SIZE = 0.18;
const SLOT_SPACING = CUBE_SIZE * 1.25;
const SLOT_RANDOMNESS = CUBE_SIZE * 0.08;
const SLOT_TRANSITION = 0.35;

const palette = {
  main: new THREE.Color('#00c6e6'),
  safety: new THREE.Color('#00F5A0'),
  farming: new THREE.Color('#0099FF'),
  token: new THREE.Color('#9B5CF6'),
  user: new THREE.Color('#E6F7FF'),
  edges: new THREE.Color('#6FA8C9'),
  buyback: new THREE.Color('#FF7A59'),
  rewards: new THREE.Color('#6FA8C9'),
};

const HUB_DEFS = [
  { id: 'userIn', pos: [-2.4, 0.1, 0.0], color: palette.user },
  { id: 'deposit', pos: [-1.4, 0.1, 0.0], color: palette.main },
  { id: 'strategies', pos: [0.0, 0.15, 0.0], color: palette.main },
  { id: 'core', pos: [0.9, -0.15, 0.2], color: palette.main },
  { id: 'high', pos: [0.9, 0.35, -0.15], color: palette.token },
  { id: 'safety', pos: [1.6, 0.55, 0.6], color: palette.safety },
  { id: 'farming', pos: [1.6, -0.25, -0.55], color: palette.farming },
  { id: 'token', pos: [1.6, 0.25, 0.0], color: palette.token },
  { id: 'buyback', pos: [1.4, -0.55, 0.55], color: palette.buyback },
  { id: 'rewards', pos: [1.4, 0.55, -0.55], color: palette.rewards },
  { id: 'userOut', pos: [-2.4, -0.2, -0.2], color: palette.user },
];

const EDGE_DEFS = [
  { id: 'userIn_deposit', from: 'userIn', to: 'deposit', kind: 'in', color: palette.edges },
  { id: 'deposit_strategies', from: 'deposit', to: 'strategies', kind: 'main', color: palette.main },
  { id: 'deposit_safety', from: 'deposit', to: 'safety', kind: 'side', color: palette.safety },
  { id: 'deposit_farming', from: 'deposit', to: 'farming', kind: 'side', color: palette.farming },
  { id: 'deposit_token', from: 'deposit', to: 'token', kind: 'side', color: palette.token },
  { id: 'strategies_core', from: 'strategies', to: 'core', kind: 'internal', color: palette.main },
  { id: 'strategies_high', from: 'strategies', to: 'high', kind: 'internal', color: palette.token },
  { id: 'strategies_rewards', from: 'strategies', to: 'rewards', kind: 'program', color: palette.rewards },
  { id: 'core_userOut', from: 'core', to: 'userOut', kind: 'out', color: palette.main },
  { id: 'high_userOut', from: 'high', to: 'userOut', kind: 'out', color: palette.token },
  { id: 'core_buyback', from: 'core', to: 'buyback', kind: 'revenue', color: palette.buyback },
  { id: 'high_buyback', from: 'high', to: 'buyback', kind: 'revenue', color: palette.buyback },
  { id: 'safety_userOut', from: 'safety', to: 'userOut', kind: 'out', color: palette.safety },
  { id: 'farming_userOut', from: 'farming', to: 'userOut', kind: 'out', color: palette.farming },
  { id: 'token_userOut', from: 'token', to: 'userOut', kind: 'out', color: palette.token },
  { id: 'rewards_userOut', from: 'rewards', to: 'userOut', kind: 'benefit', color: palette.rewards },
];

const MAIN_SPLIT = { core: 0.6, high: 0.4 };

const HUB_DWELL = {
  deposit: 0.7,
  strategies: 1.1,
  safety: 1.2,
  farming: 1,
  token: 1,
  core: 0.9,
  high: 1.1,
  buyback: 1.4,
  rewards: 1.3,
  userOut: 1.5,
};

const ROUTE_VARIANTS = {
  main: {
    coreOut: ['userIn_deposit', 'deposit_strategies', 'strategies_core', 'core_userOut'],
    highOut: ['userIn_deposit', 'deposit_strategies', 'strategies_high', 'high_userOut'],
    coreBuyback: ['userIn_deposit', 'deposit_strategies', 'strategies_core', 'core_buyback'],
    highBuyback: ['userIn_deposit', 'deposit_strategies', 'strategies_high', 'high_buyback'],
    rewards: ['userIn_deposit', 'deposit_strategies', 'strategies_rewards', 'rewards_userOut'],
  },
  safety: [['userIn_deposit', 'deposit_safety', 'safety_userOut']],
  farming: [['userIn_deposit', 'deposit_farming', 'farming_userOut']],
  token: [['userIn_deposit', 'deposit_token', 'token_userOut']],
};

const MAIN_ROUTE_SEQUENCE = [
  ROUTE_VARIANTS.main.coreOut,
  ROUTE_VARIANTS.main.coreOut,
  ROUTE_VARIANTS.main.highOut,
  ROUTE_VARIANTS.main.coreOut,
  ROUTE_VARIANTS.main.coreBuyback,
  ROUTE_VARIANTS.main.highOut,
  ROUTE_VARIANTS.main.coreOut,
  ROUTE_VARIANTS.main.highBuyback,
  ROUTE_VARIANTS.main.coreOut,
  ROUTE_VARIANTS.main.highOut,
  ROUTE_VARIANTS.main.rewards,
  ROUTE_VARIANTS.main.coreOut,
];

const clamp01 = (value) => Math.min(1, Math.max(0, value));

const emitTelemetry = (name, detail) => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(name, { detail }));
};

function buildEdgeCurve(from, to, kind) {
  const start = new THREE.Vector3().fromArray(from);
  const end = new THREE.Vector3().fromArray(to);
  const mid = start.clone().lerp(end, 0.5);
  switch (kind) {
    case 'in':
      mid.y += 0.5;
      mid.z += 0.2;
      break;
    case 'side':
      mid.y += 0.35;
      mid.x += end.x > start.x ? 0.4 : -0.2;
      mid.z += (end.z - start.z) * 0.35;
      break;
    case 'internal':
      mid.y += 0.18;
      mid.x += 0.22;
      break;
    case 'out':
      mid.y -= 0.25;
      mid.x -= 0.35;
      break;
    case 'revenue':
      mid.y -= 0.2;
      mid.x += 0.25;
      mid.z += (end.z - start.z) * 0.4;
      break;
    case 'program':
      mid.y += 0.25;
      mid.x += 0.4;
      mid.z += (end.z - start.z) * 0.6;
      break;
    case 'benefit':
      mid.y -= 0.12;
      mid.x -= 0.45;
      mid.z += (end.z - start.z) * 0.2;
      break;
    default:
      break;
  }

  const points = [start, mid, end];
  return new THREE.CatmullRomCurve3(points);
}

function generateSlots(position, capacity = 27) {
  const base = new THREE.Vector3().fromArray(position);
  const offsets = [];
  const grid = Math.max(3, Math.round(Math.cbrt(capacity)));
  const half = Math.floor(grid / 2);
  for (let x = -half; x <= half; x += 1) {
    for (let y = -half; y <= half; y += 1) {
      for (let z = -half; z <= half; z += 1) {
        if (offsets.length >= capacity) break;
        const offset = new THREE.Vector3(
          x * SLOT_SPACING + (Math.random() - 0.5) * SLOT_RANDOMNESS,
          y * SLOT_SPACING + (Math.random() - 0.5) * SLOT_RANDOMNESS,
          z * SLOT_SPACING + (Math.random() - 0.5) * SLOT_RANDOMNESS
        );
        offsets.push(base.clone().add(offset));
      }
    }
  }
  return offsets;
}

export default function FlowSceneCubes({ canvasRef, overlayRef, onReady, locale = 'en' }) {
  const animationState = useRef({ frame: null });
  const { t } = useTranslation();
  const flows = copy.flow?.distribution || DEFAULT_FLOW;

  const numberFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        maximumFractionDigits: 0,
      }),
    [locale]
  );

  const formatPercent = useMemo(
    () => (value) => t('howItWorks.percent', { value: numberFormatter.format(Math.round(value)) }),
    [numberFormatter, t]
  );

  const labelCopy = useMemo(() => {
    return {
      userIn: {
        title: t('howItWorks.labels.user'),
        description: t('howItWorks.descriptions.user'),
      },
      deposit: {
        title: t('howItWorks.labels.deposits'),
        description: t('howItWorks.descriptions.deposits'),
      },
      strategies: {
        title: t('howItWorks.labels.strategiesHub'),
        description: formatPercent(flows.main * 100),
      },
      core: {
        title: t('howItWorks.labels.coreStrategy'),
        description: formatPercent(MAIN_SPLIT.core * 100),
      },
      high: {
        title: t('howItWorks.labels.highStrategy'),
        description: formatPercent(MAIN_SPLIT.high * 100),
      },
      safety: {
        title: t('howItWorks.labels.safetyFund'),
        description: formatPercent(flows.safety * 100),
      },
      farming: {
        title: t('howItWorks.labels.farming'),
        description: formatPercent(flows.farming * 100),
      },
      token: {
        title: t('howItWorks.labels.tokenSeeding'),
        description: formatPercent(flows.token * 100),
      },
      buyback: {
        title: t('cards.buyback.title'),
        description: t('cards.buyback.body'),
      },
      rewards: {
        title: t('cards.rewards.title'),
        description: t('cards.rewards.body'),
      },
      userOut: {
        title: t('howItWorks.labels.userOut'),
        description: t('howItWorks.descriptions.userOut'),
      },
      innerLoop: {
        title: t('howItWorks.labels.innerLoop'),
        description: t('howItWorks.descriptions.innerLoop'),
      },
    };
  }, [flows, formatPercent, t]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const overlay = overlayRef?.current;

    if (!canvas || !overlay) {
      return undefined;
    }

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = false;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050f19, 0.075);

    const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 120);
    camera.position.set(0, 2.2, 6.2);

    const ambient = new THREE.AmbientLight(0x22485c, 0.6);
    scene.add(ambient);

    const hemi = new THREE.HemisphereLight(0x6fb9ff, 0x031120, 0.85);
    scene.add(hemi);

    const dir = new THREE.DirectionalLight(0xffffff, 0.7);
    dir.position.set(4, 5, 6);
    scene.add(dir);

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    const hubMeshes = new Map();
    const slotLayouts = new Map();
    const hubPulseTargets = new Map();

    const hubGeometry = new THREE.CylinderGeometry(0.22, 0.22, 0.32, 14, 1, true);
    HUB_DEFS.forEach((hub) => {
      const material = new THREE.MeshStandardMaterial({
        color: hub.color,
        transparent: true,
        opacity: 0.85,
        roughness: 0.4,
        metalness: 0.15,
        emissive: hub.color.clone().multiplyScalar(0.3),
        emissiveIntensity: 0.35,
      });
      const mesh = new THREE.Mesh(hubGeometry.clone(), material);
      mesh.position.fromArray(hub.pos);
      mesh.rotation.x = Math.PI / 2;
      rootGroup.add(mesh);
      hubMeshes.set(hub.id, mesh);
      hubPulseTargets.set(hub.id, 1);
      if (!['userIn'].includes(hub.id)) {
        const positions = generateSlots(hub.pos, 27);
        slotLayouts.set(hub.id, {
          positions,
          occupied: new Array(positions.length).fill(false),
        });
      }
    });

    const edgesById = new Map();
    const lines = [];

    EDGE_DEFS.forEach((edge) => {
      const fromHub = HUB_DEFS.find((hub) => hub.id === edge.from);
      const toHub = HUB_DEFS.find((hub) => hub.id === edge.to);
      if (!fromHub || !toHub) return;

      const curve = buildEdgeCurve(fromHub.pos, toHub.pos, edge.kind);
      const points = curve.getPoints(120);
      const positions = [];
      points.forEach((point) => {
        positions.push(point.x, point.y, point.z);
      });

      const geometry = new LineGeometry();
      geometry.setPositions(positions);

      const material = new LineMaterial({
        color: edge.color,
        linewidth: 0.0025,
        transparent: true,
        opacity: 0.2,
        dashed: true,
        dashSize: 0.25,
        gapSize: 0.45,
      });
      material.resolution.set(window.innerWidth, window.innerHeight);

      const line = new Line2(geometry, material);
      line.computeLineDistances();
      rootGroup.add(line);

      const edgeEntry = {
        ...edge,
        curve,
        line,
        material,
        strength: 0,
        targetStrength: 0,
        dashSpeed: edge.kind === 'main' ? 0.5 : 0.35,
      };

      edgesById.set(edge.id, edgeEntry);
      lines.push(edgeEntry);
    });

    const cubeGeometry = new THREE.BoxGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE);
    const instancedMeshes = {};

    const createMaterial = (color) =>
      new THREE.MeshStandardMaterial({
        color,
        roughness: 0.35,
        metalness: 0.15,
        emissive: color.clone().multiplyScalar(0.25),
        emissiveIntensity: 0.6,
        transparent: true,
        opacity: 0.92,
      });

    const flowParticles = {};

    Object.entries(FLOW_COUNTS).forEach(([key, count]) => {
      const material = createMaterial(palette[key] || palette.main);
      const instanced = new THREE.InstancedMesh(cubeGeometry.clone(), material, count);
      instanced.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      instanced.castShadow = false;
      instanced.receiveShadow = false;
      rootGroup.add(instanced);
      instancedMeshes[key] = instanced;
      flowParticles[key] = [];
    });

    const selectRoute = (flowKey, index) => {
      if (flowKey !== 'main') {
        return ROUTE_VARIANTS[flowKey][0];
      }
      return MAIN_ROUTE_SEQUENCE[index % MAIN_ROUTE_SEQUENCE.length];
    };

    Object.entries(FLOW_COUNTS).forEach(([flowKey, count]) => {
      for (let i = 0; i < count; i += 1) {
        const route = selectRoute(flowKey, i);
        flowParticles[flowKey].push({
          key: flowKey,
          index: i,
          route,
          edgeIndex: 0,
          progress: Math.random() * 0.25,
          speed: FLOW_SPEED[flowKey] * (0.9 + Math.random() * 0.25),
          active: false,
          state: 'inactive',
          slotHub: null,
          slotIndex: -1,
          slotElapsed: 0,
          slotDuration: SLOT_TRANSITION + Math.random() * 0.2,
          dwell: 0,
          nextProgress: 0,
          lastEdgeEvent: '',
          lastSlotEvent: '',
        });
      }
    });

    const flowState = {
      main: { target: 0, current: 0 },
      safety: { target: 0, current: 0 },
      farming: { target: 0, current: 0 },
      token: { target: 0, current: 0 },
    };

    const findAvailableSlot = (hubId) => {
      const layout = slotLayouts.get(hubId);
      if (!layout) {
        return { index: -1, position: hubMeshes.get(hubId)?.position.clone() ?? new THREE.Vector3() };
      }
      for (let i = 0; i < layout.positions.length; i += 1) {
        if (!layout.occupied[i]) {
          layout.occupied[i] = true;
          return { index: i, position: layout.positions[i].clone() };
        }
      }
      return { index: -1, position: layout.positions[layout.positions.length - 1].clone() };
    };

    const releaseSlot = (hubId, index) => {
      const layout = slotLayouts.get(hubId);
      if (!layout || index < 0 || index >= layout.occupied.length) return;
      layout.occupied[index] = false;
    };

    const tmpObject = new THREE.Object3D();
    const tmpVector = new THREE.Vector3();
    const tmpProjected = new THREE.Vector3();

    const labelElements = [];

    const createLabel = (
      id,
      hubId,
      title,
      description,
      interactive = false,
      anchorOverride = null
    ) => {
      const element = document.createElement('div');
      element.className = `howitworks-label${interactive ? ' howitworks-label--interactive' : ''}`;
      element.dataset.labelId = id;
      element.dataset.hubId = hubId;
      element.setAttribute('aria-label', t('howItWorks.aria.label', { label: title, detail: description || '' }));

      const titleEl = document.createElement('span');
      titleEl.className = 'howitworks-label__title';
      titleEl.textContent = title;
      element.appendChild(titleEl);

      if (description) {
        const descriptionEl = document.createElement('span');
        descriptionEl.className = 'howitworks-label__desc';
        descriptionEl.textContent = description;
        element.appendChild(descriptionEl);
      }

      overlay.appendChild(element);

      if (interactive) {
        element.addEventListener('mouseenter', () => {
          emitTelemetry(`label_hover:${hubId}`, { hubId });
        });
      }

      const anchor = anchorOverride || hubMeshes.get(hubId);
      labelElements.push({ id, hubId, element, anchor, visible: true });
    };

    createLabel('userIn', 'userIn', labelCopy.userIn.title, labelCopy.userIn.description);
    createLabel('deposit', 'deposit', labelCopy.deposit.title, labelCopy.deposit.description);
    createLabel('strategies', 'strategies', labelCopy.strategies.title, labelCopy.strategies.description, true);
    createLabel('core', 'core', labelCopy.core.title, labelCopy.core.description, true);
    createLabel('high', 'high', labelCopy.high.title, labelCopy.high.description, true);
    createLabel('safety', 'safety', labelCopy.safety.title, labelCopy.safety.description);
    createLabel('farming', 'farming', labelCopy.farming.title, labelCopy.farming.description);
    createLabel('token', 'token', labelCopy.token.title, labelCopy.token.description);
    createLabel('buyback', 'buyback', labelCopy.buyback.title, labelCopy.buyback.description, true);
    createLabel('rewards', 'rewards', labelCopy.rewards.title, labelCopy.rewards.description, true);
    createLabel('userOut', 'userOut', labelCopy.userOut.title, labelCopy.userOut.description);

    const percentLabelConfigs = [
      {
        id: 'edge-deposit_strategies',
        edgeId: 'deposit_strategies',
        title: t('howItWorks.labels.strategiesHub'),
        value: formatPercent(flows.main * 100),
      },
      {
        id: 'edge-deposit_safety',
        edgeId: 'deposit_safety',
        title: t('howItWorks.labels.safetyFund'),
        value: formatPercent(flows.safety * 100),
      },
      {
        id: 'edge-deposit_farming',
        edgeId: 'deposit_farming',
        title: t('howItWorks.labels.farming'),
        value: formatPercent(flows.farming * 100),
      },
      {
        id: 'edge-deposit_token',
        edgeId: 'deposit_token',
        title: t('howItWorks.labels.tokenSeeding'),
        value: formatPercent(flows.token * 100),
      },
    ];

    percentLabelConfigs.forEach(({ id, edgeId, title, value }) => {
      const edge = edgesById.get(edgeId);
      if (!edge) return;
      const anchor = new THREE.Object3D();
      const point = edge.curve.getPoint(0.45);
      anchor.position.copy(point);
      rootGroup.add(anchor);
      createLabel(id, edgeId, title, value, false, anchor);
      const last = labelElements[labelElements.length - 1];
      if (last) {
        last.anchor = anchor;
      }
    });

    const innerLoopGroup = new THREE.Group();
    innerLoopGroup.position.set(0.95, 0.12, 0.08);
    rootGroup.add(innerLoopGroup);

    const loopRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.55, 0.06, 18, 64),
      new THREE.MeshStandardMaterial({ color: palette.main, transparent: true, opacity: 0.12, emissive: palette.main, emissiveIntensity: 0.45 })
    );
    innerLoopGroup.add(loopRing);

    const loopMarkers = (copy.innerLoop || []).map((name, index) => {
      const theta = (index / (copy.innerLoop.length || 1)) * Math.PI * 2;
      const marker = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.12, 0.12),
        new THREE.MeshStandardMaterial({ color: palette.main.clone().offsetHSL(0, 0, 0.1), transparent: true, opacity: 0.4 })
      );
      marker.position.set(Math.cos(theta) * 0.55, Math.sin(theta) * 0.55, 0.02);
      innerLoopGroup.add(marker);
      return marker;
    });

    createLabel('innerLoop', 'innerLoop', labelCopy.innerLoop.title, labelCopy.innerLoop.description);
    labelElements[labelElements.length - 1].anchor = innerLoopGroup;

    const flowVisible = {
      overview: ['userIn', 'deposit'],
      moneyFlow: [
        'userIn',
        'deposit',
        'strategies',
        'safety',
        'farming',
        'token',
        'edge-deposit_strategies',
        'edge-deposit_safety',
        'edge-deposit_farming',
        'edge-deposit_token',
      ],
      strategyHub: ['strategies', 'core', 'high', 'buyback', 'rewards'],
      innerLoop: ['userOut', 'core', 'high', 'innerLoop'],
      security: [
        'strategies',
        'safety',
        'farming',
        'token',
        'buyback',
        'edge-deposit_safety',
        'edge-deposit_farming',
        'edge-deposit_token',
      ],
      fees: ['deposit', 'core', 'high', 'buyback', 'userOut'],
      rewards: ['strategies', 'rewards', 'userOut', 'edge-deposit_strategies'],
      reporting: ['userOut', 'rewards', 'buyback'],
    };

    let currentEvent = '';

    const setLabelVisibility = (event) => {
      const visibleSet = new Set(flowVisible[event] || []);
      labelElements.forEach((item) => {
        item.visible = visibleSet.size === 0 || visibleSet.has(item.id);
      });
    };

    const updateFlowTargets = (mix) => {
      if (!mix) return;
      if (typeof mix.main === 'number') {
        flowState.main.target = clamp01(
          mix.main / Math.max(flows.main || 1, 0.0001)
        );
      }
      if (typeof mix.safety === 'number') {
        flowState.safety.target = clamp01(mix.safety / Math.max(flows.safety || 1, 0.0001));
      }
      if (typeof mix.farming === 'number') {
        flowState.farming.target = clamp01(mix.farming / Math.max(flows.farming || 1, 0.0001));
      }
      if (typeof mix.token === 'number') {
        flowState.token.target = clamp01(mix.token / Math.max(flows.token || 1, 0.0001));
      }
    };

    const setGroupOpacity = (opacity) => {
      rootGroup.traverse((child) => {
        if (child.material) {
          child.material.opacity = opacity;
          child.material.transparent = opacity < 1;
        }
      });
      lines.forEach((edge) => {
        edge.material.opacity = opacity * 0.8;
      });
    };

    const triggerEvent = (event) => {
      if (currentEvent === event) return;
      currentEvent = event;
      emitTelemetry(`scene_view:${event}`, { id: event });
      setLabelVisibility(event);

      switch (event) {
        case 'overview':
          updateFlowTargets({ main: 0, safety: 0, farming: 0, token: 0 });
          hubPulseTargets.set('deposit', 1.08);
          hubPulseTargets.set('strategies', 1);
          break;
        case 'moneyFlow':
          updateFlowTargets({
            main: flows.main,
            safety: flows.safety,
            farming: flows.farming,
            token: flows.token,
          });
          hubPulseTargets.set('deposit', 1);
          hubPulseTargets.set('strategies', 1.1);
          break;
        case 'strategyHub':
          hubPulseTargets.set('strategies', 1.18);
          break;
        case 'innerLoop':
          hubPulseTargets.set('core', 1.12);
          hubPulseTargets.set('high', 1.06);
          break;
        case 'security':
          updateFlowTargets({
            main: flows.main * 0.6,
            safety: flows.safety,
            farming: flows.farming,
            token: flows.token,
          });
          hubPulseTargets.set('safety', 1.2);
          hubPulseTargets.set('farming', 1.18);
          hubPulseTargets.set('token', 1.16);
          break;
        case 'fees':
          updateFlowTargets({
            main: flows.main * 0.5,
            safety: flows.safety * 0.4,
            farming: flows.farming * 0.4,
            token: flows.token * 0.4,
          });
          hubPulseTargets.set('buyback', 1.22);
          hubPulseTargets.set('core', 1.08);
          hubPulseTargets.set('high', 1.05);
          break;
        case 'rewards':
          updateFlowTargets({
            main: flows.main * 0.55,
            safety: flows.safety * 0.35,
            farming: flows.farming * 0.35,
            token: flows.token * 0.35,
          });
          hubPulseTargets.set('rewards', 1.24);
          break;
        case 'reporting':
          updateFlowTargets({
            main: flows.main * 0.45,
            safety: flows.safety * 0.3,
            farming: flows.farming * 0.3,
            token: flows.token * 0.3,
          });
          hubPulseTargets.set('userOut', 1.2);
          hubPulseTargets.set('buyback', 1.1);
          hubPulseTargets.set('rewards', 1.08);
          break;
        default:
          break;
      }
    };

    triggerEvent('overview');

    const clock = new THREE.Clock();

    const lerp = (from, to, alpha) => from + (to - from) * alpha;

    const activateParticle = (particle) => {
      if (particle.active) return;
      particle.active = true;
      particle.edgeIndex = 0;
      particle.progress = Math.random() * 0.15;
      particle.state = 'moving';
      particle.slotHub = null;
      particle.slotIndex = -1;
      particle.slotElapsed = 0;
      particle.nextProgress = 0;
      particle.lastSlotEvent = '';
      const firstEdge = particle.route[0];
      particle.lastEdgeEvent = firstEdge;
      emitTelemetry(`edge_flow:${firstEdge}`, { edgeId: firstEdge });
    };

    const deactivateParticle = (particle) => {
      if (!particle.active) return;
      if (particle.slotHub) {
        releaseSlot(particle.slotHub, particle.slotIndex);
      }
      particle.active = false;
      particle.state = 'inactive';
      particle.slotHub = null;
      particle.slotIndex = -1;
      particle.lastEdgeEvent = '';
    };

    const updateParticle = (particle, mesh, flowIntensity, delta) => {
      if (!particle.active) {
        tmpObject.position.set(999, 999, 999);
        tmpObject.scale.setScalar(0.0001);
        tmpObject.updateMatrix();
        mesh.setMatrixAt(particle.index, tmpObject.matrix);
        return;
      }

      const edgeId = particle.route[particle.edgeIndex];
      const edge = edgesById.get(edgeId);
      if (!edge) {
        deactivateParticle(particle);
        return;
      }

      switch (particle.state) {
        case 'moving': {
          const speedMultiplier = 0.65 + flowIntensity * 0.9;
          particle.progress += delta * particle.speed * speedMultiplier;
          if (particle.progress >= 1) {
            const leftover = particle.progress - 1;
            const { index, position } = findAvailableSlot(edge.to);
            particle.slotHub = edge.to;
            particle.slotIndex = index;
            particle.slotFrom = edge.curve.getPoint(1).clone();
            particle.slotTo = position.clone();
            particle.dwell = HUB_DWELL[edge.to] ?? 0.6;
            particle.slotElapsed = 0;
            particle.state = 'slotting';
            particle.nextProgress = leftover;
            particle.lastSlotEvent = '';
          }

          const point = edge.curve.getPoint(Math.min(particle.progress, 0.999));
          tmpObject.position.copy(point);
          const scale = 0.92 + Math.sin((particle.progress + performance.now() * 0.0005) * Math.PI) * 0.08;
          tmpObject.scale.setScalar(scale);
          tmpObject.rotation.set(0, 0, 0);
          tmpObject.updateMatrix();
          mesh.setMatrixAt(particle.index, tmpObject.matrix);
          break;
        }
        case 'slotting': {
          particle.slotElapsed += delta;
          const phase = Math.min(1, particle.slotElapsed / SLOT_TRANSITION);
          const eased = phase * phase * (3 - 2 * phase);
          tmpVector.copy(particle.slotFrom).lerp(particle.slotTo, eased);
          tmpObject.position.copy(tmpVector);
          const pulse = 0.92 + Math.sin(Math.min(1, particle.slotElapsed / (SLOT_TRANSITION + particle.dwell)) * Math.PI) * 0.1;
          tmpObject.scale.setScalar(pulse);
          tmpObject.rotation.set(0, 0, 0);
          tmpObject.updateMatrix();
          mesh.setMatrixAt(particle.index, tmpObject.matrix);

          if (!particle.lastSlotEvent && phase >= 1) {
            particle.lastSlotEvent = `${particle.slotHub}-${particle.index}`;
            emitTelemetry(`cube_slot:${particle.slotHub}`, { hubId: particle.slotHub });
          }

          if (particle.slotElapsed >= SLOT_TRANSITION + particle.dwell) {
            const nextIndex = particle.edgeIndex + 1;
            if (nextIndex < particle.route.length) {
              releaseSlot(particle.slotHub, particle.slotIndex);
              particle.slotHub = null;
              particle.slotIndex = -1;
              particle.edgeIndex = nextIndex;
              particle.progress = particle.nextProgress;
              particle.state = 'moving';
              const nextEdge = particle.route[nextIndex];
              if (nextEdge !== particle.lastEdgeEvent) {
                particle.lastEdgeEvent = nextEdge;
                emitTelemetry(`edge_flow:${nextEdge}`, { edgeId: nextEdge });
              }
            } else {
              releaseSlot(particle.slotHub, particle.slotIndex);
              particle.slotHub = null;
              particle.slotIndex = -1;
              particle.edgeIndex = 0;
              particle.progress = Math.random() * 0.15;
              particle.state = 'moving';
              const firstEdge = particle.route[0];
              if (firstEdge !== particle.lastEdgeEvent) {
                particle.lastEdgeEvent = firstEdge;
                emitTelemetry(`edge_flow:${firstEdge}`, { edgeId: firstEdge });
              }
            }
          }
          break;
        }
        default:
          break;
      }
    };

    const labelUpdate = () => {
      const { clientWidth, clientHeight } = canvas;
      labelElements.forEach((item) => {
        if (!item.anchor) return;
        item.anchor.getWorldPosition(tmpVector);
        tmpProjected.copy(tmpVector);
        tmpProjected.project(camera);
        const x = (tmpProjected.x * 0.5 + 0.5) * clientWidth;
        const y = (-tmpProjected.y * 0.5 + 0.5) * clientHeight;
        const visible = tmpProjected.z > -1 && tmpProjected.z < 1 && item.visible;
        item.element.style.opacity = visible ? '1' : '0';
        item.element.classList.toggle('is-visible', visible);
        const scale = visible ? 1 : 0.9;
        item.element.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
      });
    };

    const updateLines = (delta) => {
      lines.forEach((edge) => {
        let target = 0;
        switch (edge.id) {
          case 'userIn_deposit':
            target = clamp01(
              flowState.main.current + flowState.safety.current * 0.6 + flowState.farming.current * 0.6 + flowState.token.current * 0.6
            );
            break;
          case 'deposit_strategies':
          case 'strategies_core':
          case 'core_userOut':
            target = flowState.main.current;
            break;
          case 'strategies_high':
          case 'high_userOut':
            target = flowState.main.current * MAIN_SPLIT.high;
            break;
          case 'strategies_rewards':
          case 'rewards_userOut':
            target = flowState.main.current * 0.4;
            break;
          case 'core_buyback':
          case 'high_buyback':
            target = flowState.main.current * 0.25;
            break;
          case 'deposit_safety':
          case 'safety_userOut':
            target = flowState.safety.current;
            break;
          case 'deposit_farming':
          case 'farming_userOut':
            target = flowState.farming.current;
            break;
          case 'deposit_token':
          case 'token_userOut':
            target = flowState.token.current;
            break;
          default:
            target = 0;
        }
        edge.targetStrength = clamp01(target);
        edge.strength = lerp(edge.strength, edge.targetStrength, 0.12);
        edge.material.linewidth = 0.0018 + edge.strength * 0.0035;
        edge.material.opacity = 0.12 + edge.strength * 0.65;
        edge.material.dashOffset -= delta * edge.dashSpeed * (0.5 + edge.strength);
        edge.material.needsUpdate = true;
      });
    };

    const updateHubPulses = () => {
      hubPulseTargets.forEach((target, id) => {
        const mesh = hubMeshes.get(id);
        if (!mesh) return;
        const nextScale = lerp(mesh.scale.x, target, 0.1);
        mesh.scale.set(nextScale, nextScale, nextScale);
        hubPulseTargets.set(id, lerp(target, 1, 0.04));
      });
    };

    const animateLoop = () => {
      const delta = clock.getDelta();

      Object.values(flowState).forEach((state) => {
        state.current = lerp(state.current, state.target, 0.08);
      });

      Object.entries(flowParticles).forEach(([flowKey, particles]) => {
        const intensity = flowState[flowKey].current;
        const activeCount = Math.round(intensity * particles.length);
        particles.forEach((particle, index) => {
          const mesh = instancedMeshes[flowKey];
          if (index < activeCount) {
            activateParticle(particle);
          } else {
            deactivateParticle(particle);
          }
          updateParticle(particle, mesh, intensity, delta);
          mesh.instanceMatrix.needsUpdate = true;
        });
      });

      updateLines(delta);
      updateHubPulses();

      if (currentEvent === 'innerLoop') {
        innerLoopGroup.rotation.z += delta * 0.65;
        loopRing.material.opacity = lerp(loopRing.material.opacity, 0.65, 0.1);
        loopMarkers.forEach((marker) => {
          marker.material.opacity = lerp(marker.material.opacity, 0.8, 0.12);
        });
      } else {
        loopRing.material.opacity = lerp(loopRing.material.opacity, 0.2, 0.08);
        loopMarkers.forEach((marker) => {
          marker.material.opacity = lerp(marker.material.opacity, 0.3, 0.08);
        });
      }

      renderer.render(scene, camera);
      labelUpdate();

      animationState.current.frame = requestAnimationFrame(animateLoop);
    };

    animationState.current.frame = requestAnimationFrame(animateLoop);

    const handleResize = () => {
      const { innerWidth, innerHeight } = window;
      renderer.setSize(innerWidth, innerHeight);
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
      lines.forEach((edge) => {
        edge.material.resolution.set(innerWidth, innerHeight);
      });
      labelUpdate();
    };

    window.addEventListener('resize', handleResize);

    const api = {
      camera,
      flowDistribution: flows,
      setFlowMix: updateFlowTargets,
      setGroupOpacity,
      triggerEvent,
      dispose: () => {
        cancelAnimationFrame(animationState.current.frame);
        window.removeEventListener('resize', handleResize);
        renderer.dispose();
        cubeGeometry.dispose();
        Object.values(instancedMeshes).forEach((mesh) => {
          mesh.geometry.dispose();
          mesh.material.dispose();
        });
        lines.forEach((edge) => {
          edge.line.geometry.dispose();
          edge.material.dispose();
        });
        hubMeshes.forEach((mesh) => {
          mesh.geometry.dispose();
          mesh.material.dispose();
        });
        loopRing.geometry.dispose();
        loopRing.material.dispose();
        loopMarkers.forEach((marker) => {
          marker.geometry.dispose();
          marker.material.dispose();
        });
        labelElements.forEach(({ element }) => element.remove());
      },
    };

    onReady?.(api);

    return () => {
      api.dispose();
      onReady?.(null);
    };
  }, [canvasRef, overlayRef, onReady, labelCopy, flows, formatPercent, t]);

  return null;
}

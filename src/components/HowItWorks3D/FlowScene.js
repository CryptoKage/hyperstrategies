import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import copy from '../../data/site_copy.json';

const FLOW_COUNTS = {
  main: 176,
  safety: 22,
  farming: 11,
  token: 11,
};

const FLOW_KEYS = ['main', 'safety', 'farming', 'token'];

export default function FlowScene({ canvasRef, overlayRef, onReady }) {
  const animationState = useRef({ t: 0, frame: null });

  useEffect(() => {
    const canvas = canvasRef.current;
    const overlay = overlayRef?.current;

    if (!canvas || !overlay) {
      return undefined;
    }

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x06101a, 0.08);

    const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 120);
    camera.position.set(0, 2.2, 6.5);

    const hemi = new THREE.HemisphereLight(0x66d8ff, 0x0b1220, 0.75);
    scene.add(hemi);
    const dir = new THREE.DirectionalLight(0xffffff, 0.9);
    dir.position.set(3, 5, 4);
    scene.add(dir);

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    const tubeMaterialMain = new THREE.MeshStandardMaterial({
      color: 0x00e0c7,
      emissive: 0x001921,
      emissiveIntensity: 0.1,
      transparent: true,
      opacity: 0.85,
    });
    const sideMaterials = [
      new THREE.MeshStandardMaterial({ color: 0x00f5a0, emissive: 0x00170d, transparent: true, opacity: 0.8 }),
      new THREE.MeshStandardMaterial({ color: 0x0099ff, emissive: 0x001021, transparent: true, opacity: 0.8 }),
      new THREE.MeshStandardMaterial({ color: 0x9b5cf6, emissive: 0x170028, transparent: true, opacity: 0.8 }),
    ];

    const tubeCurve = (points) => new THREE.CatmullRomCurve3(points);
    const createTube = (curve, radius, material) => {
      const geometry = new THREE.TubeGeometry(curve, 120, radius, 32, false);
      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = false;
      mesh.receiveShadow = false;
      return { mesh, curve };
    };

    const mainCurve = tubeCurve([
      new THREE.Vector3(-2.1, 0, 0.2),
      new THREE.Vector3(-1.2, 0.1, 0.1),
      new THREE.Vector3(-0.4, 0.2, 0),
      new THREE.Vector3(0.3, 0.25, 0),
      new THREE.Vector3(0.9, 0.15, 0),
      new THREE.Vector3(1.6, 0, 0),
    ]);
    const mainTube = createTube(mainCurve, 0.07, tubeMaterialMain);
    rootGroup.add(mainTube.mesh);

    const sideCurves = [
      tubeCurve([
        new THREE.Vector3(0.3, 0.25, 0),
        new THREE.Vector3(0.8, 0.5, 0.4),
        new THREE.Vector3(1.5, 0.8, 0.9),
      ]),
      tubeCurve([
        new THREE.Vector3(0.3, 0.25, 0),
        new THREE.Vector3(0.9, -0.15, -0.3),
        new THREE.Vector3(1.55, -0.35, -0.8),
      ]),
      tubeCurve([
        new THREE.Vector3(0.32, 0.22, 0),
        new THREE.Vector3(0.7, 0.05, 0.35),
        new THREE.Vector3(1.22, 0.18, 0.7),
      ]),
    ];

    const branchTubes = sideCurves.map((curve, i) => {
      const branch = createTube(curve, 0.05, sideMaterials[i]);
      rootGroup.add(branch.mesh);
      return branch;
    });

    const depositNode = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 48, 48),
      new THREE.MeshStandardMaterial({
        color: 0x4be6ff,
        emissive: 0x032c3a,
        emissiveIntensity: 0.35,
        transparent: true,
        opacity: 0.0,
      })
    );
    depositNode.position.set(-2.2, 0.05, 0);
    rootGroup.add(depositNode);

    const safetyNode = new THREE.Mesh(
      new THREE.SphereGeometry(0.24, 32, 32),
      new THREE.MeshStandardMaterial({ color: 0x00f5a0, emissive: 0x042a16, transparent: true, opacity: 0.0 })
    );
    safetyNode.position.copy(sideCurves[0].getPoint(0.9));
    rootGroup.add(safetyNode);

    const farmingNode = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 32, 32),
      new THREE.MeshStandardMaterial({ color: 0x0099ff, emissive: 0x041a33, transparent: true, opacity: 0.0 })
    );
    farmingNode.position.copy(sideCurves[1].getPoint(0.9));
    rootGroup.add(farmingNode);

    const tokenNode = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 32, 32),
      new THREE.MeshStandardMaterial({ color: 0x9b5cf6, emissive: 0x220c46, transparent: true, opacity: 0.0 })
    );
    tokenNode.position.copy(sideCurves[2].getPoint(0.9));
    rootGroup.add(tokenNode);

    const strategiesHub = new THREE.Mesh(
      new THREE.TorusGeometry(0.45, 0.16, 24, 64),
      new THREE.MeshStandardMaterial({
        color: 0x00c6e6,
        emissive: 0x002841,
        emissiveIntensity: 0.35,
        transparent: true,
        opacity: 0.0,
      })
    );
    strategiesHub.position.set(0.25, 0.25, 0);
    strategiesHub.rotation.set(Math.PI / 2.6, Math.PI / 7, Math.PI / 12);
    rootGroup.add(strategiesHub);

    const capsuleMaterial = new THREE.MeshStandardMaterial({
      color: 0x102d42,
      emissive: 0x041422,
      metalness: 0.4,
      roughness: 0.35,
      transparent: true,
      opacity: 0.0,
    });

    const capsuleGeometry = new THREE.CapsuleGeometry(0.18, 0.8, 8, 16);
    const coreCapsule = new THREE.Mesh(capsuleGeometry, capsuleMaterial.clone());
    const coreCapsuleStart = new THREE.Vector3(-0.05, 0.02, 0.3);
    const coreCapsuleEnd = new THREE.Vector3(-0.35, 0.05, 0.42);
    coreCapsule.position.copy(coreCapsuleStart);
    rootGroup.add(coreCapsule);

    const highRiskCapsule = new THREE.Mesh(capsuleGeometry, capsuleMaterial.clone());
    const highRiskStart = new THREE.Vector3(0.2, -0.02, 0.28);
    const highRiskEnd = new THREE.Vector3(0.65, -0.05, 0.35);
    highRiskCapsule.position.copy(highRiskStart);
    rootGroup.add(highRiskCapsule);

    const capsuleTargets = {
      core: {
        position: coreCapsuleStart.clone(),
        rotation: new THREE.Euler(0, 0, 0),
        scale: 1,
      },
      high: {
        position: highRiskStart.clone(),
        rotation: new THREE.Euler(0, 0, 0),
        scale: 1,
      },
    };

    const innerLoopGroup = new THREE.Group();
    innerLoopGroup.position.set(0.1, -0.05, -0.35);
    rootGroup.add(innerLoopGroup);

    const innerLoopRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.75, 0.03, 32, 100),
      new THREE.MeshStandardMaterial({ color: 0x00c6e6, emissive: 0x002a3b, opacity: 0.0, transparent: true })
    );
    innerLoopGroup.add(innerLoopRing);

    const innerLoopMarkers = copy.innerLoop.map((label, index) => {
      const theta = (index / copy.innerLoop.length) * Math.PI * 2;
      const marker = new THREE.Mesh(
        new THREE.SphereGeometry(0.06, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x0b1f2c, opacity: 0.0, transparent: true })
      );
      marker.position.set(Math.cos(theta) * 0.75, Math.sin(theta) * 0.75, 0);
      innerLoopGroup.add(marker);
      return marker;
    });

    const particlesGeometry = new THREE.SphereGeometry(0.025, 10, 10);
    const particlesMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.92 });
    const totalParticles = FLOW_KEYS.reduce((acc, key) => acc + FLOW_COUNTS[key], 0);
    const particles = new THREE.InstancedMesh(particlesGeometry, particlesMaterial, totalParticles);
    rootGroup.add(particles);

    const flows = [
      { key: 'main', tube: mainTube, speed: 0.45 },
      { key: 'safety', tube: branchTubes[0], speed: 0.35 },
      { key: 'farming', tube: branchTubes[1], speed: 0.32 },
      { key: 'token', tube: branchTubes[2], speed: 0.3 },
    ];

    const labelElements = [];
    const formatPct = (value) => `${Math.round(value * 100)}%`;

    const fadeTargets = new Map();

    const setTargetOpacity = (materials, value) => {
      const mats = Array.isArray(materials) ? materials : [materials];
      mats.forEach((mat) => fadeTargets.set(mat, value));
    };

    [
      depositNode,
      strategiesHub,
      safetyNode,
      farmingNode,
      tokenNode,
      coreCapsule,
      highRiskCapsule,
    ].forEach((mesh) => {
      fadeTargets.set(mesh.material, mesh.material.opacity);
    });

    const labelData = [
      {
        id: 'deposit',
        title: 'Deposits',
        description: 'Capital enters the system',
        target: depositNode,
      },
      {
        id: 'hub',
        title: 'Strategies Hub',
        description: 'Dynamic routing + automation',
        target: strategiesHub,
      },
      {
        id: 'safety',
        title: copy.flow.labels.safety,
        description: formatPct(copy.flow.distribution.safety),
        target: safetyNode,
      },
      {
        id: 'farming',
        title: copy.flow.labels.farming,
        description: formatPct(copy.flow.distribution.farming),
        target: farmingNode,
      },
      {
        id: 'token',
        title: copy.flow.labels.token,
        description: formatPct(copy.flow.distribution.token),
        target: tokenNode,
      },
      {
        id: 'coreStrategy',
        title: copy.strategies[0].name,
        description: copy.strategies[0].tagline,
        target: coreCapsule,
        interactive: true,
      },
      {
        id: 'highRiskStrategy',
        title: copy.strategies[1].name,
        description: copy.strategies[1].tagline,
        target: highRiskCapsule,
        interactive: true,
      },
      ...innerLoopMarkers.map((marker, index) => ({
        id: `loop-${index}`,
        title: copy.innerLoop[index],
        description: index === copy.innerLoop.length - 1 ? 'Loops back' : '→',
        target: marker,
        className: 'howitworks-label--loop',
      })),
    ];

    labelData.forEach((item) => {
      const element = document.createElement('div');
      element.className = `howitworks-label${item.interactive ? ' howitworks-label--interactive' : ''}${item.className ? ` ${item.className}` : ''}`;
      element.dataset.labelId = item.id;

      const title = document.createElement('span');
      title.className = 'howitworks-label__title';
      title.textContent = item.title;
      element.appendChild(title);

      if (item.description) {
        const desc = document.createElement('span');
        desc.className = 'howitworks-label__desc';
        desc.textContent = item.description;
        element.appendChild(desc);
      }

      overlay.appendChild(element);
      labelElements.push({ ...item, element });

      if (item.interactive && item.target) {
        element.addEventListener('mouseenter', () => {
          capsuleTargets[item.target === coreCapsule ? 'core' : 'high'].scale = 1.12;
          element.classList.add('is-hovered');
        });

        element.addEventListener('mouseleave', () => {
          capsuleTargets[item.target === coreCapsule ? 'core' : 'high'].scale = 1;
          element.classList.remove('is-hovered');
        });
      }
    });

    const tubeTargets = {
      main: 0,
      safety: 0,
      farming: 0,
      token: 0,
    };
    const tubeScale = {
      main: 0,
      safety: 0,
      farming: 0,
      token: 0,
    };

    let particlesEnabled = 0;
    const clock = new THREE.Clock();

    const tmpMatrix = new THREE.Matrix4();
    const tmpVec = new THREE.Vector3();
    const tmpProj = new THREE.Vector3();

    let currentEvent = '';

    const updateLabels = () => {
      const { clientWidth, clientHeight } = canvas;
      labelElements.forEach((item) => {
        const target = item.target;
        target.getWorldPosition(tmpVec);
        tmpProj.copy(tmpVec);
        tmpProj.project(camera);
        const x = (tmpProj.x * 0.5 + 0.5) * clientWidth;
        const y = (-tmpProj.y * 0.5 + 0.5) * clientHeight;

        item.element.style.transform = `translate(${x}px, ${y}px)`;
        const visible = tmpProj.z > -1 && tmpProj.z < 1;
        item.element.style.opacity = visible ? '1' : '0';
      });
    };

    const lerp = (from, to, alpha) => from + (to - from) * alpha;

    const render = () => {
      const state = animationState.current;
      const elapsed = clock.getDelta();

      FLOW_KEYS.forEach((key, index) => {
        tubeScale[key] = lerp(tubeScale[key], tubeTargets[key], 0.1);
        const mesh = index === 0 ? mainTube.mesh : branchTubes[index - 1].mesh;
        mesh.scale.setScalar(0.6 + tubeScale[key] * 0.8);
      });

      fadeTargets.forEach((targetOpacity, material) => {
        const next = THREE.MathUtils.lerp(material.opacity, targetOpacity, 0.08);
        material.opacity = next;
        material.transparent = next < 1;
      });

      const capsuleEntries = [
        { mesh: coreCapsule, target: capsuleTargets.core },
        { mesh: highRiskCapsule, target: capsuleTargets.high },
      ];

      capsuleEntries.forEach(({ mesh, target }) => {
        mesh.position.lerp(target.position, 0.08);
        mesh.rotation.x = THREE.MathUtils.lerp(mesh.rotation.x, target.rotation.x, 0.08);
        mesh.rotation.y = THREE.MathUtils.lerp(mesh.rotation.y, target.rotation.y, 0.08);
        mesh.rotation.z = THREE.MathUtils.lerp(mesh.rotation.z, target.rotation.z, 0.08);
        const scaleTarget = target.scale;
        const nextScale = THREE.MathUtils.lerp(mesh.scale.x, scaleTarget, 0.12);
        mesh.scale.setScalar(nextScale);
      });

      const flowTotal = tubeTargets.main + tubeTargets.safety + tubeTargets.farming + tubeTargets.token;
      particlesEnabled = lerp(particlesEnabled, flowTotal > 0 ? 1 : 0, 0.08);
      const total = particles.count;
      let cursor = 0;
      flows.forEach((flow) => {
        const count = FLOW_COUNTS[flow.key];
        for (let i = 0; i < count; i += 1) {
          const idx = cursor + i;
          if (particlesEnabled < 0.01) {
            tmpMatrix.makeTranslation(999, 999, 999);
            particles.setMatrixAt(idx, tmpMatrix);
            continue;
          }
          const t = (i / count + state.t * flow.speed) % 1;
          const point = flow.tube.curve.getPointAt(t);
          tmpMatrix.makeTranslation(point.x, point.y, point.z);
          particles.setMatrixAt(idx, tmpMatrix);
        }
        cursor += count;
      });
      particles.instanceMatrix.needsUpdate = true;

      if (currentEvent === 'innerLoop') {
        innerLoopRing.material.opacity = THREE.MathUtils.lerp(innerLoopRing.material.opacity, 0.85, 0.08);
        innerLoopGroup.rotation.z += elapsed * 0.45;
        innerLoopMarkers.forEach((marker) => {
          marker.material.opacity = THREE.MathUtils.lerp(marker.material.opacity, 1, 0.1);
        });
      }

      state.t += elapsed * 0.08;
      renderer.render(scene, camera);
      updateLabels();
      state.t = Number.isFinite(state.t) ? state.t % 1 : 0;
      state.t = Math.max(0, Math.min(1, state.t));

      state.frame = requestAnimationFrame(render);
    };

    animationState.current.t = 0;
    animationState.current.frame = requestAnimationFrame(render);

    const clamp01 = (value) => Math.max(0, Math.min(1.2, value));

    const setFlowMix = ({ main, safety, farming, token }) => {
      tubeTargets.main = clamp01(main ?? tubeTargets.main);
      tubeTargets.safety = clamp01(safety ?? tubeTargets.safety);
      tubeTargets.farming = clamp01(farming ?? tubeTargets.farming);
      tubeTargets.token = clamp01(token ?? tubeTargets.token);
    };

    const setGroupOpacity = (opacity) => {
      [depositNode, strategiesHub, safetyNode, farmingNode, tokenNode, coreCapsule, highRiskCapsule].forEach((mesh) => {
        mesh.material.opacity = opacity;
      });
      [mainTube.mesh, ...branchTubes.map((b) => b.mesh)].forEach((mesh) => {
        mesh.material.opacity = opacity;
      });
    };

    const triggerEvent = (event) => {
      if (currentEvent === event) return;
      currentEvent = event;

      switch (event) {
        case 'overview':
          setTargetOpacity([depositNode.material, strategiesHub.material], 0.95);
          setTargetOpacity([
            safetyNode.material,
            farmingNode.material,
            tokenNode.material,
            coreCapsule.material,
            highRiskCapsule.material,
          ], 0);
          capsuleTargets.core.position.copy(coreCapsuleStart);
          capsuleTargets.high.position.copy(highRiskStart);
          capsuleTargets.core.rotation.set(0, 0, 0);
          capsuleTargets.high.rotation.set(0, 0, 0);
          capsuleTargets.core.scale = 1;
          capsuleTargets.high.scale = 1;
          innerLoopRing.material.opacity = 0;
          innerLoopMarkers.forEach((marker) => {
            marker.material.opacity = 0;
          });
          innerLoopGroup.rotation.z = 0;
          break;
        case 'moneyFlow':
          setTargetOpacity([safetyNode.material, farmingNode.material, tokenNode.material], 0.9);
          break;
        case 'strategyHub':
          setTargetOpacity([coreCapsule.material, highRiskCapsule.material], 0.95);
          capsuleTargets.core.position.copy(coreCapsuleEnd);
          capsuleTargets.high.position.copy(highRiskEnd);
          capsuleTargets.core.rotation.set(0.2, -0.4, 0.6);
          capsuleTargets.high.rotation.set(-0.15, 0.32, -0.45);
          break;
        case 'innerLoop':
          break;
        default:
          break;
      }
    };

    triggerEvent('overview');

    const handleResize = () => {
      const { innerWidth, innerHeight } = window;
      renderer.setSize(innerWidth, innerHeight);
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
    };

    window.addEventListener('resize', handleResize);

    const api = {
      camera,
      flowDistribution: copy.flow.distribution,
      setFlowMix,
      setGroupOpacity,
      triggerEvent,
      dispose: () => {
        cancelAnimationFrame(animationState.current.frame);
        window.removeEventListener('resize', handleResize);
        renderer.dispose();
        particlesGeometry.dispose();
        particlesMaterial.dispose();
        mainTube.mesh.geometry.dispose();
        tubeMaterialMain.dispose();
        branchTubes.forEach((branch, index) => {
          branch.mesh.geometry.dispose();
          sideMaterials[index].dispose();
        });
        [depositNode, safetyNode, farmingNode, tokenNode, strategiesHub, coreCapsule, highRiskCapsule, innerLoopRing, ...innerLoopMarkers].forEach((mesh) => {
          mesh.geometry.dispose();
          mesh.material.dispose();
        });
        labelElements.forEach(({ element }) => element.remove());
      },
    };

    onReady?.(api);

    return () => {
      api.dispose();
      onReady?.(null);
    };
  }, [canvasRef, overlayRef, onReady]);

  return null;
}

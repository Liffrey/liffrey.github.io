import * as THREE from 'three';
import { noRay } from './kit.js';

// Walls, floor, window and the world outside it, the light beam, string lights, floor lamp, plant.
export function buildRoom(kit, scene) {
  const { box, glowBox, flat, point, rnd } = kit;
  function sky(w, h, material, x, y, z) { // the outside: unlit, no shadows, not clickable
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), material);
    m.position.set(x, y, z);
    m.raycast = noRay;
    scene.add(m);
    return m;
  }

  // lights that follow the time of day
  const hemi = new THREE.HemisphereLight('#5a5a9a', '#2a1a22', 0.9);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight('#9ab8ff', 2.6); // sun by day, moon by night; always shines in through the window
  sun.target.position.set(1.2, 0, 1);
  scene.add(sun, sun.target);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10, near: 0.5, far: 45 });
  sun.shadow.camera.updateProjectionMatrix();
  sun.shadow.bias = -0.0005;
  sun.shadow.normalBias = 0.03;

  // shell
  box(8, 0.38, 8, '#3a2a20', 0, -0.21, 0);
  const planks = ['#8a6a4f', '#80624a', '#8f7054'];
  for (let i = 0; i < 8; i++) box(8, 0.4, 0.96, planks[i % 3], 0, -0.2, -3.5 + i);
  const WALL = '#323a5e', WALL2 = '#3a4370'; // night-city blue, so the red accents stand out
  box(0.3, 4.5, 8.3, WALL2, -4.15, 2.25, -0.15);
  box(4.7, 4.5, 0.3, WALL, -1.95, 2.25, -4.15);
  box(1.6, 4.5, 0.3, WALL, 3.2, 2.25, -4.15);
  box(2.0, 2.9, 0.3, WALL, 1.4, 1.45, -4.15);
  box(2.0, 0.4, 0.3, WALL, 1.4, 4.3, -4.15);
  box(0.04, 1.2, 8, '#2a3050', -3.98, 0.6, 0);
  box(8, 1.2, 0.04, '#272c4a', 0, 0.6, -3.98);
  box(0.08, 0.06, 8, '#b8323a', -3.96, 1.22, 0);
  box(8, 0.06, 0.08, '#b8323a', 0, 1.22, -3.96);
  box(0.06, 0.2, 8, '#1d2036', -3.97, 0.1, 0);
  box(8, 0.2, 0.06, '#1d2036', 0, 0.1, -3.97);

  // window
  const FR = '#d8cbb0';
  box(2.3, 0.08, 0.5, FR, 1.4, 2.88, -3.95);
  box(2.1, 0.08, 0.36, FR, 1.4, 4.12, -4.15);
  box(0.08, 1.28, 0.36, FR, 0.38, 3.5, -4.15);
  box(0.08, 1.28, 0.36, FR, 2.42, 3.5, -4.15);
  box(0.05, 1.2, 0.05, FR, 1.4, 3.5, -4.15);
  box(2.0, 0.05, 0.05, FR, 1.4, 3.5, -4.15);
  box(0.35, 1.7, 0.1, '#a02a2e', 0.12, 3.35, -3.88);
  box(0.35, 1.7, 0.1, '#a02a2e', 2.68, 3.35, -3.88);
  box(0.16, 0.12, 0.16, '#b5653a', 0.75, 2.98, -3.85);
  box(0.1, 0.22, 0.1, '#4f9a4f', 0.75, 3.15, -3.85);

  // outside: only the part seen through the window exists
  const skyMat = new THREE.MeshBasicMaterial({ color: '#16234a' });
  sky(3.6, 2.1, skyMat, -0.45, 1.85, -6.05);
  const sunMat = new THREE.MeshBasicMaterial({ color: '#fff0b0', transparent: true });
  const moonMat = new THREE.MeshBasicMaterial({ color: '#f4f1d0', transparent: true });
  const sunDisc = sky(0.36, 0.36, sunMat, 0, 2, -5.95); sunDisc.geometry = new THREE.CircleGeometry(0.2, 12);
  const moonDisc = sky(0.3, 0.3, moonMat, 0, 2, -5.94); moonDisc.geometry = new THREE.CircleGeometry(0.16, 12);
  const starMat = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true });
  for (let i = 0; i < 14; i++) sky(0.04, 0.04, starMat, -2 + rnd() * 3.2, 1.8 + rnd() * 1.0, -6.0);
  const cityMat = new THREE.MeshBasicMaterial({ color: '#0a1028' });
  const cityWinMat = new THREE.MeshBasicMaterial({ color: '#ffd27a' });
  const neonMat = new THREE.MeshBasicMaterial({ color: '#ff2a3a' }); // red signs on the towers, lit at night
  for (const [x, top] of [[-1.5, 1.45], [-1.1, 1.75], [-0.65, 1.5], [-0.2, 1.85], [0.25, 1.55], [0.7, 1.7]]) {
    sky(0.38, top - 0.8, cityMat, x, (top + 0.8) / 2, -5.98);
    for (let wy = 0.95; wy < top - 0.1; wy += 0.14) for (const wx of [-0.08, 0.08]) if (rnd() > 0.45) sky(0.05, 0.05, cityWinMat, x + wx, wy, -5.97);
  }
  for (const [x, y, w, h] of [[-1.27, 1.45, 0.04, 0.4], [-0.38, 1.55, 0.04, 0.45], [0.43, 1.3, 0.04, 0.35], [-0.2, 1.88, 0.3, 0.03], [0.7, 1.73, 0.26, 0.03]]) {
    sky(w, h, neonMat, x, y, -5.965);
  }

  // light beam from the window to the floor, rebuilt when the sun moves; dust floats inside it
  const win = [[0.4, 2.9], [2.4, 2.9], [2.4, 4.1], [0.4, 4.1]];
  const dir = new THREE.Vector3();
  const floorPt = (x, y) => { const t = y / -dir.y; return [x + dir.x * t, 0.02, -4.0 + dir.z * t]; };
  const beamGeo = new THREE.BufferGeometry();
  beamGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(24), 3));
  beamGeo.setIndex([0, 1, 5, 0, 5, 4, 1, 2, 6, 1, 6, 5, 2, 3, 7, 2, 7, 6, 3, 0, 4, 3, 4, 7]);
  const beamMat = new THREE.MeshBasicMaterial({ color: '#5070b0', transparent: true, opacity: 0.07, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
  const beam = new THREE.Mesh(beamGeo, beamMat);
  beam.raycast = noRay;
  beam.frustumCulled = false;
  scene.add(beam);
  function updateBeam() {
    dir.subVectors(sun.target.position, sun.position).normalize();
    const p = beamGeo.attributes.position;
    win.forEach(([x, y], i) => { p.setXYZ(i, x, y, -4.0); p.setXYZ(i + 4, ...floorPt(x, y)); });
    p.needsUpdate = true;
  }
  const DUST = 35, dustSeed = [], dustPos = new Float32Array(DUST * 3);
  for (let i = 0; i < DUST; i++) dustSeed.push([0.4 + rnd() * 2, 2.9 + rnd() * 1.2, rnd() * 0.9, rnd() * 6.28]);
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  const dustMat = new THREE.PointsMaterial({ color: '#8fa8e0', size: 1, sizeAttenuation: false, transparent: true, opacity: 0.35, depthWrite: false });
  const dust = new THREE.Points(dustGeo, dustMat);
  dust.raycast = noRay;
  dust.frustumCulled = false;
  scene.add(dust);

  // string lights
  const BULB = ['#ffcf6a', '#ff7a7a', '#7ad0ff', '#a0ff8a'], bulbs = [];
  for (let i = 0; i < 16; i++) {
    const s = -3.75 + i * 0.5, sag = 4.25 - Math.abs(Math.sin(i * 0.8)) * 0.12;
    bulbs.push(glowBox(0.09, 0.09, 0.09, BULB[i % 4], -3.92, sag, s));
    bulbs.push(glowBox(0.09, 0.09, 0.09, BULB[(i + 2) % 4], s, sag, -3.92));
  }
  bulbs.forEach((b, i) => { b.userData.phase = i * 1.7; b.material.color.set('#5a5560'); }); // unlit glass when the lamps are off
  const strings = [point('#ffc080', 1.5, 6, -3.5, 4.0, 0), point('#ffc080', 1.5, 6, 0, 4.0, -3.5)];

  // floor lamp
  box(0.4, 0.05, 0.4, '#222222', -0.6, 0.03, -3.5);
  box(0.06, 2.2, 0.06, '#222222', -0.6, 1.1, -3.5);
  const shade = flat(new THREE.CylinderGeometry(0.2, 0.34, 0.42, 8), '#f3d9a0', -0.6, 2.3, -3.5);
  shade.material.emissive.set('#c08840'); shade.castShadow = false;
  const lamp = point('#ffb866', 7, 8, -0.6, 2.05, -3.3);
  lamp.castShadow = true; lamp.shadow.mapSize.set(512, 512); lamp.shadow.bias = -0.004;

  // plant
  box(0.5, 0.5, 0.5, '#b5653a', 3.2, 0.25, 3.2);
  flat(new THREE.IcosahedronGeometry(0.5, 0), '#4f9a4f', 3.2, 0.95, 3.2);
  flat(new THREE.IcosahedronGeometry(0.35, 0), '#5fb05a', 3.0, 1.35, 3.3);
  flat(new THREE.IcosahedronGeometry(0.3, 0), '#448a48', 3.35, 1.3, 3.0);

  const refs = {
    hemi, sun, background: scene.background, skyMat, sunMat, moonMat, sunDisc, moonDisc, starMat, cityMat, cityWinMat, neonMat,
    beamMat, dust, dustMat, updateBeam, lamp, shade, strings, bulbs, lamps: 1,
    // per frame: bulbs twinkle with the lamps, dust drifts in the beam (both still under reduced motion)
    tick(s, motion) {
      bulbs.forEach(b => b.material.emissiveIntensity = (motion ? 0.6 + 0.4 * Math.sin(s * 2 + b.userData.phase) : 0.8) * refs.lamps);
      dust.visible = motion;
      if (!motion) return;
      for (let i = 0; i < DUST; i++) {
        const [x, y, k, p] = dustSeed[i], [fx, , fz] = floorPt(x, y);
        dustPos.set([x + (fx - x) * k + Math.sin(s * 0.3 + p) * 0.08, y * (1 - k) + Math.sin(s * 0.5 + p * 2) * 0.1, -4 + (fz + 4) * k + Math.cos(s * 0.3 + p) * 0.08], i * 3);
      }
      dustGeo.attributes.position.needsUpdate = true;
    },
  };
  return refs;
}

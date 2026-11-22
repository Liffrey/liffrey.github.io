import * as THREE from 'three';
import { sampleTime, routineAt, localHour } from '../lib/time.js';
import { makeKit } from './kit.js';
import { buildRoom } from './room.js';
import { build as buildGames } from './games.js';
import { build as buildTech } from './tech.js';
import { build as buildCinema } from './cinema.js';
import { build as buildExtras } from './extras.js';
import { applyTime } from './lighting.js';
import { makePost } from './post.js';
import { initPick } from './pick.js';

// Builds the room into `stage` and runs it. Throws if WebGL is unavailable; the caller keeps the still image then.
export async function start(stage, data, { hour = null, reducedMotion = false, onPick = () => {} } = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: false }); // throws without WebGL
  renderer.setPixelRatio(1);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap; // crisp, but not jagged at full resolution
  // Shadows only move with the hour, so they are redrawn when it changes, not every frame.
  // shortcut: the cat's breathing (4% scale) keeps a still shadow; redraw per frame if a big caster ever animates.
  renderer.shadowMap.autoUpdate = false;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#0f0d18');
  // 2:1 isometric: azimuth 45°, elevation 30°
  const HOME = new THREE.Vector3(0, 1.6, 0), OFFSET = new THREE.Vector3(12.25, 10, 12.25);
  const RIGHT = new THREE.Vector3(1, 0, -1).normalize(); // screen-right in this view
  const target = HOME.clone();
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 60);
  cam.position.copy(target).add(OFFSET);
  cam.lookAt(target);

  const root = new THREE.Group();
  scene.add(root);
  const kit = makeKit(root);
  const room = buildRoom(kit, scene);
  const corners = { games: buildGames(kit, data), tech: buildTech(kit, data), cinema: buildCinema(kit, data) };
  buildExtras(kit, data, corners.tech.zone);
  const small = stage.clientWidth < 700;
  room.sun.shadow.mapSize.set(small ? 1024 : 2048, small ? 1024 : 2048);
  const post = makePost(renderer);

  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight, dpr = Math.min(devicePixelRatio, w < 700 ? 1.5 : 2); // phones: fewer pixels to shade
    const bw = Math.max(1, Math.round(w * dpr)), bh = Math.max(1, Math.round(h * dpr));
    renderer.setSize(bw, bh, false);
    post.setSize(bw, bh, dpr);
    const aspect = w / h, view = Math.max(12, 12.5 / aspect); // narrow screens zoom out so the room fits
    Object.assign(cam, { left: -view * aspect / 2, right: view * aspect / 2, top: view / 2, bottom: -view / 2 });
    cam.updateProjectionMatrix();
  }

  const zones = Object.fromEntries(root.children.filter(g => g.userData.zone).map(g => [g.userData.zone, g]));
  let flight = null;
  function setView(to, zoom) {
    target.copy(to);
    cam.position.copy(target).add(OFFSET);
    cam.zoom = zoom;
    cam.updateProjectionMatrix();
  }
  function fly(to, zoom) {
    return new Promise(resolve => {
      flight?.resolve(); // a newer flight replaces the old one, starting from where the camera is now
      if (reducedMotion) { flight = null; setView(to, zoom); resolve(); return; }
      flight = { from: target.clone(), fromZoom: cam.zoom, to, zoom, t0: performance.now(), resolve };
    });
  }
  function flyStep() {
    if (!flight) return;
    const k = Math.min(1, (performance.now() - flight.t0) / 700);
    const e = k < 0.5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2; // easeInOutCubic
    setView(new THREE.Vector3().lerpVectors(flight.from, flight.to, e), flight.fromZoom + (flight.zoom - flight.fromZoom) * e);
    if (k === 1) { const done = flight.resolve; flight = null; done(); }
  }
  function flyTo(name) {
    const zoom = 2.2, to = new THREE.Box3().setFromObject(zones[name]).getCenter(new THREE.Vector3());
    // wide screens show the panel on the right, so the object moves to the left half
    if (stage.clientWidth >= 1100) to.addScaledVector(RIGHT, (cam.right - cam.left) / zoom * 0.22);
    return fly(to, zoom);
  }

  let fixed = hour, shadowHour = null;
  const motion = !reducedMotion;
  function frame(t = 0) {
    flyStep();
    const s = t / 1000, h = fixed ?? localHour();
    if (h !== shadowHour) { shadowHour = h; renderer.shadowMap.needsUpdate = true; }
    applyTime(room, corners, sampleTime(h));
    const routine = routineAt(h);
    room.tick(s, motion);
    for (const c of Object.values(corners)) c.tick(s, routine, motion);
    post.render(scene, cam);
  }

  resize();
  frame();
  stage.append(renderer.domElement);
  new ResizeObserver(resize).observe(stage);
  initPick(stage, renderer, cam, root, onPick);
  const loop = () => renderer.setAnimationLoop(document.hidden ? null : frame); // no drawing in a hidden tab
  document.addEventListener('visibilitychange', loop);
  loop();

  return { setHour(h) { fixed = h; }, flyTo, flyHome: () => fly(HOME.clone(), 1) };
}

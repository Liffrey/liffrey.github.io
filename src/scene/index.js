import * as THREE from 'three';
import { sampleTime, routineAt, localHour } from '../lib/time.js';
import { makeKit } from './kit.js';
import { buildRoom } from './room.js';
import { build as buildGames } from './games.js';
import { build as buildTech } from './tech.js';
import { build as buildCinema } from './cinema.js';
import { applyTime } from './lighting.js';
import { makePost } from './post.js';

// Builds the room into `stage` and runs it. Throws if WebGL is unavailable; the caller keeps the still image then.
export async function start(stage, data, { hour = null, reducedMotion = false } = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: false }); // throws without WebGL
  renderer.setPixelRatio(1);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.BasicShadowMap; // hard shadows suit pixel art

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#0f0d18');
  // 2:1 pixel-art isometric: azimuth 45°, elevation 30°
  const target = new THREE.Vector3(0, 1.6, 0);
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 60);
  cam.position.copy(target).add(new THREE.Vector3(12.25, 10, 12.25));
  cam.lookAt(target);

  const root = new THREE.Group();
  scene.add(root);
  const kit = makeKit(root);
  const room = buildRoom(kit, scene);
  const corners = { games: buildGames(kit, data), tech: buildTech(kit, data), cinema: buildCinema(kit, data) };
  const small = stage.clientWidth < 700;
  room.sun.shadow.mapSize.set(small ? 1024 : 2048, small ? 1024 : 2048);
  const post = makePost(renderer);

  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight, px = w < 700 ? 4 : 3;
    const lw = Math.max(1, Math.floor(w / px)), lh = Math.max(1, Math.floor(h / px));
    renderer.setSize(lw, lh, false);
    post.setSize(lw, lh);
    const aspect = w / h, view = Math.max(12, 12.5 / aspect); // narrow screens zoom out so the room fits
    Object.assign(cam, { left: -view * aspect / 2, right: view * aspect / 2, top: view / 2, bottom: -view / 2 });
    cam.updateProjectionMatrix();
  }

  let fixed = hour;
  const motion = !reducedMotion;
  function frame(t = 0) {
    const s = t / 1000, h = fixed ?? localHour();
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
  const loop = () => renderer.setAnimationLoop(document.hidden ? null : frame); // no drawing in a hidden tab
  document.addEventListener('visibilitychange', loop);
  loop();

  return { setHour(h) { fixed = h; } };
}

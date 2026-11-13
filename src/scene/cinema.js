import * as THREE from 'three';
import { motifPixels } from '../lib/posters.js';

// Three framed posters under a spotlight, reels and clapper shelf, film shelf, popcorn.
// The posters show the first three favorite films; a frame without a film stays plain.
export function build(kit, data) {
  const { box, flat } = kit;
  const cinema = kit.zone('cinema', 'Cinema');
  [[-0.9, '#f0c040'], [0.6, '#e0703a'], [2.0, '#dddddd']].forEach(([z, frame], i) => {
    box(0.05, 1.5, 1.05, frame, -3.97, 2.75, z, cinema);
    const art = box(0.02, 1.3, 0.85, '#2a2440', -3.94, 2.75, z, cinema);
    const film = data.favorites.films[i];
    if (!film) return;
    const [bg, fg] = film.poster.colors;
    art.material.color.set('#ffffff');
    art.material.map = kit.pixelTexture(8, 12, ctx => {
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, 8, 12);
      ctx.fillStyle = fg;
      for (const [x, y, w, h] of motifPixels(film.poster.motif)) ctx.fillRect(x, y, w, h);
    });
  });
  const wash = new THREE.SpotLight('#ffe0b0', 6, 6, 0.9, 0.6, 1.5);
  wash.position.set(-2.4, 4.4, 0.6); wash.target.position.set(-4, 2.6, 0.6);
  cinema.add(wash, wash.target);
  box(0.5, 0.08, 2.2, '#7b5a43', -3.75, 1.45, 0.6, cinema);
  for (const z of [0.0, 0.6]) { const r = flat(new THREE.CylinderGeometry(0.28, 0.28, 0.08, 10), '#bbbbbb', -3.7, 1.78, z, cinema); r.rotation.z = Math.PI / 2; }
  box(0.04, 0.26, 0.36, '#222222', -3.7, 1.62, 1.25, cinema);
  box(0.045, 0.06, 0.37, '#eeeeee', -3.7, 1.72, 1.25, cinema);
  box(0.06, 2.4, 1.2, '#4a3628', -3.97, 1.2, 3.2, cinema);
  for (const z of [2.6, 3.8]) box(0.45, 2.4, 0.05, '#5e4433', -3.75, 1.2, z, cinema);
  for (const y of [0.05, 0.62, 1.2, 1.78, 2.38]) box(0.45, 0.05, 1.2, '#5e4433', -3.75, y, 3.2, cinema);
  const DISC = ['#c04040', '#4060c0', '#e0c040', '#40a060', '#a050c0', '#e07040', '#dddddd', '#202020'];
  for (const base of [0.075, 0.645, 1.225, 1.805]) {
    for (let z = 2.66; z < 3.74; z += 0.075) {
      if (kit.rnd() < 0.12) continue;
      const h = 0.34 + kit.rnd() * 0.12;
      box(0.34, h, 0.06, DISC[Math.floor(kit.rnd() * DISC.length)], -3.76, base + h / 2, z, cinema);
    }
  }
  box(0.3, 0.45, 0.3, '#dd4444', -3.0, 0.22, 2.9, cinema);
  box(0.32, 0.12, 0.32, '#ffe9a8', -3.0, 0.5, 2.9, cinema);

  return { zone: cinema, tick() {} };
}

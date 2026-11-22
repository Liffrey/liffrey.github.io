import * as THREE from 'three';
import { motifPath } from '../lib/posters.js';

// Three framed posters under a spotlight, reels and clapper shelf, film shelf.
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
    art.material.map = kit.canvasTexture(160, 240, ctx => {
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, 160, 240);
      ctx.scale(2, 2); // the motif is drawn on an 80x120 sheet
      ctx.fillStyle = fg;
      ctx.fill(new Path2D(motifPath(film.poster.motif)));
      const title = film.title.toUpperCase(); // along the bottom, shrunk to fit
      ctx.font = '900 15px system-ui, sans-serif';
      ctx.textAlign = 'center';
      const k = Math.min(1, 68 / ctx.measureText(title).width);
      ctx.translate(40, 110);
      ctx.scale(k, k);
      ctx.fillText(title, 0, 0);
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
  // film cases: all the same height and mostly black or blue, so they don't read as the books next door
  const CASE = ['#1c1c26', '#1c1c26', '#1c1c26', '#2a4a9a', '#2a4a9a', '#d8d4cc', '#b8323a'];
  for (const base of [0.075, 0.645, 1.225, 1.805]) {
    for (let z = 2.66; z < 3.74; z += 0.05) {
      if (kit.rnd() < 0.1) continue;
      box(0.34, 0.42, 0.04, CASE[Math.floor(kit.rnd() * CASE.length)], -3.76, base + 0.21, z, cinema);
    }
  }

  return { zone: cinema, tick() {} };
}

import * as THREE from 'three';
import { CALENDAR_COLORS } from '../lib/render.js';

// Objects that are not in the mockup: commit calendar (part of Tech), CV folder, wall phone, bookcase.
export function build(kit, data, techZone) {
  const { box } = kit;
  // invisible, larger click target for objects that are only a few pixels on screen (rays still hit hidden meshes)
  const hitArea = (w, h, d, x, y, z, parent) => { const m = box(w, h, d, '#000000', x, y, z, parent); m.visible = false; };

  // commit calendar on the back wall above the shelf
  const { grid } = data.calendar;
  box(0.98, 0.58, 0.03, '#1a1626', 3.45, 3.6, -3.985, techZone);
  const calendar = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.5), new THREE.MeshLambertMaterial({
    map: kit.canvasTexture(grid.length, 7, ctx => grid.forEach((week, x) => week.forEach((level, y) => {
      ctx.fillStyle = CALENDAR_COLORS[level];
      ctx.fillRect(x, y, 1, 1);
    })), true),
  }));
  calendar.position.set(3.45, 3.6, -3.965);
  techZone.add(calendar);

  // CV folder on the front-left of the desk
  const cv = kit.zone('cv', 'CV');
  box(0.42, 0.03, 0.32, '#e8c060', 0.4, 1.49, -3.05, cv);
  box(0.36, 0.01, 0.28, '#f4f0e8', 0.43, 1.51, -3.07, cv).rotation.y = 0.12;
  hitArea(0.6, 0.25, 0.5, 0.4, 1.55, -3.05, cv);

  // wall phone on the left wall, above the arcade cabinet
  const contact = kit.zone('contact', 'Contact');
  box(0.08, 0.4, 0.25, '#c04040', -3.96, 3.0, -2.3, contact);
  box(0.07, 0.36, 0.08, '#d05050', -3.885, 3.0, -2.39, contact);
  box(0.02, 0.1, 0.1, '#e8e0d0', -3.91, 3.06, -2.24, contact);
  hitArea(0.15, 0.8, 0.55, -3.92, 2.95, -2.3, contact);
  for (const [y, z] of [[2.78, -2.39], [2.7, -2.36], [2.64, -2.31], [2.72, -2.26]]) box(0.03, 0.05, 0.03, '#2a2a2a', -3.9, y, z, contact);

  // low bookcase on the left wall, under the film posters: two shelves of novels and a stack on top
  const books = kit.zone('books', 'Books');
  const WOOD = '#9a6440', X = -3.78, Z0 = -1.2, Z1 = 1.5, MID = (Z0 + Z1) / 2, W = Z1 - Z0;
  box(0.04, 0.9, W, '#6a4028', -3.98, 0.45, MID, books);
  for (const z of [Z0, Z1]) box(0.44, 0.92, 0.05, WOOD, X, 0.46, z, books);
  for (const y of [0.03, 0.46, 0.9]) box(0.44, 0.05, W, WOOD, X, y, MID, books);
  const SPINE = ['#d8453b', '#2f6fb5', '#e8b23a', '#3f9a5a', '#8a4fb0', '#e07a3a', '#f0e6d0', '#2a2a3a'];
  for (const base of [0.055, 0.485]) {
    for (let z = Z0 + 0.04; ;) {
      const t = 0.05 + kit.rnd() * 0.04, h = 0.25 + kit.rnd() * 0.1;
      if (z + t > Z1 - 0.04) break;
      if (kit.rnd() < 0.08) { z += 0.12; continue; } // a gap where a book is out
      box(0.3, h, t, SPINE[Math.floor(kit.rnd() * SPINE.length)], X + 0.02, base + h / 2, z + t / 2, books);
      z += t + 0.004;
    }
  }
  ['#2f6fb5', '#e8b23a', '#d8453b'].forEach((c, i) => box(0.3, 0.06, 0.42 - i * 0.04, c, X, 0.955 + i * 0.06, 1.0, books));

  return { cv, contact, calendar, books };
}

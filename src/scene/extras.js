import * as THREE from 'three';
import { CALENDAR_COLORS } from '../lib/render.js';

// Objects that are not in the mockup: commit calendar (part of Tech), CV folder, wall phone.
export function build(kit, data, techZone) {
  const { box } = kit;

  // commit calendar on the back wall above the shelf
  const { grid } = data.calendar;
  box(0.98, 0.58, 0.03, '#1a1626', 3.45, 3.6, -3.985, techZone);
  const calendar = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.5), new THREE.MeshLambertMaterial({
    map: kit.pixelTexture(grid.length, 7, ctx => grid.forEach((week, x) => week.forEach((level, y) => {
      ctx.fillStyle = CALENDAR_COLORS[level];
      ctx.fillRect(x, y, 1, 1);
    }))),
  }));
  calendar.position.set(3.45, 3.6, -3.965);
  techZone.add(calendar);

  // CV folder on the front-left of the desk
  const cv = kit.zone('cv', 'CV');
  box(0.42, 0.03, 0.32, '#e8c060', 0.4, 1.49, -3.05, cv);
  box(0.36, 0.01, 0.28, '#f4f0e8', 0.43, 1.51, -3.07, cv).rotation.y = 0.12;

  // wall phone on the left wall, above the arcade cabinet
  const contact = kit.zone('contact', 'Contact');
  box(0.08, 0.4, 0.25, '#c04040', -3.96, 3.0, -2.3, contact);
  box(0.07, 0.36, 0.08, '#d05050', -3.885, 3.0, -2.39, contact);
  box(0.02, 0.1, 0.1, '#e8e0d0', -3.91, 3.06, -2.24, contact);
  for (const [y, z] of [[2.78, -2.39], [2.7, -2.36], [2.64, -2.31], [2.72, -2.26]]) box(0.03, 0.05, 0.03, '#2a2a2a', -3.9, y, z, contact);

  return { cv, contact, calendar };
}

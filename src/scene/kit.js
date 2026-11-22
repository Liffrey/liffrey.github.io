import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export const noRay = () => {};

// Cartoon shading: light falls into three flat tones instead of a smooth ramp.
const TONES = new THREE.DataTexture(new Uint8Array([110, 185, 255]), 3, 1, THREE.RedFormat);
TONES.needsUpdate = true;
const toon = (color, emissive = '#000000') => new THREE.MeshToonMaterial({ color, emissive, gradientMap: TONES });

// Box-building helpers shared by every part of the room. Everything is built from code, no models.
export function makeKit(root) {
  let seed = 11;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  function box(w, h, d, color, x, y, z, parent = root, emissive) {
    const r = Math.min(w, h, d, 0.32) * 0.25; // soft corners, never rounder than the thinnest side allows
    const m = new THREE.Mesh(r > 0.004 ? new RoundedBoxGeometry(w, h, d, 2, r) : new THREE.BoxGeometry(w, h, d),
      toon(color, emissive || '#000000'));
    m.position.set(x, y, z);
    m.castShadow = m.receiveShadow = true;
    parent.add(m);
    return m;
  }
  function glowBox(w, h, d, color, x, y, z, parent = root) { // self-lit, casts no shadow
    const m = box(w, h, d, '#000000', x, y, z, parent, color);
    m.castShadow = false;
    return m;
  }
  function flat(geo, color, x, y, z, parent = root) {
    const m = new THREE.Mesh(geo, toon(color));
    m.position.set(x, y, z);
    m.castShadow = m.receiveShadow = true;
    parent.add(m);
    return m;
  }
  function point(color, intensity, dist, x, y, z, parent = root) {
    const l = new THREE.PointLight(color, intensity, dist, 1.6);
    l.position.set(x, y, z);
    parent.add(l);
    return l;
  }
  function zone(name, label) {
    const g = new THREE.Group();
    Object.assign(g.userData, { zone: name, label });
    root.add(g);
    return g;
  }
  function canvasTexture(w, h, draw, sharp = false) { // sharp: hard cell edges, for grids
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    draw(canvas.getContext('2d'));
    const t = new THREE.CanvasTexture(canvas);
    if (sharp) { t.magFilter = t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; }
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }
  function steam(x, y, z, parent = root) { // four puffs rising and fading; the caller decides when it shows
    const group = new THREE.Group();
    group.position.set(x, y, z);
    parent.add(group);
    const puffs = [0, 1, 2, 3].map(() => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.05),
        new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, depthWrite: false }));
      m.raycast = noRay;
      group.add(m);
      return m;
    });
    return {
      group,
      tick(s) {
        puffs.forEach((p, i) => {
          const k = (s / 2 + i / 4) % 1;
          p.position.set(Math.sin((s + i) * 2) * 0.03, k * 0.4, 0);
          p.material.opacity = 0.6 * (1 - k);
        });
      },
    };
  }
  return { box, glowBox, flat, point, zone, rnd, canvasTexture, steam };
}

import * as THREE from 'three';

export const noRay = () => {};

// Box-building helpers shared by every part of the room. Everything is built from code, no models.
export function makeKit(root) {
  let seed = 11;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  function box(w, h, d, color, x, y, z, parent = root, emissive) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d),
      new THREE.MeshLambertMaterial({ color, emissive: emissive || '#000000' }));
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
    const m = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color, flatShading: true }));
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
  return { box, glowBox, flat, point, zone, rnd };
}

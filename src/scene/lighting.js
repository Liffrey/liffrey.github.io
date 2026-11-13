import * as THREE from 'three';

const tmp = new THREE.Color();
const white = new THREE.Color('#ffffff');

// Writes one sampleTime() result into the scene's lights and materials.
export function applyTime(room, corners, t) {
  room.sun.color.set(t.sun);
  room.sun.intensity = t.si;
  room.sun.position.set(...t.pos).add(room.sun.target.position);
  room.skyMat.color.set(t.sky);
  room.background.set(t.bg);
  room.hemi.color.set(t.hs);
  room.hemi.groundColor.set(t.hg);
  room.hemi.intensity = t.hi;
  room.beamMat.color.set(t.beam);
  room.dustMat.color.copy(room.beamMat.color).lerp(white, 0.4);
  room.starMat.opacity = t.stars;
  room.cityWinMat.color.set('#1a1e34').lerp(tmp.set('#ffd27a'), t.city);
  room.cityMat.color.set('#5a6a8a').lerp(tmp.set('#0a1028'), t.city);

  const L = (room.lamps = t.lamps);
  room.lamp.intensity = 7 * L;
  room.shade.material.emissiveIntensity = L;
  room.strings.forEach(s => s.intensity = 1.5 * L);
  corners.tech.deskLamp.intensity = 9 * L;
  corners.tech.head.material.emissiveIntensity = L;

  room.sunMat.opacity = t.sunA;
  room.sunDisc.position.set(...t.sunDisc, -5.95);
  room.moonMat.opacity = t.moonA;
  room.moonDisc.position.set(...t.moonDisc, -5.94);
  room.updateBeam();
}

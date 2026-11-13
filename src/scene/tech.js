import * as THREE from 'three';

// Desk, monitor with code, keyboard, headphones, desk lamp, RGB case, chair, shelf with server, robot and books.
export function build(kit) {
  const { box, glowBox, flat, point, rnd } = kit;
  const tech = kit.zone('tech', 'Tech');
  box(2.8, 0.15, 1.2, '#7b5a43', 1.4, 1.4, -3.35, tech);
  for (const [x, z] of [[0.1, -3.85], [2.7, -3.85], [0.1, -2.85], [2.7, -2.85]]) box(0.12, 1.33, 0.12, '#5e4433', x, 0.67, z, tech);
  box(0.15, 0.3, 0.15, '#222222', 1.2, 1.62, -3.6, tech);
  box(1.5, 0.9, 0.1, '#111111', 1.2, 2.2, -3.65, tech);
  glowBox(1.35, 0.75, 0.02, '#1a4a6a', 1.2, 2.2, -3.59, tech);
  const CODE = ['#7ad0ff', '#ff9ad0', '#a0ff8a', '#ffd27a'], code = [];
  for (let i = 0; i < 7; i++) {
    const w = 0.25 + rnd() * 0.7, ind = (i % 3) * 0.1;
    code.push(glowBox(w, 0.04, 0.01, CODE[i % 4], 0.6 + ind + w / 2, 2.48 - i * 0.09, -3.575, tech));
  }
  box(0.9, 0.05, 0.3, '#dddddd', 1.2, 1.5, -3.0, tech);
  box(0.1, 0.04, 0.16, '#dddddd', 1.85, 1.5, -3.0, tech);
  box(0.15, 0.2, 0.15, '#f0c040', 2.55, 1.57, -2.95, tech);
  box(0.04, 0.4, 0.04, '#333333', 0.35, 1.67, -3.6, tech);
  const phones = flat(new THREE.TorusGeometry(0.14, 0.035, 4, 8, Math.PI), '#e05050', 0.35, 1.8, -3.6, tech);
  phones.rotation.y = Math.PI / 2;
  box(0.25, 0.05, 0.25, '#333333', 2.5, 1.5, -3.65, tech);
  box(0.04, 0.5, 0.04, '#333333', 2.5, 1.75, -3.65, tech);
  const head = box(0.3, 0.12, 0.2, '#e0b040', 2.38, 2.0, -3.5, tech); head.castShadow = false;
  head.material.emissive.set('#604010');
  const deskLamp = new THREE.SpotLight('#ffd08a', 9, 4, 0.75, 0.5, 1.5);
  deskLamp.position.set(2.3, 1.93, -3.4); deskLamp.target.position.set(1.7, 1.45, -3.0);
  deskLamp.castShadow = true; deskLamp.shadow.mapSize.set(512, 512); deskLamp.shadow.bias = -0.002;
  tech.add(deskLamp, deskLamp.target);
  box(0.5, 1.2, 1.0, '#1e1e26', 3.3, 0.6, -3.35, tech);
  const rgb = [glowBox(0.02, 0.28, 0.28, '#ff00ff', 3.56, 0.8, -3.35, tech), glowBox(0.02, 0.28, 0.28, '#ff00ff', 3.56, 0.42, -3.35, tech), glowBox(0.5, 0.03, 0.03, '#ff00ff', 3.3, 1.2, -2.85, tech)];
  const rgbLight = point('#ff00ff', 2, 3, 3.9, 0.7, -3.0, tech);
  box(0.5, 0.8, 0.6, '#333333', 1.3, 0.4, -2.2, tech).scale.set(0.2, 1, 0.2);
  box(0.8, 0.1, 0.8, '#2a2a33', 1.3, 0.8, -2.2, tech);
  box(0.8, 0.9, 0.1, '#2a2a33', 1.3, 1.3, -1.8, tech);
  box(1.2, 0.06, 0.35, '#7b5a43', 3.3, 2.6, -3.82, tech);
  box(0.3, 0.2, 0.25, '#2f6f3f', 2.95, 2.73, -3.8, tech);
  const leds = [0, 1, 2].map(i => glowBox(0.03, 0.03, 0.01, '#40ff60', 2.88 + i * 0.07, 2.73, -3.67, tech));
  box(0.14, 0.18, 0.12, '#b0b8c0', 3.35, 2.72, -3.8, tech);
  box(0.12, 0.1, 0.1, '#b0b8c0', 3.35, 2.86, -3.8, tech);
  glowBox(0.03, 0.02, 0.01, '#40d0ff', 3.32, 2.87, -3.745, tech);
  glowBox(0.03, 0.02, 0.01, '#40d0ff', 3.38, 2.87, -3.745, tech);
  for (let i = 0; i < 3; i++) box(0.12, 0.3, 0.22, ['#c05050', '#5070c0', '#d0b040'][i], 3.65 + i * 0.13, 2.78, -3.82, tech);
  point('#5ab0e0', 3, 4, 1.2, 2.2, -3.0, tech);

  const hue = new THREE.Color();
  return {
    zone: tech, deskLamp, head, code,
    tick(s, routine, motion) {
      hue.setHSL((s * 0.08) % 1, 1, 0.5);
      rgb.forEach(m => m.material.emissive.copy(hue));
      rgbLight.color.copy(hue);
      leds.forEach((l, i) => l.material.emissiveIntensity = !motion || (Math.floor(s * 3 + i * 1.3) % 3) ? 1 : 0.1);
    },
  };
}

import * as THREE from 'three';

// TV and console, game boxes, arcade cabinet, neon sign, rug, controllers, beanbag with a sleeping cat.
export function build(kit) {
  const { box, glowBox, flat, point } = kit;
  const games = kit.zone('games', 'Games');
  box(2.2, 0.6, 0.8, '#2f2840', -2.3, 0.3, -3.5, games);
  box(2.0, 1.2, 0.15, '#0d0d10', -2.3, 1.35, -3.75, games);
  const tv = glowBox(1.8, 1.0, 0.02, '#c03a78', -2.3, 1.35, -3.67, games);
  box(0.5, 0.12, 0.4, '#eeeeee', -1.6, 0.66, -3.4, games);
  glowBox(0.05, 0.03, 0.02, '#40a0ff', -1.45, 0.66, -3.19, games);
  for (let i = 0; i < 4; i++) box(0.06, 0.3, 0.22, ['#d04040', '#40a040', '#4060d0', '#e0c040'][i], -3.2 + i * 0.08, 0.75, -3.45, games);
  const bars = [1.765, 0.935].map(y => { const b = box(1.8, 0.17, 0.01, '#000000', -2.3, y, -3.655, games); b.castShadow = false; b.visible = false; return b; }); // cinemascope bands for the late film
  const tvLight = point('#ff5c9a', 4, 6, -2.3, 1.3, -2.9, games);
  const NEON = '#ff3048', neon = [];
  neon.push(glowBox(0.06, 0.8, 0.04, NEON, -2.65, 3.0, -3.97, games));
  const n1 = glowBox(0.81, 0.06, 0.04, NEON, -2.3, 3.2, -3.97, games); n1.rotation.z = -0.519; neon.push(n1);
  const n2 = glowBox(0.81, 0.06, 0.04, NEON, -2.3, 2.8, -3.97, games); n2.rotation.z = 0.519; neon.push(n2);
  const neonLight = point(NEON, 3, 4.5, -2.3, 3.0, -3.4, games);
  box(0.8, 2.0, 0.8, '#2a1f4a', -3.6, 1.0, -2.3, games);
  box(0.8, 0.12, 0.02, '#ff5c9a', -3.6, 1.6, -1.89, games);
  box(0.8, 0.06, 0.02, '#ffd040', -3.6, 1.45, -1.89, games);
  const marquee = glowBox(0.05, 0.25, 0.7, '#ff7ab0', -3.18, 1.85, -2.3, games);
  const arcadeScreen = glowBox(0.04, 0.5, 0.6, '#30c090', -3.18, 1.4, -2.3, games);
  box(0.35, 0.08, 0.75, '#1a1a2a', -3.05, 1.0, -2.3, games);
  glowBox(0.05, 0.03, 0.05, '#ff4040', -2.98, 1.06, -2.15, games);
  glowBox(0.05, 0.03, 0.05, '#ffe040', -2.98, 1.06, -2.05, games);
  box(0.03, 0.12, 0.03, '#111111', -3.0, 1.1, -2.5, games);
  point('#40f0b0', 3, 4, -2.7, 1.4, -2.3, games);
  box(3.0, 0.03, 2.4, '#c8a060', -1.6, 0.015, -1.0, games);
  box(2.8, 0.04, 2.2, '#34507c', -1.6, 0.02, -1.0, games);
  box(0.35, 0.07, 0.2, '#1a1a1a', -0.9, 0.07, -0.6, games);
  box(0.35, 0.07, 0.2, '#f0f0f0', -2.3, 0.07, -1.7, games).rotation.y = 0.6;
  const bag = flat(new THREE.IcosahedronGeometry(0.62, 1), '#b8323a', -1.7, 0.4, -0.3, games);
  bag.scale.y = 0.7;
  const cat = new THREE.Group(); cat.position.set(-1.7, 0.86, -0.3); games.add(cat);
  box(0.5, 0.2, 0.3, '#d9893a', 0, 0, 0, cat);
  box(0.22, 0.2, 0.22, '#d9893a', 0.3, 0.05, 0.02, cat);
  box(0.06, 0.08, 0.05, '#d9893a', 0.33, 0.18, -0.06, cat);
  box(0.06, 0.08, 0.05, '#d9893a', 0.33, 0.18, 0.1, cat);
  box(0.3, 0.06, 0.06, '#b86a28', -0.3, -0.06, 0.15, cat).rotation.y = 0.5;

  const GAME = ['#c03a78', '#3ac0a0', '#e0c040', '#4060d0'], film = new THREE.Color();
  return {
    zone: games, tv, tvLight, arcadeScreen, marquee,
    // evening: a game on the TV and the arcade in attract mode; night: a film with bands; otherwise the TV is off
    tick(s, routine, motion) {
      const evening = routine === 'evening', night = routine === 'night';
      bars.forEach(b => b.visible = night);
      if (evening) tv.material.emissive.set(motion ? GAME[Math.floor(s / 0.4) % GAME.length] : GAME[0]);
      else if (night) tv.material.emissive.set('#1a2840').lerp(film.set('#503820'), motion ? 0.5 + 0.5 * Math.sin(s * Math.PI / 4) : 0.5);
      else tv.material.emissive.set('#000000');
      tv.material.emissiveIntensity = motion ? 0.85 + Math.sin(s * 1000 / 90) * 0.1 + Math.random() * 0.1 : 0.9;
      tvLight.color.copy(tv.material.emissive);
      tvLight.intensity = evening || night ? 3 + tv.material.emissiveIntensity * 1.5 : 0;
      if (evening) arcadeScreen.material.emissive.setHSL(0.45 + Math.sin(s * 0.7) * 0.08, 0.7, 0.45);
      else arcadeScreen.material.emissive.set('#205040');
      marquee.material.emissiveIntensity = evening && motion && Math.floor(s * 2) % 2 ? 0.3 : 1;
      const buzz = motion && Math.random() < 0.015 ? 0.25 : 1;
      neon.forEach(n => n.material.emissiveIntensity = buzz);
      neonLight.intensity = 3 * buzz;
      if (motion) cat.scale.y = 1 + Math.sin(s * 2.2) * 0.04;
    },
  };
}

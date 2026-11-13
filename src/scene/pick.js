import * as THREE from 'three';

const lift = new THREE.Color('#262626');

// Hovering a zone makes it glow and shows its name (mouse only); clicking or tapping it calls onPick.
export function initPick(stage, renderer, cam, root, onPick) {
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  const tip = document.createElement('div');
  tip.className = 'tip';
  tip.hidden = true;
  stage.append(tip);
  let hovered = null;

  const zoneOf = o => { while (o) { if (o.userData.zone) return o; o = o.parent; } return null; };
  function glow(g, on) {
    g.traverse(m => {
      if (!m.isMesh || !m.material.emissive) return;
      m.userData.base ??= m.material.emissive.clone();
      m.material.emissive.copy(m.userData.base);
      if (on) m.material.emissive.add(lift);
    });
  }
  function zoneAt(e) {
    const r = renderer.domElement.getBoundingClientRect();
    ndc.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1);
    ray.setFromCamera(ndc, cam);
    const hit = ray.intersectObjects(root.children, true)[0];
    return hit ? zoneOf(hit.object) : null;
  }
  function hover(z, e) {
    if (z !== hovered) { if (hovered) glow(hovered, false); hovered = z; if (z) glow(z, true); }
    stage.style.cursor = z ? 'pointer' : '';
    tip.hidden = !z;
    if (z) {
      tip.textContent = z.userData.label;
      tip.style.left = `${e.clientX + 14}px`;
      tip.style.top = `${e.clientY + 10}px`;
    }
  }

  stage.addEventListener('pointermove', e => { if (e.pointerType === 'mouse') hover(zoneAt(e), e); });
  stage.addEventListener('pointerleave', e => hover(null, e));
  stage.addEventListener('click', e => {
    const z = zoneAt(e);
    if (!z) return;
    hover(null, e);
    onPick(z.userData.zone);
  });
}

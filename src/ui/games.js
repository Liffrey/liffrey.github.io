import { moveSelection } from '../lib/route.js';

// Console-style menu: focusing or clicking a cartridge shows its details; arrow keys move between them.
export function initGames(dialog) {
  const rows = [...dialog.querySelectorAll('.row')].map(ul => [...ul.querySelectorAll('.cart')]);
  const all = rows.flat();
  const select = btn => {
    for (const b of all) {
      b.setAttribute('aria-pressed', String(b === btn));
      document.getElementById(b.dataset.detail).hidden = b !== btn;
    }
  };
  for (const b of all) {
    b.addEventListener('focus', () => select(b));
    b.addEventListener('click', () => select(b));
  }
  dialog.addEventListener('keydown', e => {
    const r = rows.findIndex(row => row.includes(document.activeElement));
    if (r < 0) return;
    const c = rows[r].indexOf(document.activeElement);
    const [nr, nc] = moveSelection(rows.map(row => row.length), [r, c], e.key);
    if (nr !== r || nc !== c) { e.preventDefault(); rows[nr][nc].focus(); }
  });
  if (all[0]) select(all[0]);
}

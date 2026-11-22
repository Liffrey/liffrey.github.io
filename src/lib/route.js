export const ROUTES = ['games', 'tech', 'cinema', 'books', 'cv', 'contact'];

export function parseRoute(hash) {
  const m = /^#\/([a-z]+)$/.exec(hash);
  return m && ROUTES.includes(m[1]) ? m[1] : null;
}

// Arrow keys in the game menu: left/right within a row, up/down to the nearest row that has items.
export function moveSelection(rows, [r, c], key) {
  if (key === 'ArrowLeft') return [r, Math.max(0, c - 1)];
  if (key === 'ArrowRight') return [r, Math.min(rows[r] - 1, c + 1)];
  const step = key === 'ArrowUp' ? -1 : key === 'ArrowDown' ? 1 : 0;
  if (!step) return [r, c];
  for (let n = r + step; n >= 0 && n < rows.length; n += step) {
    if (rows[n] > 0) return [n, Math.min(c, rows[n] - 1)];
  }
  return [r, c];
}

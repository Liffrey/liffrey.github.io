import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MOTIFS, motifPixels, posterSVG } from '../src/lib/posters.js';

test('every motif draws inside the 8x12 grid', () => {
  for (const m of MOTIFS) {
    const px = motifPixels(m);
    assert.ok(px.length > 0, m);
    for (const [x, y, w, h] of px) assert.ok(x >= 0 && y >= 0 && w > 0 && h > 0 && x + w <= 8 && y + h <= 12, m);
  }
});
test('poster svg uses both colors', () => {
  const s = posterSVG({ colors: ['#112233', '#445566'], motif: 'sun' });
  assert.match(s, /#112233/);
  assert.match(s, /#445566/);
});

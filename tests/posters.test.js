import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MOTIFS, motifPath, posterSVG } from '../src/lib/posters.js';

test('every motif is a closed path on the 80x120 sheet', () => {
  for (const m of MOTIFS) {
    const d = motifPath(m);
    assert.match(d, /^M[\d\s.MmLlHhVvCcAaZz-]+Z$|^M[\d\s.MmLlHhVvCcAaZz-]+z$/, m);
  }
});
test('poster svg uses both colors and the motif', () => {
  const s = posterSVG({ colors: ['#112233', '#445566'], motif: 'bike' });
  assert.match(s, /#112233/);
  assert.match(s, /#445566/);
  assert.ok(s.includes(motifPath('bike')));
});

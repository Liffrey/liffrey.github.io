import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { injectContent } from '../src/lib/render.js';
import { loadData } from '../scripts/load-data.mjs';
import { fixtureRoot, repoRoot } from './fixture.js';

const html = readFileSync(join(repoRoot, 'index.html'), 'utf8');
const data = () => loadData({ root: fixtureRoot(), env: {} });
const inline = out => JSON.parse(out.match(/<script type="application\/json" id="data">([\s\S]*?)<\/script>/)[1]);

test('every placeholder is filled and every panel exists', () => {
  const out = injectContent(html, data());
  assert.doesNotMatch(out, /<!--(head|intro|panels|data)-->/);
  for (const r of ['games', 'tech', 'cinema', 'cv', 'contact']) assert.match(out, new RegExp(`<dialog id="panel-${r}"`));
  assert.match(out, /\[PLACEHOLDER\] Film 1/);
});
test('hostile text is escaped and stays intact in inline JSON', () => {
  const d = data(), evil = '<img src=x onerror=alert(1)></script><script>alert(2)</script> $& $\'';
  d.projects.tech[0].description = evil;
  const out = injectContent(html, d);
  assert.doesNotMatch(out, /<img src=x/);
  assert.match(out, /&lt;img src=x/);
  assert.equal(inline(out).projects.tech[0].description, evil);
});
test('empty lists render empty states, never null or undefined', () => {
  const d = data();
  d.projects = { games: [], tech: [], cinema: [] };
  d.favorites = { games: [], films: [], tech: [] };
  const out = injectContent(html, d);
  assert.match(out, /No projects yet\./);
  assert.doesNotMatch(out, />[^<]*\b(undefined|null)\b/);
});
test('null-ish repo fields leave no trace', () =>
  assert.doesNotMatch(injectContent(html, data()), />[^<]*\b(undefined|null)\b/));
test('one contribution is singular', () => {
  const d = data();
  d.calendar.total = 1;
  assert.match(injectContent(html, d), /1 contribution in the last/);
});

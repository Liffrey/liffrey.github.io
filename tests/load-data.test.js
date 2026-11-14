import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadData, isWatchedFile } from '../scripts/load-data.mjs';
import { fixtureRoot } from './fixture.js';

test('local build uses sample data', () => {
  const d = loadData({ root: fixtureRoot(), env: {} });
  assert.ok(d.projects.tech.length > 0);
  assert.equal(d.calendar.grid.length, 13);
});
test('CI build refuses to fall back to sample data', () =>
  assert.throws(() => loadData({ root: fixtureRoot(), env: { CI: 'true' } }), /github\.json/));
test('broken content stops the build', () => {
  const root = fixtureRoot(), f = join(root, 'content/site.json');
  writeFileSync(f, JSON.stringify({ ...JSON.parse(readFileSync(f, 'utf8')), name: '' }));
  assert.throws(() => loadData({ root, env: {} }), /site\.json: name/);
});
test('CV pdf that does not exist is an error', () => {
  const root = fixtureRoot(), f = join(root, 'content/site.json'), s = JSON.parse(readFileSync(f, 'utf8'));
  s.cv.pdf = 'cv.pdf';
  writeFileSync(f, JSON.stringify(s));
  assert.throws(() => loadData({ root, env: {} }), /cv\.pdf/);
});
test('a JSON typo names the file it is in', () => {
  const root = fixtureRoot();
  writeFileSync(join(root, 'content/favorites.json'), '{ "games": [ }');
  assert.throws(() => loadData({ root, env: {} }), /content\/favorites\.json/);
});
test('content and data edits are recognised on Windows and elsewhere', () => {
  assert.ok(isWatchedFile(String.raw`D:\site\content\favorites.json`));
  assert.ok(isWatchedFile('/home/me/site/data/github.json'));
  assert.ok(!isWatchedFile(String.raw`D:\site\src\main.js`));
});

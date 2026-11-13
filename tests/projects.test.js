import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toProjects, checkRepos } from '../src/lib/projects.js';

const none = { projects: [], overrides: {} };
const repo = (name, topics, more = {}) => ({ name, description: null, html_url: `https://github.com/Liffrey/${name}`,
  homepage: null, language: null, topics, pushed_at: '2026-01-01T00:00:00Z', ...more });

test('untagged repos are hidden', () =>
  assert.deepEqual(toProjects([repo('a', [])], none), { games: [], tech: [], cinema: [] }));
test('topic picks the corner and nulls become empty strings', () =>
  assert.deepEqual(toProjects([repo('wavtoflac', ['portfolio-tech'])], none).tech, [{ name: 'wavtoflac', title: 'wavtoflac',
    description: '', url: 'https://github.com/Liffrey/wavtoflac', language: '', updated: '2026-01-01' }]));
test('two topics put a repo in two corners', () => {
  const p = toProjects([repo('x', ['portfolio-games', 'portfolio-cinema'])], none);
  assert.equal(p.games.length, 1);
  assert.equal(p.cinema.length, 1);
});
test('newest first', () => {
  const p = toProjects([repo('old', ['portfolio-tech']), repo('new', ['portfolio-tech'], { pushed_at: '2026-05-01T00:00:00Z' })], none);
  assert.deepEqual(p.tech.map(x => x.name), ['new', 'old']);
});
test('overrides replace title and description', () => {
  const p = toProjects([repo('wavtoflac', ['portfolio-tech'], { description: 'orig' })],
    { projects: [], overrides: { wavtoflac: { title: 'WAV to FLAC', description: 'Converts audio.' } } });
  assert.equal(p.tech[0].title, 'WAV to FLAC');
  assert.equal(p.tech[0].description, 'Converts audio.');
});
test('extra projects come after GitHub ones', () => {
  const extra = { projects: [{ name: 'cc', title: 'CC', corner: 'games', description: 'd', url: '' }], overrides: {} };
  const p = toProjects([repo('g', ['portfolio-games'])], extra);
  assert.deepEqual(p.games.map(x => x.name), ['g', 'cc']);
  assert.deepEqual(p.games[1], { name: 'cc', title: 'CC', description: 'd', url: '', language: '', updated: '' });
});
test('empty GitHub answer is an error', () => {
  assert.throws(() => checkRepos([]), /no repositories/);
  assert.throws(() => checkRepos(undefined), /no repositories/);
});

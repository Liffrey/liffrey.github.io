import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateContent } from '../src/lib/content.js';

const load = f => JSON.parse(readFileSync(new URL(`../content/${f}`, import.meta.url), 'utf8'));
const good = () => ({ site: load('site.json'), favorites: load('favorites.json'), extra: load('projects.extra.json') });
const errorsOf = mutate => { const c = good(); mutate(c); return validateContent(c).join('\n'); };

test('shipped content is valid', () => assert.deepEqual(validateContent(good()), []));
test('six favorites are too many', () =>
  assert.match(errorsOf(c => c.favorites.games.push({ title: 'x', year: 2000, why: 'y' })), /favorites\.json: games/));
test('unknown motif', () =>
  assert.match(errorsOf(c => { c.favorites.films[0].poster.motif = 'skull'; }), /films\[0\]\.poster\.motif/));
test('bad poster color', () =>
  assert.match(errorsOf(c => { c.favorites.films[0].poster.colors = ['red', '#fff']; }), /films\[0\]\.poster\.colors/));
test('javascript: contact link is rejected', () =>
  assert.match(errorsOf(c => { c.site.contact[0].url = 'javascript:alert(1)'; }), /site\.json: contact\[0\]\.url/));
test('missing name', () => assert.match(errorsOf(c => { delete c.site.name; }), /site\.json: name/));
test('bad corner', () =>
  assert.match(errorsOf(c => { c.extra.projects[0].corner = 'music'; }), /projects\.extra\.json: projects\[0\]\.corner/));
test('a book needs an author', () =>
  assert.match(errorsOf(c => { c.favorites.books[0].author = ' '; }), /books\[0\]\.author/));

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseRoute, moveSelection } from '../src/lib/route.js';

test('parseRoute', () => {
  assert.equal(parseRoute('#/tech'), 'tech');
  assert.equal(parseRoute('#/contact'), 'contact');
  for (const h of ['', '#', '#/', '#/foo', '#tech', '#/tech/x']) assert.equal(parseRoute(h), null, h);
});
test('moveSelection stays inside rows and skips empty ones', () => {
  assert.deepEqual(moveSelection([3, 5], [0, 2], 'ArrowRight'), [0, 2]);
  assert.deepEqual(moveSelection([3, 5], [0, 0], 'ArrowLeft'), [0, 0]);
  assert.deepEqual(moveSelection([3, 5], [1, 4], 'ArrowUp'), [0, 2]);
  assert.deepEqual(moveSelection([3, 5], [0, 1], 'ArrowDown'), [1, 1]);
  assert.deepEqual(moveSelection([0, 5], [1, 1], 'ArrowUp'), [1, 1]);
  assert.deepEqual(moveSelection([3, 5], [0, 1], 'Enter'), [0, 1]);
});
test('books is a route', () => assert.equal(parseRoute('#/books'), 'books'));

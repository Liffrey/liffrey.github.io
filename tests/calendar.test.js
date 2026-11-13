import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calendarWeeks } from '../src/lib/calendar.js';

const days = counts => counts.map((count, i) => ({ date: `d${i}`, count }));

test('no data gives an empty 13x7 grid', () => {
  const c = calendarWeeks([]);
  assert.equal(c.grid.length, 13);
  assert.ok(c.grid.every(w => w.length === 7 && w.every(l => l === 0)));
  assert.equal(c.total, 0);
});
test('busiest day is level 4, a small day is level 1', () => {
  const counts = Array(100).fill(0); counts[99] = 8; counts[98] = 1;
  const c = calendarWeeks(days(counts));
  assert.equal(c.grid[12][6], 4);
  assert.equal(c.grid[12][5], 1);
  assert.equal(c.total, 9);
});
test('only the last 91 days count', () => {
  const counts = Array(100).fill(0); counts[0] = 50;
  assert.equal(calendarWeeks(days(counts)).total, 0);
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sampleTime, routineAt, formatHour, parseHourParam, localHour } from '../src/lib/time.js';

test('midnight is night with lamps dimmed for the film', () => {
  const t = sampleTime(0);
  assert.equal(t.sun, '#9ab8ff');
  assert.equal(t.sunA, 0);
  assert.equal(t.moonA, 1);
  assert.equal(t.lamps, 0.5);
});
test('evening lamps are fully on', () => assert.equal(sampleTime(21.5).lamps, 1));
test('noon is day', () => {
  const t = sampleTime(12);
  assert.equal(t.sun, '#fff0d8');
  assert.equal(t.lamps, 0);
  assert.equal(t.stars, 0);
});
test('24 wraps to 0', () => assert.deepEqual(sampleTime(24), sampleTime(0)));
test('no jumps anywhere in the day', () => {
  for (let h = 0; h < 24; h += 0.01) {
    const a = sampleTime(h), b = sampleTime(h + 0.01);
    assert.ok(Math.abs(a.lamps - b.lamps) < 0.05, `lamps jump at ${h}`);
    assert.ok(Math.abs(a.si - b.si) < 0.1, `sun intensity jumps at ${h}`);
  }
});
test('routine boundaries', () => {
  assert.equal(routineAt(5.99), 'night');
  assert.equal(routineAt(6), 'morning');
  assert.equal(routineAt(12), 'afternoon');
  assert.equal(routineAt(18), 'evening');
  assert.equal(routineAt(22.99), 'evening');
  assert.equal(routineAt(23), 'night');
});
test('formatHour', () => {
  assert.equal(formatHour(7.5), '07:30');
  assert.equal(formatHour(23.999), '23:59');
});
test('parseHourParam rejects junk', () => {
  for (const s of [null, '', ' ', 'abc', '24', '-1', '30']) assert.equal(parseHourParam(s), null, String(s));
  assert.equal(parseHourParam('20.5'), 20.5);
  assert.equal(parseHourParam('0'), 0);
});
test('formatHour shows the real clock for every minute of the day', () => {
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m++) {
      const want = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      assert.equal(formatHour(localHour(new Date(2026, 0, 1, h, m))), want);
    }
  }
});
test('the sun and moon never jump while they can be seen', () => {
  for (let h = 0; h < 24; h += 0.01) {
    const a = sampleTime(h), b = sampleTime(h + 0.01);
    for (const [disc, alpha] of [['sunDisc', 'sunA'], ['moonDisc', 'moonA']]) {
      if (a[alpha] < 0.01 && b[alpha] < 0.01) continue;
      assert.ok(Math.abs(a[disc][0] - b[disc][0]) < 0.05, `${disc} jumps at ${h.toFixed(2)}`);
    }
  }
});

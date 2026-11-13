// Light keyframes by local hour; everything in between is blended.
// pos = where the sun/moon light sits relative to its target (always outside the window).
const night = { sun: '#9ab8ff', si: 2.4, pos: [3.5, 9, -11], sky: '#0e1838', bg: '#0f0d18', hs: '#4a4a8a', hg: '#2a1a22', hi: 1.0, lamps: 1, stars: 1, city: 1, beam: '#5070b0', sunA: 0, moonA: 1 };
const noon = { sun: '#fff0d8', si: 4.5, pos: [0, 15, -11], sky: '#78b8ec', bg: '#a9bccf', hs: '#e8eeff', hg: '#8a6a50', hi: 3.2, lamps: 0, stars: 0, city: 0, beam: '#a09070', sunA: 1, moonA: 0 };

export const KEYFRAMES = [
  { h: 0, ...night, lamps: 0.5 },
  { h: 5.5, ...night, sun: '#7080b0', si: 1.2, pos: [3, 10, -11], sky: '#28305e', bg: '#1a1828', hs: '#5a5a90', hi: 0.7, lamps: 0.7, stars: 0.5, city: 0.6, beam: '#5060a0', moonA: 0.6 },
  { h: 7, ...noon, sun: '#ffa868', si: 3.0, pos: [2, 7.5, -11], sky: '#e89a80', bg: '#3a2c40', hs: '#c8a0b0', hg: '#3a2a22', hi: 1.0, lamps: 0.2, city: 0.2, beam: '#a06040' },
  { h: 10, ...noon, pos: [1, 11, -11] },
  { h: 15, ...noon, pos: [-2, 10.5, -11] },
  { h: 18, ...noon, sun: '#ff9848', si: 3.6, pos: [-4.5, 7.5, -11], sky: '#f09858', bg: '#5a3848', hs: '#e0b090', hg: '#4a3022', hi: 1.2, lamps: 0.3, city: 0.3, beam: '#b06030' },
  { h: 19.5, ...night, sun: '#5a68c0', si: 1.2, pos: [-4, 9, -11], sky: '#34387a', bg: '#1e1c38', hs: '#6060a0', hi: 0.8, lamps: 0.9, stars: 0.3, city: 0.9, beam: '#4050a0', moonA: 0.4 },
  { h: 21.5, ...night },
  { h: 23.5, ...night, lamps: 0.5 }, // lights dim for the late film
  { h: 24, ...night, lamps: 0.5 },
];

const COLORS = ['sun', 'sky', 'bg', 'hs', 'hg', 'beam'];
const NUMBERS = ['si', 'hi', 'lamps', 'stars', 'city', 'sunA', 'moonA'];

const hex = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
function mixHex(a, b, f) {
  const x = hex(a), y = hex(b);
  return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * f).toString(16).padStart(2, '0')).join('');
}

// Sun crosses the window 6:00-20:00, moon 19:00-07:00 (window spans x -1.4..0.5, y 1.5..2.5).
function arc(t, duration) {
  const p = Math.min(1, Math.max(0, t / duration));
  return [0.5 - p * 1.9, 1.5 + Math.sin(p * Math.PI) * 0.95];
}

export function sampleTime(h) {
  h = ((h % 24) + 24) % 24;
  let i = 0;
  while (KEYFRAMES[i + 1].h <= h) i++;
  const a = KEYFRAMES[i], b = KEYFRAMES[i + 1];
  let f = (h - a.h) / (b.h - a.h);
  f = f * f * (3 - 2 * f);
  const t = { pos: a.pos.map((v, j) => v + (b.pos[j] - v) * f) };
  for (const k of COLORS) t[k] = mixHex(a[k], b[k], f);
  for (const k of NUMBERS) t[k] = a[k] + (b[k] - a[k]) * f;
  t.sunDisc = arc(h - 6, 14);
  t.moonDisc = arc((h - 19 + 24) % 24, 12);
  return t;
}

export function routineAt(h) {
  if (h >= 6 && h < 12) return 'morning';
  if (h >= 12 && h < 18) return 'afternoon';
  if (h >= 18 && h < 23) return 'evening';
  return 'night';
}

export function formatHour(h) {
  const minutes = Math.floor(h * 60 + 1e-6); // h = hours + minutes/60 loses a hair to rounding; don't show a minute early
  return String(Math.floor(minutes / 60)).padStart(2, '0') + ':' + String(minutes % 60).padStart(2, '0');
}

export function parseHourParam(s) {
  if (s === null || s.trim() === '') return null;
  const n = Number(s);
  return Number.isFinite(n) && n >= 0 && n < 24 ? n : null;
}

export const localHour = (d = new Date()) => d.getHours() + d.getMinutes() / 60;

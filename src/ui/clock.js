import { formatHour, localHour } from '../lib/time.js';

// The clock badge: shows the room's hour; opening it lets the visitor scrub through the day. Now = follow real time.
export function initClock(onChange, initial = null) {
  const badge = document.getElementById('clock');
  const pop = document.getElementById('clock-pop');
  const range = pop.querySelector('input');
  const now = pop.querySelector('button');
  let hour = initial;

  const show = () => {
    const text = formatHour(hour ?? localHour());
    badge.textContent = text;
    badge.setAttribute('aria-label', `Room time ${text}. Change the time of day`);
    range.setAttribute('aria-valuetext', text); // read "18:30", not "18.5"
  };
  const toggle = open => {
    pop.hidden = !open;
    badge.setAttribute('aria-expanded', String(open));
    if (open) { range.value = hour ?? localHour(); range.focus(); }
  };

  badge.hidden = false;
  show();
  setInterval(() => { if (hour === null) show(); }, 30000);
  badge.addEventListener('click', () => toggle(pop.hidden));
  range.addEventListener('input', () => { hour = Number(range.value); show(); onChange(hour); });
  now.addEventListener('click', () => { hour = null; show(); onChange(null); toggle(false); badge.focus(); });
  pop.addEventListener('keydown', e => { if (e.key === 'Escape') { toggle(false); badge.focus(); } });
}

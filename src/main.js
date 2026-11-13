import './style.css';
import { initPanels } from './ui/panels.js';
import { initTerminal } from './ui/terminal.js';
import { initGames } from './ui/games.js';
import { initClock } from './ui/clock.js';
import { parseHourParam } from './lib/time.js';
import { parseRoute } from './lib/route.js';

const data = JSON.parse(document.getElementById('data').textContent);
const params = new URLSearchParams(location.search);
if (params.has('snapshot')) document.body.classList.add('snapshot');

// "Click around the room" shows on a first visit until the first click.
const hint = document.getElementById('hint');
const remembered = key => { try { return localStorage.getItem(key) === '1'; } catch { return false; } };
function hideHint() {
  if (hint.hidden) return;
  hint.hidden = true;
  try { localStorage.setItem('hintSeen', '1'); } catch {}
}

let scene = null;
const panels = initPanels({
  onOpen: route => { hideHint(); return scene?.flyTo(route); },
  onClose: () => scene?.flyHome(),
});
initTerminal(document.getElementById('panel-tech'),
  { about: data.about, projects: data.projects.tech, favorites: data.favorites.tech }, { exit: panels.home });
initGames(document.getElementById('panel-games'));

// The room loads after the text. Until it runs (or if it never does) the still image stays.
const stage = document.getElementById('stage');
const hour = parseHourParam(params.get('h'));
import('./scene/index.js')
  .then(m => m.start(stage, data, {
    hour,
    reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
    onPick: route => panels.navigate(route),
  }))
  .then(s => {
    scene = s;
    stage.classList.add('live');
    initClock(h => s.setHour(h), hour);
    if (!remembered('hintSeen')) hint.hidden = false;
    const route = parseRoute(location.hash);
    if (route) s.flyTo(route); // arrived on a shared link: the panel is already open
  })
  .catch(err => console.warn('Room scene unavailable, showing the still image', err));

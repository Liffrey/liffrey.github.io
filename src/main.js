import './style.css';
import { initPanels } from './ui/panels.js';
import { initTerminal } from './ui/terminal.js';
import { initGames } from './ui/games.js';
import { parseHourParam } from './lib/time.js';

const data = JSON.parse(document.getElementById('data').textContent);
const params = new URLSearchParams(location.search);
if (params.has('snapshot')) document.body.classList.add('snapshot');

const panels = initPanels();
initTerminal(document.getElementById('panel-tech'),
  { about: data.about, projects: data.projects.tech, favorites: data.favorites.tech }, { exit: panels.home });
initGames(document.getElementById('panel-games'));

// The room loads after the text. Until it runs (or if it never does) the still image stays.
const stage = document.getElementById('stage');
import('./scene/index.js')
  .then(m => m.start(stage, data, {
    hour: parseHourParam(params.get('h')),
    reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
  }))
  .then(() => stage.classList.add('live'))
  .catch(err => console.warn('Room scene unavailable, showing the still image', err));

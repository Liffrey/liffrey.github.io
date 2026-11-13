import './style.css';
import { initPanels } from './ui/panels.js';
import { initTerminal } from './ui/terminal.js';
import { initGames } from './ui/games.js';

const data = JSON.parse(document.getElementById('data').textContent);
const panels = initPanels();
initTerminal(document.getElementById('panel-tech'),
  { about: data.about, projects: data.projects.tech, favorites: data.favorites.tech }, { exit: panels.home });
initGames(document.getElementById('panel-games'));

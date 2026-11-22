// Builds the page's HTML from content at build time, so every word is in the page before any script runs.
import { runCommand } from './terminal.js';
import { posterSVG } from './posters.js';

export const CALENDAR_COLORS = ['#2a2440', '#2f5a3a', '#3f8a4a', '#5fc05a', '#a0ff8a'];

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = s => String(s).replace(/[&<>"']/g, c => ESC[c]);

const paragraphs = text => text.split('\n').filter(Boolean).map(t => `<p>${esc(t)}</p>`).join('');
const meta = (...parts) => {
  const m = parts.filter(Boolean).join(' · ');
  return m ? `<p class="meta">${esc(m)}</p>` : '';
};
const link = (url, text) => (url ? `<a href="${esc(url)}" target="_blank" rel="noopener">${esc(text)}</a>` : esc(text));

function projectList(projects) {
  if (!projects.length) return '<p class="empty">No projects yet.</p>';
  const items = projects.map(p => `<li class="project"><h4>${link(p.url, p.title)}</h4>` +
    `${p.description ? `<p>${esc(p.description)}</p>` : ''}${meta(p.language, p.updated)}</li>`);
  return `<ul class="projects">${items.join('')}</ul>`;
}

const panel = (route, title, body) =>
  `<dialog id="panel-${route}" class="panel panel-${route}" aria-labelledby="h-${route}">` +
  `<header><h2 id="h-${route}">${title}</h2><button type="button" class="back">Back</button></header>${body}</dialog>`;

export const termLine = l => (typeof l === 'string'
  ? `<div>${esc(l)}</div>`
  : `<button type="button" class="term-link" data-cmd="${esc(l.cmd)}">${esc(l.text)}</button>`);

export const termData = d => ({ about: d.site.about, projects: d.projects.tech, favorites: d.favorites.tech });

function calendarSVG(grid) {
  const cells = grid.flatMap((week, x) => week.map((level, y) =>
    `<rect x="${x + 0.1}" y="${y + 0.1}" width="0.8" height="0.8" fill="${CALENDAR_COLORS[level]}"/>`));
  return `<svg viewBox="0 0 ${grid.length} 7" shape-rendering="crispEdges" aria-hidden="true">${cells.join('')}</svg>`;
}

function techPanel(d) {
  const shown = ['whoami', 'ls', 'favorites'].flatMap(cmd =>
    [`<div class="prompt">$ ${cmd}</div>`, ...runCommand(cmd, termData(d)).lines.map(termLine)]);
  shown.push(termLine({ text: "Type 'help' for commands.", cmd: 'help' }));
  return panel('tech', 'Tech',
    `<div class="term"><div class="term-out" aria-live="polite">${shown.join('')}</div>` +
    `<form class="term-in"><label><span aria-hidden="true">$</span> <input name="cmd" autocomplete="off" spellcheck="false" aria-label="Terminal command"></label></form></div>` +
    `<figure class="calendar">${calendarSVG(d.calendar.grid)}<figcaption>${d.calendar.total} contribution${d.calendar.total === 1 ? '' : 's'} in the last 13 weeks</figcaption></figure>` +
    `<details class="plain"><summary>Projects as a list</summary>${projectList(d.projects.tech)}</details>`);
}

function gamesPanel(d) {
  let n = 0;
  const details = [];
  const row = (items, empty, detail) => {
    if (!items.length) return `<p class="empty">${empty}</p>`;
    const buttons = items.map(it => {
      const id = `gd-${n}`;
      details.push(`<article class="game-detail" id="${id}"${n++ ? ' hidden' : ''}>${detail(it)}</article>`);
      return `<li><button type="button" class="cart" data-detail="${id}">${esc(it.title)}</button></li>`;
    });
    return `<ul class="row">${buttons.join('')}</ul>`;
  };
  const projects = row(d.projects.games, 'No projects yet.', p =>
    `<h4>${esc(p.title)}</h4>${p.description ? `<p>${esc(p.description)}</p>` : ''}${meta(p.language, p.updated)}` +
    (p.url ? `<p>${link(p.url, 'View on GitHub')}</p>` : ''));
  const favorites = row(d.favorites.games, 'No favorites yet.', f =>
    `<h4>${esc(f.title)}</h4>${meta(String(f.year))}<p>${esc(f.why)}</p>`);
  return panel('games', 'Games',
    `<div class="console"><div class="shelf"><h3>Projects</h3>${projects}<h3>Favorites</h3>${favorites}</div>` +
    `<div class="details">${details.join('')}</div></div>`);
}

function cinemaPanel(d) {
  const films = d.favorites.films.length
    ? `<ol class="films">${d.favorites.films.map(f =>
      `<li>${posterSVG(f.poster)}<div><h4>${esc(f.title)}</h4>${meta(String(f.year))}<p>${esc(f.why)}</p></div></li>`).join('')}</ol>`
    : '<p class="empty">No favorites yet.</p>';
  return panel('cinema', 'Cinema', `<h3>Favorite films</h3>${films}<h3>Projects</h3>${projectList(d.projects.cinema)}`);
}

const booksPanel = ({ favorites: { books } }) => panel('books', 'Books', '<h3>Novels I recommend</h3>' + (books.length
  ? `<ol class="books">${books.map(b => `<li><h4>${esc(b.title)}</h4>${meta(b.author, String(b.year))}${b.why ? `<p>${esc(b.why)}</p>` : ''}</li>`).join('')}</ol>`
  : '<p class="empty">No books yet.</p>'));

function cvPanel({ site }) {
  const pdf = site.cv.pdf
    ? `<p><a href="/${esc(site.cv.pdf)}" download>Download CV (PDF)</a></p>`
    : '<p class="empty">PDF coming soon.</p>';
  return panel('cv', 'CV', paragraphs(site.cv.summary) + pdf);
}

const contactPanel = ({ site }) => panel('contact', 'Contact',
  `<ul class="contact">${site.contact.map(c => `<li><a href="${esc(c.url)}" rel="me noopener" target="_blank">${esc(c.label)}</a></li>`).join('')}</ul>`);

function head({ name, tagline, github }) {
  const url = `https://${github.toLowerCase()}.github.io`;
  return `<title>${esc(name)}</title>` +
    `<meta name="description" content="${esc(tagline)}">` +
    `<meta property="og:type" content="website"><meta property="og:url" content="${url}/">` +
    `<meta property="og:title" content="${esc(name)}"><meta property="og:description" content="${esc(tagline)}">` +
    `<meta property="og:image" content="${url}/room.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">` +
    '<meta name="twitter:card" content="summary_large_image">';
}

export function injectContent(html, d) {
  const json = JSON.stringify({ about: d.site.about, favorites: d.favorites, projects: d.projects, calendar: d.calendar })
    .replace(/</g, '\\u003c');
  const parts = {
    head: head(d.site),
    intro: `<h1>${esc(d.site.name)}</h1><p class="tagline">${esc(d.site.tagline)}</p>`,
    panels: [gamesPanel(d), techPanel(d), cinemaPanel(d), booksPanel(d), cvPanel(d), contactPanel(d)].join('\n'),
    data: `<script type="application/json" id="data">${json}</script>`,
  };
  // A replacer function, because a replacement string would expand "$&" found in content.
  return html.replace(/<!--(head|intro|panels|data)-->/g, (_, key) => parts[key]);
}

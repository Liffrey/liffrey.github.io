import { MOTIFS } from './posters.js';

const CORNERS = ['games', 'tech', 'cinema'];
const isText = v => typeof v === 'string';
const isFilled = v => isText(v) && v.trim() !== '';
const isObject = v => v !== null && typeof v === 'object' && !Array.isArray(v);

// Returns a list of problems; an empty list means the content is valid.
export function validateContent({ site, favorites, extra }) {
  const errors = [];
  const check = (file, ok, path, rule) => { if (!ok) errors.push(`${file}: ${path} ${rule}`); };

  const s = (ok, path, rule) => check('site.json', ok, path, rule);
  site = isObject(site) ? site : {};
  for (const k of ['name', 'tagline', 'about', 'github']) s(isFilled(site[k]), k, 'must be non-empty text');
  if (Array.isArray(site.contact)) {
    site.contact.forEach((c, i) => {
      s(isFilled(c?.label), `contact[${i}].label`, 'must be non-empty text');
      s(isText(c?.url) && /^(https:\/\/|mailto:)/.test(c.url), `contact[${i}].url`, 'must start with https:// or mailto:');
    });
  } else s(false, 'contact', 'must be a list');
  s(isText(site.cv?.summary), 'cv.summary', 'must be text');
  s(isText(site.cv?.pdf), 'cv.pdf', 'must be text ("" if there is no PDF yet)');

  const f = (ok, path, rule) => check('favorites.json', ok, path, rule);
  favorites = isObject(favorites) ? favorites : {};
  for (const list of ['games', 'films', 'tech', 'books']) {
    const items = favorites[list];
    if (!Array.isArray(items) || items.length > 5) { f(false, list, 'must be a list of at most 5 items'); continue; }
    items.forEach((it, i) => {
      const p = `${list}[${i}]`;
      f(isFilled(it?.title), `${p}.title`, 'must be non-empty text');
      f(Number.isInteger(it?.year), `${p}.year`, 'must be a whole number');
      f(isText(it?.why), `${p}.why`, 'must be text');
      if (list === 'books') f(isFilled(it?.author), `${p}.author`, 'must be non-empty text');
      if (list !== 'films') return;
      const c = it?.poster?.colors;
      f(Array.isArray(c) && c.length === 2 && c.every(x => /^#[0-9a-f]{6}$/i.test(x)), `${p}.poster.colors`, 'must be two colors like "#7a2e2e"');
      f(MOTIFS.includes(it?.poster?.motif), `${p}.poster.motif`, `must be one of ${MOTIFS.join(', ')}`);
    });
  }

  const e = (ok, path, rule) => check('projects.extra.json', ok, path, rule);
  extra = isObject(extra) ? extra : {};
  if (Array.isArray(extra.projects)) {
    extra.projects.forEach((p, i) => {
      e(isFilled(p?.name), `projects[${i}].name`, 'must be non-empty text');
      e(isFilled(p?.title), `projects[${i}].title`, 'must be non-empty text');
      e(CORNERS.includes(p?.corner), `projects[${i}].corner`, `must be one of ${CORNERS.join(', ')}`);
      e(isText(p?.description), `projects[${i}].description`, 'must be text');
      e(p?.url === '' || (isText(p?.url) && p.url.startsWith('https://')), `projects[${i}].url`, 'must be "" or start with https://');
    });
  } else e(false, 'projects', 'must be a list');
  if (isObject(extra.overrides)) {
    for (const [name, o] of Object.entries(extra.overrides)) {
      e(isObject(o), `overrides.${name}`, 'must be an object');
      for (const k of ['title', 'description']) if (o?.[k] !== undefined) e(isText(o[k]), `overrides.${name}.${k}`, 'must be text');
    }
  } else e(false, 'overrides', 'must be an object');

  return errors;
}

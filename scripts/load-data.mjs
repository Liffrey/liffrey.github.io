// Reads content/ and GitHub data, checks them, and shapes them for rendering. Runs in Node at build time.
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { validateContent } from '../src/lib/content.js';
import { toProjects } from '../src/lib/projects.js';
import { calendarWeeks } from '../src/lib/calendar.js';

export function loadData({ root = process.cwd(), env = process.env } = {}) {
  const read = f => JSON.parse(readFileSync(join(root, f), 'utf8'));
  const site = read('content/site.json');
  const favorites = read('content/favorites.json');
  const extra = read('content/projects.extra.json');

  const real = join(root, 'data/github.json');
  if (!existsSync(real) && env.CI) throw new Error('data/github.json missing: run scripts/fetch-github.mjs');
  const github = read(existsSync(real) ? 'data/github.json' : 'data/github.sample.json');

  const errors = validateContent({ site, favorites, extra });
  if (typeof site.cv?.pdf === 'string' && site.cv.pdf && !existsSync(join(root, 'public', site.cv.pdf))) {
    errors.push(`site.json: cv.pdf "${site.cv.pdf}" is not in public/`);
  }
  if (errors.length) throw new Error('Content errors:\n' + errors.join('\n'));

  return { site, favorites, extra, projects: toProjects(github.repos, extra), calendar: calendarWeeks(github.days) };
}

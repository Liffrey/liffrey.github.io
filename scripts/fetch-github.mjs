// Fetches public repos and the contribution calendar into data/github.json.
// Any failure exits non-zero so the deploy workflow stops and the live site stays as it was.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { checkRepos } from '../src/lib/projects.js';

const token = process.env.GITHUB_TOKEN;
if (!token) throw new Error('GITHUB_TOKEN is not set');
const { github: login } = JSON.parse(readFileSync('content/site.json', 'utf8'));
const headers = {
  Authorization: `Bearer ${token}`,
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  'User-Agent': 'liffrey-room-build',
};

// shortcut: one page = max 100 repos; paginate past that
const res = await fetch(`https://api.github.com/users/${login}/repos?per_page=100&type=owner`, { headers });
if (!res.ok) throw new Error(`GitHub repos request failed: ${res.status} ${await res.text()}`);
const raw = await res.json();
checkRepos(raw);
const repos = raw.map(({ name, description, html_url, homepage, language, topics, pushed_at }) =>
  ({ name, description, html_url, homepage, language, topics: topics ?? [], pushed_at }));

const query = `query($login: String!) { user(login: $login) { contributionsCollection { contributionCalendar {
  weeks { contributionDays { date contributionCount } } } } } }`;
const gql = await fetch('https://api.github.com/graphql', {
  method: 'POST', headers, body: JSON.stringify({ query, variables: { login } }),
});
if (!gql.ok) throw new Error(`GitHub GraphQL request failed: ${gql.status} ${await gql.text()}`);
const body = await gql.json();
if (body.errors) throw new Error(`GitHub GraphQL errors: ${body.errors.map(e => e.message).join('; ')}`);
const days = body.data.user.contributionsCollection.contributionCalendar.weeks
  .flatMap(w => w.contributionDays)
  .map(d => ({ date: d.date, count: d.contributionCount }));

mkdirSync('data', { recursive: true });
writeFileSync('data/github.json', JSON.stringify({ fetchedAt: new Date().toISOString(), repos, days }, null, 2) + '\n');
console.log(`${repos.length} repos, ${days.length} days`);

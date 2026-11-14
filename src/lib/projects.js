export const CORNERS = ['games', 'tech', 'cinema'];

export function checkRepos(repos) {
  if (!Array.isArray(repos) || repos.length === 0) throw new Error('GitHub returned no repositories');
}

// Repos reach a corner only through a portfolio-<corner> topic; extras are appended in file order.
export function toProjects(repos, extra) {
  const out = { games: [], tech: [], cinema: [] };
  const pushed = r => r.pushed_at ?? ''; // null for a repo that was never pushed
  const sorted = [...repos].sort((a, b) => pushed(b).localeCompare(pushed(a)));
  for (const r of sorted) {
    const o = extra.overrides[r.name] ?? {};
    const project = {
      name: r.name,
      title: o.title ?? r.name,
      description: o.description ?? r.description ?? '',
      url: r.html_url,
      language: r.language ?? '',
      updated: pushed(r).slice(0, 10),
    };
    for (const c of CORNERS) if (r.topics.includes(`portfolio-${c}`)) out[c].push({ ...project });
  }
  for (const p of extra.projects) {
    out[p.corner].push({ name: p.name, title: p.title, description: p.description, url: p.url, language: '', updated: '' });
  }
  return out;
}

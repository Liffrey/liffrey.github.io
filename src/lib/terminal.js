// The Tech view's terminal. A line is a string, or { text, cmd } when clicking it should run cmd.
export const COMMANDS = ['help', 'ls', 'cat', 'open', 'whoami', 'favorites', 'clear', 'exit'];
const TAKES_PROJECT = ['cat', 'open'];
const HELP = [
  ['help', 'show this help'],
  ['ls', 'list projects'],
  ['cat <project>', 'show a project'],
  ['open <project>', 'open a project on GitHub'],
  ['whoami', 'about me'],
  ['favorites', 'tech I follow'],
  ['clear', 'clear the screen'],
  ['exit', 'back to the room'],
];

export function runCommand(input, data) {
  const [word, ...args] = input.trim().split(/\s+/);
  const cmd = word.toLowerCase();
  const arg = args.join(' ');
  const project = data.projects.find(p => p.name.toLowerCase() === arg.toLowerCase());
  const say = (...lines) => ({ lines });

  switch (cmd) {
    case '': return say();
    case 'help':
      return { lines: HELP.map(([c, d]) => {
        const text = c.padEnd(16) + d;
        return c.includes('<') ? text : { text, cmd: c };
      }) };
    case 'ls':
      return data.projects.length ? { lines: data.projects.map(p => ({ text: p.name, cmd: `cat ${p.name}` })) } : say('no projects yet');
    case 'cat': {
      if (!arg) return say('usage: cat <project>');
      if (!project) return say(`cat: ${arg}: no such project`);
      const meta = [project.language, project.updated].filter(Boolean).join(' · ');
      const lines = [project.title, project.description, meta].filter(Boolean);
      if (project.url) lines.push({ text: `open ${project.name}`, cmd: `open ${project.name}` });
      return { lines };
    }
    case 'open':
      if (!arg) return say('usage: open <project>');
      if (!project) return say(`open: ${arg}: no such project`);
      if (!project.url) return say(`open: ${arg}: no link`);
      return { lines: [`opening ${project.url}`], open: project.url };
    case 'whoami': return { lines: data.about.split('\n') };
    case 'favorites':
      return data.favorites.length
        ? { lines: data.favorites.map(f => `${f.title} (${f.year}) — ${f.why}`) }
        : say('no favorites yet');
    case 'clear': return { lines: [], clear: true };
    case 'exit': return { lines: [], exit: true };
    default: return say(`command not found: ${word}. Type 'help'.`);
  }
}

function commonPrefix(words) {
  let p = words[0];
  for (const w of words) while (!w.startsWith(p)) p = p.slice(0, -1);
  return p;
}

export function complete(input, data) {
  const space = input.indexOf(' ');
  if (space === -1) {
    const hits = COMMANDS.filter(c => c.startsWith(input.toLowerCase()));
    if (hits.length === 1) return hits[0] + (TAKES_PROJECT.includes(hits[0]) ? ' ' : '');
    const p = hits.length ? commonPrefix(hits) : '';
    return p.length > input.length ? p : input;
  }
  if (!TAKES_PROJECT.includes(input.slice(0, space).toLowerCase())) return input;
  const rest = input.slice(space + 1);
  const names = data.projects.map(p => p.name).filter(n => n.toLowerCase().startsWith(rest.toLowerCase()));
  if (!names.length) return input;
  const p = names.length === 1 ? names[0] : commonPrefix(names);
  return p.length > rest.length ? input.slice(0, space + 1) + p : input;
}

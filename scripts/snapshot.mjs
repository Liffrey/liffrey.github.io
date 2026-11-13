// Screenshots the built site with headless Edge (SwiftShader WebGL).
// node scripts/snapshot.mjs --out <file> [--url "?h=20&snapshot"] [--size 1200,630] [--no-webgl]
// --url is relative to the site root. In Git Bash prefix the command with MSYS_NO_PATHCONV=1,
// or it rewrites "/…" and "#/…" into Windows paths.
import { parseArgs, promisify } from 'node:util';
import { execFile } from 'node:child_process';
import { resolve } from 'node:path';
import { rmSync } from 'node:fs';
import { preview } from 'vite';

const { values: o } = parseArgs({ options: {
  out: { type: 'string' }, url: { type: 'string', default: '' },
  size: { type: 'string', default: '1200,630' }, 'no-webgl': { type: 'boolean', default: false },
} });
if (!o.out) throw new Error('--out is required');

const server = await preview({ preview: { port: 4173, strictPort: false }, logLevel: 'error' });
const page = new URL(o.url, server.resolvedUrls.local[0]).href;
const profile = resolve('node_modules/.cache/edge-profile');
rmSync(profile, { recursive: true, force: true }); // a fresh profile, so no page comes from an old cache
const edge = process.env.EDGE ?? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
try {
  // async: a sync call would block this process, and with it the preview server Edge is loading from
  await promisify(execFile)(edge, [
    // own profile, or Edge hands the job to an already running browser and never returns
    '--headless=new', `--user-data-dir=${profile}`, '--no-first-run',
    '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--hide-scrollbars',
    `--window-size=${o.size}`, '--virtual-time-budget=8000', `--screenshot=${resolve(o.out)}`,
    ...(o['no-webgl'] ? ['--disable-3d-apis'] : []), page,
  ]);
} finally {
  await server.close();
}
console.log(`saved ${resolve(o.out)}`);
process.exit(0); // open sockets from Edge would otherwise keep the preview server alive

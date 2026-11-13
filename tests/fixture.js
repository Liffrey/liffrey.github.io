import { mkdtempSync, cpSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const repoRoot = fileURLToPath(new URL('..', import.meta.url));

// A throwaway copy of content/ and the sample data, so tests never see a local data/github.json.
export function fixtureRoot() {
  const root = mkdtempSync(join(tmpdir(), 'room-'));
  cpSync(join(repoRoot, 'content'), join(root, 'content'), { recursive: true });
  mkdirSync(join(root, 'data'));
  cpSync(join(repoRoot, 'data/github.sample.json'), join(root, 'data/github.sample.json'));
  return root;
}

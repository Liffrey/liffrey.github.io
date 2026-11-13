// Fails the build when all JavaScript, three.js included, is over 250 KB gzipped.
import { readdirSync, readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';

const LIMIT = 250 * 1024;
const files = readdirSync('dist/assets').filter(f => f.endsWith('.js'));
const total = files.reduce((sum, f) => sum + gzipSync(readFileSync(`dist/assets/${f}`)).length, 0);
console.log(`JS gzip: ${(total / 1024).toFixed(1)} KB / 250 KB`);
if (total > LIMIT) process.exit(1);

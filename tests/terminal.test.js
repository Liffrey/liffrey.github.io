import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runCommand, complete } from '../src/lib/terminal.js';

const p = (name, more = {}) => ({ name, title: name, description: '', url: `https://github.com/Liffrey/${name}`, language: '', updated: '', ...more });
const data = { about: 'Line one\nLine two', favorites: [{ title: 'Rust', year: 2015, why: 'Fearless.' }],
  projects: [p('wavtoflac', { description: 'Converts audio.', language: 'Python', updated: '2026-10-12' }), p('filetransfer'), p('studyThreeJS')] };

test('ls lists clickable projects', () =>
  assert.deepEqual(runCommand('ls', data).lines[0], { text: 'wavtoflac', cmd: 'cat wavtoflac' }));
test('cat shows details and skips empty fields', () => {
  assert.deepEqual(runCommand('cat wavtoflac', data).lines, ['wavtoflac', 'Converts audio.', 'Python · 2026-10-12', { text: 'open wavtoflac', cmd: 'open wavtoflac' }]);
  assert.deepEqual(runCommand('cat filetransfer', data).lines, ['filetransfer', { text: 'open filetransfer', cmd: 'open filetransfer' }]);
});
test('names and commands ignore case and spaces', () =>
  assert.equal(runCommand('  CAT WAVTOFLAC ', data).lines[0], 'wavtoflac'));
test('unknown project and missing argument', () => {
  assert.deepEqual(runCommand('cat nope', data).lines, ['cat: nope: no such project']);
  assert.deepEqual(runCommand('cat', data).lines, ['usage: cat <project>']);
});
test('open returns the url', () =>
  assert.equal(runCommand('open wavtoflac', data).open, 'https://github.com/Liffrey/wavtoflac'));
test('whoami, favorites, clear, exit', () => {
  assert.deepEqual(runCommand('whoami', data).lines, ['Line one', 'Line two']);
  assert.deepEqual(runCommand('favorites', data).lines, ['Rust (2015) — Fearless.']);
  assert.equal(runCommand('clear', data).clear, true);
  assert.equal(runCommand('exit', data).exit, true);
});
test('unknown command', () =>
  assert.deepEqual(runCommand('rm -rf /', data).lines, ["command not found: rm. Type 'help'."]));
test('empty project list', () =>
  assert.deepEqual(runCommand('ls', { ...data, projects: [] }).lines, ['no projects yet']));
test('tab completion', () => {
  assert.equal(complete('wh', data), 'whoami');
  assert.equal(complete('ca', data), 'cat ');
  assert.equal(complete('cat wav', data), 'cat wavtoflac');
  assert.equal(complete('cat ', data), 'cat ');      // three matches, no common prefix
  assert.equal(complete('zz', data), 'zz');
});

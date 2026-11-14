import { test } from 'node:test';
import assert from 'node:assert/strict';

// A minimal browser stand-in: history entries that fire hashchange only when the hash really changes.
function fakeBrowser() {
  const listeners = {};
  const entries = [{ state: null, hash: '' }];
  let index = 0;
  const location = { pathname: '/', search: '', hash: '' };
  const go = i => {
    const before = location.hash;
    index = i;
    location.hash = entries[i].hash;
    if (location.hash !== before) (listeners.hashchange ?? []).forEach(fn => fn());
  };
  const history = {
    get state() { return entries[index].state; },
    pushState(state, _, url) { entries.splice(index + 1, Infinity, { state, hash: url.startsWith('#') ? url : '' }); index++; location.hash = entries[index].hash; },
    replaceState(state, _, url) { entries[index] = { state, hash: url.startsWith('#') ? url : '' }; location.hash = entries[index].hash; },
    back() { if (index > 0) go(index - 1); },
  };
  const dialogs = {};
  const dialog = id => (dialogs[id] ??= {
    id, open: false, handlers: {},
    showModal() { this.open = true; },
    close() { if (!this.open) return; this.open = false; (this.handlers.close ?? []).forEach(fn => fn()); },
    addEventListener(type, fn) { (this.handlers[type] ??= []).push(fn); },
    querySelector: () => ({ addEventListener() {} }),
  });
  const ids = ['games', 'tech', 'cinema', 'cv', 'contact'].map(r => `panel-${r}`);
  Object.assign(globalThis, {
    location, history,
    addEventListener: (type, fn) => (listeners[type] ??= []).push(fn),
    document: {
      getElementById: dialog,
      querySelectorAll: sel => (sel === 'dialog.panel' ? ids.map(dialog) : []),
    },
  });
  return { dialog };
}

const tick = () => new Promise(r => setTimeout(r, 0));

test('a double click during the camera flight still lets the visitor go back to the room', async () => {
  const { dialog } = fakeBrowser();
  const { initPanels } = await import(`../src/ui/panels.js?double-click`);
  let land;
  let closed = 0;
  const panels = initPanels({ onOpen: () => new Promise(r => { land = r; }), onClose: () => { closed++; } });
  panels.navigate('tech');
  panels.navigate('tech'); // second click while the camera is still flying
  land();
  await tick();
  assert.equal(dialog('panel-tech').open, true);
  dialog('panel-tech').close(); // Esc
  await tick();
  assert.equal(location.hash, '');
  assert.equal(dialog('panel-tech').open, false);
  assert.ok(closed > 0, 'the camera is told to fly home');
});

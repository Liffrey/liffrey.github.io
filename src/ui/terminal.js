import { runCommand, complete } from '../lib/terminal.js';
import { termLine, esc } from '../lib/render.js';

export function initTerminal(dialog, data, { exit }) {
  const out = dialog.querySelector('.term-out');
  const form = dialog.querySelector('.term-in');
  const input = form.elements.cmd;
  const past = [];
  let pos = 0;

  function run(cmd) {
    const r = runCommand(cmd, data);
    if (r.clear) out.textContent = '';
    else out.insertAdjacentHTML('beforeend', [`<div class="prompt">$ ${esc(cmd)}</div>`, ...r.lines.map(termLine)].join(''));
    out.scrollTop = out.scrollHeight;
    if (r.open) window.open(r.open, '_blank', 'noopener');
    if (r.exit) exit();
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    const cmd = input.value;
    input.value = '';
    if (cmd.trim()) past.push(cmd);
    pos = past.length;
    run(cmd);
  });
  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp' && pos > 0) { e.preventDefault(); input.value = past[--pos]; }
    else if (e.key === 'ArrowDown' && pos < past.length) { e.preventDefault(); input.value = past[++pos] ?? ''; }
    else if (e.key === 'Tab' && !e.shiftKey && input.value) {
      // only take Tab when it completes something, so keyboard users can still tab out
      const done = complete(input.value, data);
      if (done !== input.value) { e.preventDefault(); input.value = done; }
    }
  });
  out.addEventListener('click', e => {
    const link = e.target.closest('.term-link');
    if (link) run(link.dataset.cmd);
  });
  // focus the prompt on open, but not on touch screens where it would pop up the keyboard
  dialog.addEventListener('toggle', e => {
    if (e.newState === 'open' && matchMedia('(pointer: fine)').matches) input.focus();
  });
}

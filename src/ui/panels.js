import { parseRoute } from '../lib/route.js';

// Each view is a <dialog> with an address (#/tech …). showModal keeps focus inside and Esc closes it.
export function initPanels({ onOpen = () => {}, onClose = () => {} } = {}) {
  const dialogOf = route => document.getElementById(`panel-${route}`);
  let open = null; // route of the open dialog
  let seq = 0;

  async function handle() {
    const route = parseRoute(location.hash);
    if (route === open) return;
    const mine = ++seq;
    if (open) { const d = dialogOf(open); open = null; d.close(); }
    if (!route) return onClose();
    await onOpen(route);
    if (mine !== seq) return; // the visitor went somewhere else during the camera flight
    open = route;
    dialogOf(route).showModal();
  }

  function navigate(route) {
    history.pushState({ inApp: true }, '', '#/' + route);
    handle();
  }

  // Back to the room. A visitor who arrived on a shared link has no in-app entry to go back to.
  function home() {
    if (history.state?.inApp) history.back();
    else { history.replaceState(null, '', location.pathname + location.search); handle(); }
  }

  for (const d of document.querySelectorAll('dialog.panel')) {
    d.querySelector('.back').addEventListener('click', () => d.close());
    d.addEventListener('close', () => { if (open && d.id === `panel-${open}`) home(); });
  }
  for (const a of document.querySelectorAll('.menu a')) {
    a.addEventListener('click', e => {
      const route = parseRoute(a.getAttribute('href'));
      if (route) { e.preventDefault(); navigate(route); }
    });
  }
  addEventListener('hashchange', handle);
  handle();
  return { navigate, home };
}

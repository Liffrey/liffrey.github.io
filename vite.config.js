import { defineConfig } from 'vite';
import { loadData, isWatchedFile } from './scripts/load-data.mjs';
import { injectContent } from './src/lib/render.js';

// Fills index.html with the content at build time; in dev, edits to content/ or data/ reload the page.
const content = {
  name: 'content',
  transformIndexHtml: html => injectContent(html, loadData()),
  configureServer(server) {
    server.watcher.add(['content', 'data']);
    server.watcher.on('change', file => {
      if (isWatchedFile(file)) server.ws.send({ type: 'full-reload' });
    });
  },
};

export default defineConfig({ plugins: [content] });

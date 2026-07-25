// Injects server-rendered markup into dist/index.html at build time.
//
// Runs after both Vite builds: the client build produces dist/index.html with
// hashed asset tags, and the SSR build produces .prerender/entry-server.js.
// The SSR bundle is emitted outside dist/ so it is never publicly served.

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const htmlPath = path.join(root, 'dist', 'index.html');
const entryPath = path.join(root, '.prerender', 'entry-server.js');
const PLACEHOLDER = '<div id="root"></div>';

function fail(message) {
  console.error(`[prerender] ${message}`);
  process.exit(1);
}

if (!fs.existsSync(htmlPath)) fail(`missing ${htmlPath} — run the client build first`);
if (!fs.existsSync(entryPath)) fail(`missing ${entryPath} — run the SSR build first`);

const template = fs.readFileSync(htmlPath, 'utf-8');

if (!template.includes(PLACEHOLDER)) {
  // Bail loudly rather than shipping an un-prerendered page that silently
  // undoes the SEO benefit this whole step exists for.
  fail(`could not find ${PLACEHOLDER} in dist/index.html — nothing was prerendered`);
}

const { render } = await import(pathToFileURL(entryPath).href);

let markup;
try {
  markup = render();
} catch (err) {
  console.error('[prerender] render() threw — a component likely touched a browser API during render');
  throw err;
}

if (!markup || !markup.trim()) fail('render() returned empty markup');

fs.writeFileSync(htmlPath, template.replace(PLACEHOLDER, `<div id="root">${markup}</div>`));

console.log(`[prerender] injected ${markup.length.toLocaleString()} bytes into dist/index.html`);

/**
 * Writes static HTML for every page after `vite build`, so search engines and
 * link previews get full content, titles and structured data without running
 * JavaScript. Also generates sitemap.xml and robots.txt.
 */
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(root, 'dist');
const serverDir = path.join(distDir, '.server');

const template = await readFile(path.join(distDir, 'index.html'), 'utf8');
const { render, PRERENDER_PAGES, buildSitemap, buildRobotsTxt, SITE_CONFIG_WARNINGS } = await import(
  pathToFileURL(path.join(serverDir, 'entry-server.js')).href
);

for (const { url, file } of PRERENDER_PAGES) {
  const { html, head } = await render(url);
  const page = template.replace('<!--app-head-->', head).replace('<!--app-html-->', html);
  const outFile = path.join(distDir, file);
  await mkdir(path.dirname(outFile), { recursive: true });
  await writeFile(outFile, page);
  console.log(`  prerendered ${url.padEnd(10)} → dist/${file}`);
}

await writeFile(path.join(distDir, 'sitemap.xml'), buildSitemap());
await writeFile(path.join(distDir, 'robots.txt'), buildRobotsTxt());
await rm(serverDir, { recursive: true, force: true });
console.log('  wrote dist/sitemap.xml and dist/robots.txt');

for (const warning of SITE_CONFIG_WARNINGS) console.warn(`\n⚠ ${warning} See .env.example.`);

/**
 * Writes static HTML for every page after `vite build`, so search engines and
 * link previews get full content, titles and structured data without running
 * JavaScript. Also generates sitemap.xml and robots.txt, and tells the service
 * worker which files to save for offline use.
 */
import { createHash } from 'node:crypto';
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
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

await writeServiceWorker();

/**
 * Fills in the service worker's list of pages and files to save for offline
 * use, plus a version that changes whenever any of them change, so browsers
 * install the new release and drop the old copy.
 */
async function writeServiceWorker() {
  const swFile = path.join(distDir, 'sw.js');
  const placeholder = "const BUILD = { version: 'dev', pages: {}, files: [] };";
  const source = await readFile(swFile, 'utf8');
  if (!source.includes(placeholder)) throw new Error('dist/sw.js: build placeholder not found');

  // Only what the installed app needs. Social images, sitemap and robots.txt are for other sites.
  const skip = new Set(['sw.js', 'sitemap.xml', 'robots.txt', 'og-image.png']);
  const entries = await readdir(distDir, { recursive: true, withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile())
    .map((entry) => path.relative(distDir, path.join(entry.parentPath, entry.name)).split(path.sep).join('/'))
    .filter((file) => !skip.has(file) && !file.endsWith('.html') && !file.startsWith('.'))
    .map((file) => `/${file}`)
    .sort();
  const pages = Object.fromEntries(PRERENDER_PAGES.map(({ url, file }) => [url, `/${file}`]));

  const hash = createHash('sha256').update(source);
  for (const file of [...Object.values(pages), ...files].sort()) {
    hash.update(file);
    hash.update(await readFile(path.join(distDir, file)));
  }
  const build = { version: hash.digest('hex').slice(0, 12), pages, files };

  await writeFile(swFile, source.replace(placeholder, `const BUILD = ${JSON.stringify(build)};`));
  console.log(`  wrote dist/sw.js (${Object.keys(pages).length} pages and ${files.length} files for offline use)`);
}

for (const warning of SITE_CONFIG_WARNINGS) console.warn(`\n⚠ ${warning} See .env.example.`);

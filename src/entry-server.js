/**
 * Build-time rendering, used by scripts/prerender.mjs to write static HTML
 * for every page so search engines and link previews see full content.
 */
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import App from './App';
import { SITE_CONFIG_WARNINGS } from './constants/site';
import { matchRoute, ROUTES } from './routes';
import { getHeadTags, renderHeadTags } from './seo/head';
import { buildRobotsTxt, buildSitemap } from './seo/sitemap';

export { buildRobotsTxt, buildSitemap, SITE_CONFIG_WARNINGS };

/** Every page to prerender, with the file it is written to inside dist/. */
export const PRERENDER_PAGES = [
  ...ROUTES.map((route) => ({ url: route.path, file: route.path === '/' ? 'index.html' : `${route.path.slice(1)}/index.html` })),
  { url: '/404', file: '404.html' },
];

export async function render(url) {
  const route = matchRoute(new URL(url, 'http://localhost').pathname);
  await route.page.load();
  return {
    html: renderToString(createElement(App, { url })),
    head: renderHeadTags(getHeadTags(route.id)),
  };
}

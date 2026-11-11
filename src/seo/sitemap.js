import { SITE } from '../constants/site';
import { absoluteUrl } from './head';
import { PAGE_META } from './pages';

export function buildSitemap(lastModified = new Date().toISOString().slice(0, 10)) {
  const urls = Object.values(PAGE_META)
    .filter((meta) => meta.path && meta.sitemap)
    .map((meta) => `  <url>\n    <loc>${absoluteUrl(meta.path)}</loc>\n    <lastmod>${lastModified}</lastmod>\n  </url>`);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
}

export function buildRobotsTxt() {
  return `User-agent: *\nAllow: /\n\nSitemap: ${SITE.url}/sitemap.xml\n`;
}

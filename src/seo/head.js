import { SITE } from '../constants/site';
import { FAQ } from '../content/faq';
import { PAGE_META } from './pages';

export const absoluteUrl = (path) => `${SITE.url}${path}`;

function getPageMeta(routeId) {
  return PAGE_META[routeId] ?? PAGE_META.notFound;
}

function getTitle(meta) {
  return meta.path === '/' ? meta.title : `${meta.title} | ${SITE.name}`;
}

function getStructuredData(routeId, meta, title, url) {
  const websiteId = `${SITE.url}/#website`;
  const organizationId = `${SITE.url}/#organization`;
  const graph = [];

  if (routeId === 'home') {
    graph.push(
      {
        '@type': 'Organization',
        '@id': organizationId,
        name: SITE.name,
        url: absoluteUrl('/'),
        logo: absoluteUrl(SITE.logo),
        email: SITE.contactEmail,
      },
      {
        '@type': 'WebSite',
        '@id': websiteId,
        name: SITE.name,
        url: absoluteUrl('/'),
        description: SITE.description,
        inLanguage: SITE.language,
        publisher: { '@id': organizationId },
        potentialAction: {
          '@type': 'SearchAction',
          target: { '@type': 'EntryPoint', urlTemplate: absoluteUrl('/recipes?q={search_term_string}') },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'WebApplication',
        name: SITE.name,
        url: absoluteUrl('/'),
        applicationCategory: 'LifestyleApplication',
        operatingSystem: 'Any',
        browserRequirements: 'Requires JavaScript',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      },
    );
  }

  // The FAQ is published where it is actually shown.
  if (routeId === 'about') {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: FAQ.map(({ question, answer }) => ({
        '@type': 'Question',
        name: question,
        acceptedAnswer: { '@type': 'Answer', text: answer },
      })),
    });
  }

  graph.push({
    '@type': meta.type ?? 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: title,
    description: meta.description,
    isPartOf: { '@id': websiteId },
    inLanguage: SITE.language,
  });

  if (meta.breadcrumb) {
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
        { '@type': 'ListItem', position: 2, name: meta.breadcrumb, item: url },
      ],
    });
  }

  return { '@context': 'https://schema.org', '@graph': graph };
}

/** The <head> tags for a page, as { tag, attrs, content } descriptors. */
export function getHeadTags(routeId) {
  const meta = getPageMeta(routeId);
  const title = getTitle(meta);
  const url = meta.path ? absoluteUrl(meta.path) : null;
  const indexable = !meta.robots?.includes('noindex');
  const image = absoluteUrl(SITE.ogImage);
  const property = (name, content) => ({ tag: 'meta', attrs: { property: name, content } });
  const named = (name, content) => ({ tag: 'meta', attrs: { name, content } });

  const tags = [
    { tag: 'title', content: title },
    named('description', meta.description),
    named('robots', meta.robots ?? 'index, follow, max-image-preview:large'),
    url && { tag: 'link', attrs: { rel: 'canonical', href: url } },
    property('og:type', 'website'),
    property('og:site_name', SITE.name),
    property('og:locale', SITE.locale),
    property('og:title', title),
    property('og:description', meta.description),
    url && property('og:url', url),
    property('og:image', image),
    property('og:image:width', '1200'),
    property('og:image:height', '630'),
    property('og:image:alt', `${SITE.name}: ${SITE.tagline}`),
    named('twitter:card', 'summary_large_image'),
    named('twitter:title', title),
    named('twitter:description', meta.description),
    named('twitter:image', image),
  ];

  if (url && indexable) {
    const data = getStructuredData(routeId, meta, title, url);
    tags.push({ tag: 'script', attrs: { type: 'application/ld+json' }, content: JSON.stringify(data) });
  }
  return tags.filter(Boolean);
}

const escapeHtml = (value) =>
  String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Serialises head tags for prerendered HTML. */
export function renderHeadTags(tags) {
  return tags
    .map(({ tag, attrs = {}, content }) => {
      const attributes = Object.entries(attrs)
        .map(([name, value]) => ` ${name}="${escapeHtml(value)}"`)
        .join('');
      const open = `<${tag}${attributes} data-page-head>`;
      if (tag === 'meta' || tag === 'link') return open;
      const body = tag === 'script' ? content.replace(/</g, '\u003c') : escapeHtml(content);
      return `${open}${body}</${tag}>`;
    })
    .join('\n    ');
}

/** Replaces the page-specific head tags in the browser after navigation. */
export function applyHeadTags(tags) {
  document.head.querySelectorAll('[data-page-head]').forEach((element) => element.remove());
  for (const { tag, attrs = {}, content } of tags) {
    const element = document.createElement(tag);
    for (const [name, value] of Object.entries(attrs)) element.setAttribute(name, value);
    element.setAttribute('data-page-head', '');
    if (content != null) element.textContent = content;
    document.head.append(element);
  }
}

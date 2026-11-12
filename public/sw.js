/*
 * Mise service worker: lets the site be installed as an app and keeps it
 * working without a connection.
 *
 * - Pages: from the network, falling back to the copy saved at install.
 * - App code and icons: saved at install. File names change on every build,
 *   so each release gets a fresh copy and the old one is deleted.
 * - Recipe data from TheMealDB: from the network, falling back to the last
 *   copy seen, so recipes you have opened still work offline.
 * - Recipe photos and fonts: from the cache when there, keeping the latest.
 *
 * Only registered in production builds (see src/utils/pwa.js).
 */

// Filled in by scripts/prerender.mjs at build time.
const BUILD = { version: 'dev', pages: {}, files: [] };

const APP_CACHE = `mise-app-${BUILD.version}`;
const DATA_CACHE = 'mise-data-v1';
const IMAGE_CACHE = 'mise-images-v1';
const FONT_CACHE = 'mise-fonts-v1';
const CURRENT_CACHES = [APP_CACHE, DATA_CACHE, IMAGE_CACHE, FONT_CACHE];

const MAX_DATA_ENTRIES = 500;
const MAX_IMAGE_ENTRIES = 200;

const MEALDB_ORIGIN = 'https://www.themealdb.com';
const FONT_ORIGINS = ['https://fonts.googleapis.com', 'https://fonts.gstatic.com'];
const NOT_FOUND_PAGE = '/404.html';

/** "/recipes/" and "/recipes" are the same page. */
const normalizePath = (pathname) => (pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname);

/**
 * Some static hosts redirect "/about/index.html" to "/about/". A redirected
 * response can't be used to answer a page request, so keep a plain copy.
 */
async function withoutRedirect(response) {
  if (!response.redirected) return response;
  const body = await response.blob();
  return new Response(body, { status: response.status, statusText: response.statusText, headers: response.headers });
}

async function precache() {
  const cache = await caches.open(APP_CACHE);
  const urls = [...new Set([...Object.values(BUILD.pages), ...BUILD.files])];
  await Promise.all(
    urls.map(async (url) => {
      const response = await fetch(url, { cache: 'reload' });
      if (!response.ok) throw new Error(`Could not save ${url} for offline use (${response.status})`);
      await cache.put(url, await withoutRedirect(response));
    }),
  );
}

self.addEventListener('install', (event) => {
  event.waitUntil(precache());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names.filter((name) => name.startsWith('mise-') && !CURRENT_CACHES.includes(name)).map((name) => caches.delete(name)),
      );
      await self.clients.claim();
    })(),
  );
});

/** Removes the oldest entries once a cache grows past `maxEntries`. */
async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  await Promise.all(keys.slice(0, Math.max(0, keys.length - maxEntries)).map((key) => cache.delete(key)));
}

/**
 * Photos and font stylesheets are requested without CORS, which would give an
 * unreadable response that browsers count as several MB of storage. TheMealDB
 * and Google Fonts allow CORS, so ask for a normal response instead.
 */
async function fetchReadable(request) {
  try {
    return await fetch(request.url, { mode: 'cors', credentials: 'omit' });
  } catch {
    return fetch(request);
  }
}

async function handlePage(request) {
  try {
    return await fetch(request);
  } catch (error) {
    const cache = await caches.open(APP_CACHE);
    const page = BUILD.pages[normalizePath(new URL(request.url).pathname)];
    const cached =
      (page && (await cache.match(page, MATCH_OPTIONS))) || (await cache.match(NOT_FOUND_PAGE, MATCH_OPTIONS));
    if (cached) return cached;
    throw error;
  }
}

/*
 * Hosts often answer with "Vary: Origin", and Vite's script and style tags are
 * requested with an Origin header while the saved copies were not, so a strict
 * match would never find them. Each URL only ever has one response here.
 */
const MATCH_OPTIONS = { ignoreVary: true };

async function handleAppFile(request) {
  const cached = await caches.match(request.url, { ...MATCH_OPTIONS, cacheName: APP_CACHE });
  return cached || fetch(request);
}

/**
 * Search and random-recipe results already include every recipe's full
 * details, so the app never looks those recipes up one by one. Offline, the
 * saved recipes page does look them up, so file each one under its lookup
 * address too.
 */
async function saveAsLookups(request, response) {
  const url = new URL(request.url);
  if (url.pathname.endsWith('/lookup.php')) return;
  const data = await response.json().catch(() => null);
  const meals = Array.isArray(data?.meals) ? data.meals.filter((meal) => meal?.idMeal && meal.strInstructions) : [];
  if (meals.length === 0) return;

  const cache = await caches.open(DATA_CACHE);
  const lookupPath = url.pathname.replace(/[^/]+$/, 'lookup.php');
  await Promise.all(
    meals.map((meal) => {
      const lookup = new URL(lookupPath, url.origin);
      lookup.searchParams.set('i', meal.idMeal);
      const body = JSON.stringify({ meals: [meal] });
      return cache.put(lookup.href, new Response(body, { headers: { 'Content-Type': 'application/json' } }));
    }),
  );
  await trimCache(DATA_CACHE, MAX_DATA_ENTRIES);
}

async function networkFirst(request, cacheName, maxEntries, onResponse) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(request, response.clone());
      trimCache(cacheName, maxEntries);
      onResponse?.(response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request, MATCH_OPTIONS);
    if (cached) return cached;
    throw error;
  }
}

async function cacheFirst(request, cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request.url, MATCH_OPTIONS);
  if (cached) return cached;
  const response = await fetchReadable(request);
  if (response.ok && response.type !== 'opaque') {
    await cache.put(request.url, response.clone());
    if (maxEntries) trimCache(cacheName, maxEntries);
  }
  return response;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  if (request.mode === 'navigate' && url.origin === self.location.origin) {
    event.respondWith(handlePage(request));
  } else if (url.origin === self.location.origin) {
    event.respondWith(handleAppFile(request));
  } else if (url.origin === MEALDB_ORIGIN && url.pathname.startsWith('/api/')) {
    event.respondWith(
      networkFirst(request, DATA_CACHE, MAX_DATA_ENTRIES, (response) =>
        event.waitUntil(saveAsLookups(request, response)),
      ),
    );
  } else if (url.origin === MEALDB_ORIGIN && url.pathname.startsWith('/images/')) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE, MAX_IMAGE_ENTRIES));
  } else if (FONT_ORIGINS.includes(url.origin)) {
    event.respondWith(cacheFirst(request, FONT_CACHE));
  }
});

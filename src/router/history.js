/**
 * A small wrapper around the History API that React subscribes to with
 * useSyncExternalStore. Every push, replace or back/forward navigation gets a
 * new `key`, which the layout uses to remount the page like a real page load.
 * Search-only updates (filters) keep the key, so the page stays mounted.
 */
let navigationKey = 0;
let lastAction = 'load';
let currentLocation = null;
let hydrationLocation = null;
const listeners = new Set();

function readLocation() {
  const { pathname, search, hash } = window.location;
  return { pathname, search, hash, key: navigationKey, action: lastAction };
}

function notify() {
  currentLocation = readLocation();
  listeners.forEach((listener) => listener());
}

function handlePopState() {
  // Back/forward to another page remounts it; a #hash change on the same page does not.
  const { pathname, search } = window.location;
  if (currentLocation?.pathname !== pathname || currentLocation?.search !== search) navigationKey += 1;
  lastAction = 'pop';
  notify();
}

export function subscribe(listener) {
  if (listeners.size === 0) window.addEventListener('popstate', handlePopState);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener('popstate', handlePopState);
  };
}

export function getSnapshot() {
  currentLocation ??= readLocation();
  return currentLocation;
}

/**
 * The location prerendered pages were built from: the path only. Hydrating
 * with this avoids mismatches; React then re-renders with the real ?search.
 */
export function getHydrationSnapshot() {
  hydrationLocation ??= { ...getSnapshot(), search: '', hash: '' };
  return hydrationLocation;
}

/** A static location for server rendering. */
export function createStaticLocation(url) {
  const { pathname, search, hash } = new URL(url, 'http://localhost');
  return { pathname, search, hash, key: 0, action: 'load' };
}

export function navigate(to, { replace = false } = {}) {
  const url = new URL(to, window.location.href);
  if (url.origin !== window.location.origin) {
    window.location.assign(url.href);
    return;
  }
  window.history[replace ? 'replaceState' : 'pushState'](null, '', url.pathname + url.search + url.hash);
  navigationKey += 1;
  lastAction = replace ? 'replace' : 'push';
  notify();
}

/** Replaces the query string (without "?") in place, keeping the current page mounted. */
export function replaceSearch(search) {
  const { pathname, hash } = window.location;
  window.history.replaceState(window.history.state, '', `${pathname}${search ? `?${search}` : ''}${hash}`);
  notify();
}

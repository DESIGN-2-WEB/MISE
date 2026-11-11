import { useSyncExternalStore } from 'react';

/**
 * localStorage-backed state shared by every component that uses the same key,
 * kept in sync across open tabs. Server rendering and hydration use the
 * fallback, then the browser value is applied, so prerendered HTML matches.
 */
const stores = new Map();

function createStore(key, fallback, parse) {
  const listeners = new Set();
  let cachedRaw;
  let cachedValue = fallback;
  // Used when storage is unavailable (private mode, quota exceeded).
  let useMemory = false;
  let memoryRaw = null;

  const readRaw = () => {
    if (useMemory) return memoryRaw;
    try {
      return window.localStorage.getItem(key);
    } catch {
      useMemory = true;
      return memoryRaw;
    }
  };

  const getSnapshot = () => {
    const raw = readRaw();
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      try {
        cachedValue = raw === null ? fallback : parse(JSON.parse(raw));
      } catch {
        cachedValue = fallback;
      }
    }
    return cachedValue;
  };

  const setValue = (update) => {
    const next = typeof update === 'function' ? update(getSnapshot()) : update;
    memoryRaw = JSON.stringify(next);
    try {
      window.localStorage.setItem(key, memoryRaw);
    } catch {
      useMemory = true;
    }
    listeners.forEach((listener) => listener());
  };

  const subscribe = (listener) => {
    const handleStorage = (event) => {
      if (event.key === key || event.key === null) listener();
    };
    listeners.add(listener);
    window.addEventListener('storage', handleStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener('storage', handleStorage);
    };
  };

  return { getSnapshot, getServerSnapshot: () => fallback, setValue, subscribe };
}

/** `fallback` and `parse` should be module-level constants; the first use of a key defines them. */
export function usePersistentState(key, fallback, parse = (value) => value) {
  if (!stores.has(key)) stores.set(key, createStore(key, fallback, parse));
  const store = stores.get(key);
  const value = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  return [value, store.setValue];
}

/** Keeps only valid recipe snapshots: { id, title?, image?, category? }. */
export function parseSnapshots(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === 'string' ? { id: item } : item))
    .filter((item) => item && typeof item.id === 'string');
}

/** The minimal copy of a recipe we store, so lists render without a network request. */
export function toSnapshot(recipe) {
  return { id: recipe.id, title: recipe.title, image: recipe.image, category: recipe.category ?? null };
}

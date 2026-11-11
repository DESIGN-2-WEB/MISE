import { useSyncExternalStore } from 'react';
import { THEME_STORAGE_KEY } from '../constants/config';

/**
 * Light/dark theme, stored on <html data-theme>. index.html applies the saved
 * or system theme before the first paint; this hook reads and changes it.
 * The theme follows the operating system until the user picks one.
 */
const THEME_COLORS = { dark: '#0d0d0f', light: '#faf7f2' };
const LIGHT_QUERY = '(prefers-color-scheme: light)';

function readStoredTheme() {
  try {
    const theme = JSON.parse(window.localStorage.getItem(THEME_STORAGE_KEY));
    return theme === 'light' || theme === 'dark' ? theme : null;
  } catch {
    return null;
  }
}

const systemTheme = () => (window.matchMedia(LIGHT_QUERY).matches ? 'light' : 'dark');

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[theme]);
}

function subscribe(onChange) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  const media = window.matchMedia(LIGHT_QUERY);
  const handleSystemChange = () => {
    if (!readStoredTheme()) applyTheme(systemTheme());
  };
  const handleStorage = (event) => {
    if (event.key === THEME_STORAGE_KEY) applyTheme(readStoredTheme() ?? systemTheme());
  };
  media.addEventListener('change', handleSystemChange);
  window.addEventListener('storage', handleStorage);

  return () => {
    observer.disconnect();
    media.removeEventListener('change', handleSystemChange);
    window.removeEventListener('storage', handleStorage);
  };
}

const getSnapshot = () => (document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');
const getServerSnapshot = () => 'dark';

function toggleTheme() {
  const next = getSnapshot() === 'dark' ? 'light' : 'dark';
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage is unavailable, so the choice only lasts for this visit.
  }
  applyTheme(next);
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return { theme, toggleTheme };
}

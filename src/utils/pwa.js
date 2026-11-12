/**
 * Installing Mise as an app. Registers the service worker (production only),
 * and keeps track of whether this browser can install the site, so the
 * "Install app" button only shows when it will work.
 *
 * Install states:
 * - 'prompt':      Chrome, Edge, Samsung Internet: the button opens the browser's install prompt
 * - 'ios':         iPhone and iPad have no prompt; the button explains "Add to Home Screen"
 * - 'installed':   already running as an installed app, or just installed
 * - 'unsupported': no way to install from this browser, so no button
 */
let deferredPrompt = null;
let justInstalled = false;
const listeners = new Set();

const notify = () => listeners.forEach((listener) => listener());

const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

// iPadOS reports itself as a Mac, so a touch screen gives it away.
const isAppleMobile = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) || (/macintosh/i.test(navigator.userAgent) && navigator.maxTouchPoints > 1);

export function getInstallState() {
  if (justInstalled || isStandalone()) return 'installed';
  if (deferredPrompt) return 'prompt';
  if (isAppleMobile()) return 'ios';
  return 'unsupported';
}

/** Prerendered pages never show the button; the browser decides after loading. */
export const getServerInstallState = () => 'unsupported';

export function subscribeToInstallState(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Opens the browser's install prompt. Must be called from a click. Resolves to 'accepted' or 'dismissed'. */
export async function promptInstall() {
  const event = deferredPrompt;
  if (!event) return 'dismissed';
  deferredPrompt = null;
  await event.prompt();
  const { outcome } = await event.userChoice;
  notify();
  return outcome;
}

export function setUpPwa() {
  window.addEventListener('beforeinstallprompt', (event) => {
    // Keep the prompt for the "Install app" button instead of the browser's own banner.
    event.preventDefault();
    deferredPrompt = event;
    notify();
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    justInstalled = true;
    notify();
  });

  window.matchMedia('(display-mode: standalone)').addEventListener('change', notify);

  // In development the service worker would serve stale code, so it is only used in builds.
  if (import.meta.env.PROD && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    });
  }
}

import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { scrollToSection } from '../utils/dom';
import { RouterContext } from './context';
import { createStaticLocation, getHydrationSnapshot, getSnapshot, subscribe } from './history';

/**
 * Provides the current location. Pass `url` when rendering on the server;
 * in the browser the location comes from the History API.
 */
function RouterProvider({ url, children }) {
  const staticLocation = useMemo(() => (url ? createStaticLocation(url) : null), [url]);
  const location = useSyncExternalStore(subscribe, getSnapshot, () => staticLocation ?? getHydrationSnapshot());
  const { key, action, hash } = location;

  // New pages start at the top, or at the #section in the URL. Back/forward is left to the browser.
  useEffect(() => {
    if (action === 'pop') return;
    if (hash) scrollToSection(decodeURIComponent(hash.slice(1)), { smooth: false });
    else if (action !== 'load') window.scrollTo(0, 0);
  }, [key, action, hash]);

  return <RouterContext.Provider value={location}>{children}</RouterContext.Provider>;
}

export default RouterProvider;

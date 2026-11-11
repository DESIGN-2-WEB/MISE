import { createContext, useContext } from 'react';

export const RouterContext = createContext(null);

/** The current { pathname, search, hash, key, action }. */
export function useLocation() {
  const location = useContext(RouterContext);
  if (!location) throw new Error('useLocation must be used inside <RouterProvider>.');
  return location;
}

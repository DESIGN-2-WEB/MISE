import { lazyPage } from './router/lazyPage';
import { PAGE_META } from './seo/pages';

/**
 * Every page of the site. `id` links a route to its metadata in seo/pages.js,
 * which is also where the path comes from, so canonical URLs, the sitemap and
 * the router can never disagree. Pages load on demand.
 */
const defineRoute = (id, loader) => ({ path: PAGE_META[id].path, id, page: lazyPage(loader) });

export const ROUTES = [
  defineRoute('home', () => import('./pages/HomePage')),
  defineRoute('recipes', () => import('./pages/RecipesPage')),
  defineRoute('categories', () => import('./pages/CategoriesPage')),
  defineRoute('cuisines', () => import('./pages/CuisinesPage')),
  defineRoute('inspiration', () => import('./pages/InspirationPage')),
  defineRoute('saved', () => import('./pages/SavedPage')),
  defineRoute('planner', () => import('./pages/PlannerPage')),
  defineRoute('about', () => import('./pages/AboutPage')),
  defineRoute('contact', () => import('./pages/ContactPage')),
  defineRoute('privacy', () => import('./pages/PrivacyPage')),
  defineRoute('terms', () => import('./pages/TermsPage')),
];

const NOT_FOUND_ROUTE = defineRoute('notFound', () => import('./pages/NotFoundPage'));

/** "/about/" and "/about" are the same page. */
const normalizePath = (pathname) => (pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname);

export function matchRoute(pathname) {
  const path = normalizePath(pathname);
  return ROUTES.find((route) => route.path === path) ?? NOT_FOUND_ROUTE;
}

export function preloadRoute(pathname) {
  return matchRoute(pathname).page.load();
}

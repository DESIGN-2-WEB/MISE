/**
 * TheMealDB's shared test key "1" is for development. Set VITE_MEALDB_API_KEY
 * to a supporter key before releasing the site publicly.
 */
const MEALDB_API_KEY = import.meta.env.VITE_MEALDB_API_KEY || '1';

export const API_BASE_URL = `https://www.themealdb.com/api/json/v1/${MEALDB_API_KEY}`;
export const INGREDIENT_IMAGE_URL = 'https://www.themealdb.com/images/ingredients';

/** Number of recipes revealed per "Show more" click. */
export const PAGE_SIZE = 24;

/** Recipe detail requests allowed in flight at once (TheMealDB rate-limits bursts). */
export const MAX_CONCURRENT_LOOKUPS = 4;

/** Number of random recipes in the inspiration section. */
export const INSPIRATION_COUNT = 8;

/** Upper bound on comma-separated ingredients in one search (one request each). */
export const MAX_INGREDIENTS = 5;

export const FAVORITES_STORAGE_KEY = 'mise_favorites';
export const RECENT_STORAGE_KEY = 'mise_recent';
export const MEAL_PLAN_STORAGE_KEY = 'mise_meal_plan';
export const THEME_STORAGE_KEY = 'mise_theme';

/** How many recently viewed recipes to remember. */
export const RECENT_LIMIT = 12;

/** Maximum suggestions shown under the search box. */
export const SUGGESTION_LIMIT = 8;

export const TOAST_DURATION_MS = 2800;

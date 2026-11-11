/**
 * TheMealDB client.
 *
 * Every read goes through an in-memory cache keyed by URL (lists) or meal id
 * (recipes). Cached promises are shared between callers, so requests are never
 * aborted at the fetch level — callers ignore stale results instead.
 */
import { CATEGORIES } from '../constants/catalog';
import { API_BASE_URL, MAX_CONCURRENT_LOOKUPS, MAX_INGREDIENTS } from '../constants/config';
import { createRandom, shuffle, todaySeed } from '../utils/random';
import { toRecipe, toRecipeSummary } from '../utils/recipe';
import { createTitleMatcher, findCategoryByName, findCuisineByName, uniqueById } from '../utils/search';

class ApiError extends Error {
  constructor(message, { cause } = {}) {
    super(message, { cause });
    this.name = 'ApiError';
  }
}

const NETWORK_ERROR_MESSAGE =
  "We couldn't reach the recipe service. Check your connection and try again. " +
  'If you use an ad blocker, allow requests to themealdb.com.';

const responseCache = new Map();
const recipeCache = new Map();
const pendingRecipes = new Map();

function buildUrl(endpoint, params = {}) {
  const url = new URL(`${API_BASE_URL}/${endpoint}`);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  return url.toString();
}

async function fetchJson(url) {
  let response;
  try {
    response = await fetch(url);
  } catch (error) {
    throw new ApiError(NETWORK_ERROR_MESSAGE, { cause: error });
  }
  if (!response.ok) {
    throw new ApiError(`The recipe service returned an error (${response.status}). Please try again.`);
  }
  try {
    return await response.json();
  } catch (error) {
    throw new ApiError('The recipe service sent an unexpected response. Please try again.', { cause: error });
  }
}

/** Fetches a URL once; failed requests are evicted so they can be retried. */
function cachedJson(url) {
  if (!responseCache.has(url)) {
    const request = fetchJson(url).catch((error) => {
      responseCache.delete(url);
      throw error;
    });
    responseCache.set(url, request);
  }
  return responseCache.get(url);
}

/**
 * TheMealDB signals "no results" with `meals: null` and bad input with a string
 * such as `meals: "Invalid ID"`. Treat anything that isn't a list as empty.
 */
function mealsOf(data) {
  return Array.isArray(data?.meals) ? data.meals.filter((meal) => meal?.idMeal) : [];
}

/**
 * Recipe lookups are one request per recipe, so cap how many run at once to
 * avoid tripping TheMealDB's rate limiting when a page of cards loads.
 */
const lookupQueue = [];
let activeLookups = 0;

function scheduleLookup(task) {
  return new Promise((resolve, reject) => {
    lookupQueue.push({ task, resolve, reject });
    runLookups();
  });
}

function runLookups() {
  while (activeLookups < MAX_CONCURRENT_LOOKUPS && lookupQueue.length > 0) {
    const { task, resolve, reject } = lookupQueue.shift();
    activeLookups++;
    task()
      .then(resolve, reject)
      .finally(() => {
        activeLookups--;
        runLookups();
      });
  }
}

function rememberRecipes(meals) {
  return meals.map((meal) => {
    const recipe = toRecipe(meal);
    recipeCache.set(recipe.id, recipe);
    return recipe;
  });
}

async function fetchSummaries(endpoint, params) {
  const data = await cachedJson(buildUrl(endpoint, params));
  return mealsOf(data).map(toRecipeSummary);
}

// ─── Public API ─────────────────────────────────────────────

async function searchByName(query) {
  const data = await cachedJson(buildUrl('search.php', { s: query }));
  return rememberRecipes(mealsOf(data));
}

const filterByIngredient = (ingredient) =>
  fetchSummaries('filter.php', { i: ingredient.replace(/\s+/g, '_') });

const filterByCuisine = (area) => fetchSummaries('filter.php', { a: area });

const filterByCategory = (category) => fetchSummaries('filter.php', { c: category });

/** Returns a cached full recipe synchronously, or undefined. */
export const peekRecipe = (id) => recipeCache.get(id);

export function getRecipeById(id) {
  if (recipeCache.has(id)) return Promise.resolve(recipeCache.get(id));
  if (!pendingRecipes.has(id)) {
    const request = scheduleLookup(() => fetchJson(buildUrl('lookup.php', { i: id })))
      .then((data) => {
        const [meal] = mealsOf(data);
        if (!meal) throw new ApiError('This recipe is no longer available.');
        return rememberRecipes([meal])[0];
      })
      .finally(() => pendingRecipes.delete(id));
    pendingRecipes.set(id, request);
  }
  return pendingRecipes.get(id);
}

let catalogRequest = null;

/**
 * Every recipe in TheMealDB as summaries ({ id, title, image, category }).
 * Built from one request per category, since the free API has no "list all"
 * endpoint. The order is shuffled once per day so browsing feels fresh.
 */
export function getAllRecipes() {
  if (!catalogRequest) {
    catalogRequest = Promise.all(
      CATEGORIES.map((category) =>
        filterByCategory(category).then((recipes) => recipes.map((recipe) => ({ ...recipe, category }))),
      ),
    )
      .then((lists) => shuffle(uniqueById(lists.flat()), createRandom(todaySeed())))
      .catch((error) => {
        catalogRequest = null;
        throw error;
      });
  }
  return catalogRequest;
}

/** Every ingredient name TheMealDB knows, alphabetically (for suggestions). */
export async function getIngredientNames() {
  const data = await cachedJson(buildUrl('list.php', { i: 'list' }));
  const items = Array.isArray(data?.meals) ? data.meals : [];
  const names = items.map((item) => item?.strIngredient?.trim()).filter(Boolean);
  return [...new Set(names)].sort((a, b) => a.localeCompare(b));
}

const idsOf = (recipes) => new Set(recipes.map((recipe) => recipe.id));

/**
 * Free-text search. TheMealDB's own search only matches recipe titles, which
 * misses a lot ("pasta" finds a single recipe), so this also matches every
 * query word against all titles, and treats the query as a category, cuisine
 * or main ingredient. Title matches come first, then the broader matches.
 */
async function searchEverywhere(query, catalog) {
  const matchesTitle = createTitleMatcher(query);
  const category = findCategoryByName(query);
  const cuisine = findCuisineByName(query);

  const [byName, byIngredient, byCuisine] = await Promise.all([
    searchByName(query).catch(() => []), // also caches full details for these recipes
    filterByIngredient(query).catch(() => []),
    cuisine ? filterByCuisine(cuisine.value) : [],
  ]);

  return uniqueById([
    ...byName,
    ...catalog.filter((recipe) => matchesTitle(recipe.title)),
    ...(category ? catalog.filter((recipe) => recipe.category === category) : []),
    ...byCuisine,
    ...byIngredient,
  ]);
}

/** Recipes that use every ingredient in a comma-separated list. */
async function searchByIngredients(query) {
  const ingredients = [...new Set(query.split(',').map((item) => item.trim().toLowerCase()).filter(Boolean))];
  const [first, ...others] = await Promise.all(ingredients.slice(0, MAX_INGREDIENTS).map(filterByIngredient));
  const otherIds = others.map(idsOf);
  return first.filter((recipe) => otherIds.every((ids) => ids.has(recipe.id)));
}

/**
 * Finds recipes matching every active criterion. With no criteria this is the
 * whole catalogue. TheMealDB supports only one filter per request, so the
 * cuisine filter is fetched separately and intersected by id.
 */
export async function findRecipes({ query = '', mode = 'name', cuisine = '', category = '' }) {
  const catalog = await getAllRecipes();
  const trimmed = query.trim();

  let results = catalog;
  if (trimmed && mode === 'ingredients') results = await searchByIngredients(trimmed);
  else if (trimmed) results = await searchEverywhere(trimmed, catalog);

  // Filter endpoints return no category; fill it in from the catalogue.
  const catalogById = new Map(catalog.map((recipe) => [recipe.id, recipe]));
  results = results.map((recipe) => (recipe.category ? recipe : { ...catalogById.get(recipe.id), ...recipe }));

  if (cuisine) {
    const cuisineIds = idsOf(await filterByCuisine(cuisine));
    results = results.filter((recipe) => cuisineIds.has(recipe.id));
  }
  if (category) results = results.filter((recipe) => recipe.category === category);

  return results;
}

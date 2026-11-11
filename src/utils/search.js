import { CATEGORIES, CUISINES } from '../constants/catalog';

const STOP_WORDS = new Set(['a', 'an', 'and', 'the', 'of', 'with', 'in', 'for', 'to', 'recipe', 'recipes', 'dish', 'dishes']);

export function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '') // strip accents: "crème" → "creme"
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** A word plus simple singular forms, so "curries", "pies" and "tomatoes" still match. */
function wordVariants(word) {
  const variants = new Set([word]);
  if (word.endsWith('ies')) {
    variants.add(`${word.slice(0, -3)}y`);
    variants.add(word.slice(0, -1));
  } else if (word.endsWith('es')) {
    variants.add(word.slice(0, -2));
    variants.add(word.slice(0, -1));
  } else if (word.endsWith('s') && !word.endsWith('ss')) {
    variants.add(word.slice(0, -1));
  }
  return [...variants].filter((variant) => variant.length >= 3 || variant === word);
}

/** Returns a predicate that is true when a title contains every meaningful query word. */
export function createTitleMatcher(query) {
  const words = normalizeText(query)
    .split(' ')
    .filter((word) => word && !STOP_WORDS.has(word))
    .map(wordVariants);
  if (words.length === 0) return () => false;
  return (title) => {
    const text = normalizeText(title);
    return words.every((variants) => variants.some((variant) => text.includes(variant)));
  };
}

/** "desserts" → "Dessert", "seafood" → "Seafood", otherwise null. */
export function findCategoryByName(query) {
  const variants = wordVariants(normalizeText(query));
  return CATEGORIES.find((category) => variants.includes(category.toLowerCase())) ?? null;
}

/** "indian" or "india" → the Indian cuisine entry, otherwise null. */
export function findCuisineByName(query) {
  const variants = wordVariants(normalizeText(query));
  return (
    CUISINES.find(
      (cuisine) => variants.includes(cuisine.label.toLowerCase()) || variants.includes(cuisine.value.toLowerCase()),
    ) ?? null
  );
}

export function uniqueById(recipes) {
  const seen = new Set();
  return recipes.filter((recipe) => {
    if (seen.has(recipe.id)) return false;
    seen.add(recipe.id);
    return true;
  });
}

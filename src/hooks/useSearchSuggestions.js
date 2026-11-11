import { useMemo } from 'react';
import { getAllRecipes, getIngredientNames } from '../api/mealdb';
import { CATEGORIES, CUISINES } from '../constants/catalog';
import { SUGGESTION_LIMIT } from '../constants/config';
import { createTitleMatcher, normalizeText } from '../utils/search';
import { useAsync } from './useAsync';

const RECENT_IN_SUGGESTIONS = 5;
const MAX_FILTER_SUGGESTIONS = 2;

/** 0 = starts with the term, 1 = a word starts with it, 2 = contains it anywhere. */
function matchRank(text, term) {
  const normalized = normalizeText(text);
  if (normalized.startsWith(term)) return 0;
  if (normalized.split(' ').some((word) => word.startsWith(term))) return 1;
  return 2;
}

function byRankThenLength(term) {
  return (a, b) => matchRank(a.label, term) - matchRank(b.label, term) || a.label.length - b.label.length;
}

/** The ingredient currently being typed: the text after the last comma. */
export function splitIngredientQuery(query) {
  const parts = query.split(',');
  return { done: parts.slice(0, -1).map((part) => part.trim()).filter(Boolean), current: parts.at(-1).trim() };
}

function nameSuggestions(query, catalog, recent) {
  const term = normalizeText(query);
  if (!term) {
    return recent.slice(0, RECENT_IN_SUGGESTIONS).map((recipe) => ({
      id: `recent-${recipe.id}`,
      type: 'recent',
      label: recipe.title,
      meta: 'Recently viewed',
      image: recipe.image,
      recipe,
    }));
  }
  if (term.length < 2) return [];

  const categories = CATEGORIES.filter((category) => normalizeText(category).startsWith(term))
    .slice(0, MAX_FILTER_SUGGESTIONS)
    .map((category) => ({ id: `category-${category}`, type: 'category', label: category, meta: 'Category', criteria: { category } }));

  const cuisines = CUISINES.filter(
    (cuisine) => normalizeText(cuisine.label).startsWith(term) || normalizeText(cuisine.value).startsWith(term),
  )
    .slice(0, MAX_FILTER_SUGGESTIONS)
    .map((cuisine) => ({
      id: `cuisine-${cuisine.value}`,
      type: 'cuisine',
      label: `${cuisine.label} cuisine`,
      meta: 'Cuisine',
      criteria: { cuisine: cuisine.value },
    }));

  const matchesTitle = createTitleMatcher(query);
  const recipes = (catalog ?? [])
    .filter((recipe) => matchesTitle(recipe.title))
    .map((recipe) => ({
      id: `recipe-${recipe.id}`,
      type: 'recipe',
      label: recipe.title,
      meta: recipe.category,
      image: recipe.image,
      recipe,
    }))
    .sort(byRankThenLength(term))
    .slice(0, SUGGESTION_LIMIT - categories.length - cuisines.length);

  return [...categories, ...cuisines, ...recipes];
}

function ingredientSuggestions(query, ingredients) {
  const { done, current } = splitIngredientQuery(query);
  const term = normalizeText(current);
  if (!term || !ingredients) return [];
  const chosen = new Set(done.map(normalizeText));
  return ingredients
    .filter((name) => !chosen.has(normalizeText(name)) && normalizeText(name).includes(term))
    .map((name) => ({ id: `ingredient-${name}`, type: 'ingredient', label: name, meta: 'Ingredient', value: name }))
    .sort(byRankThenLength(term))
    .slice(0, SUGGESTION_LIMIT);
}

/**
 * Suggestions for the search box:
 * - empty input: recently viewed recipes
 * - "By name": matching categories, cuisines and recipe titles
 * - "By ingredients": ingredient names for the item being typed
 * The recipe and ingredient lists only load once `enabled` (the box was focused).
 */
export function useSearchSuggestions({ query, mode, recent, enabled }) {
  const { data: catalog } = useAsync(enabled ? getAllRecipes : null);
  const { data: ingredients } = useAsync(enabled && mode === 'ingredients' ? getIngredientNames : null);

  return useMemo(() => {
    if (mode === 'ingredients') {
      const { current } = splitIngredientQuery(query);
      return { suggestions: ingredientSuggestions(query, ingredients), term: current };
    }
    return { suggestions: nameSuggestions(query, catalog, recent), term: query.trim() };
  }, [query, mode, catalog, ingredients, recent]);
}

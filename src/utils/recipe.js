import { formatCuisine } from '../constants/catalog';
import { INGREDIENT_IMAGE_URL } from '../constants/config';

const MAX_INGREDIENT_SLOTS = 20;
const STEP_HEADING = /^(step\s*\d+|\d+)\s*[:.)-]?$/i;
const STEP_PREFIX = /^(step\s*\d+\s*[:.)-]?|\d+\s*[.)])\s*/i;

function capitalize(text) {
  const trimmed = text.trim();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

/** Minimal shape returned by TheMealDB filter endpoints. */
export function toRecipeSummary(meal) {
  return {
    id: meal.idMeal,
    title: capitalize(meal.strMeal ?? ''),
    image: meal.strMealThumb || null,
  };
}

/** Full recipe shape used throughout the app. */
export function toRecipe(meal) {
  return {
    ...toRecipeSummary(meal),
    cuisine: formatCuisine(meal.strArea),
    category: meal.strCategory || null,
    tags: parseTags(meal.strTags),
    ingredients: parseIngredients(meal),
    steps: parseInstructions(meal.strInstructions),
    videoUrl: meal.strYoutube || null,
    sourceUrl: meal.strSource || null,
    isComplete: true,
  };
}

function parseTags(tags) {
  if (!tags) return [];
  return [...new Set(tags.split(',').map((tag) => tag.trim()).filter(Boolean))];
}

function parseIngredients(meal) {
  const ingredients = [];
  for (let i = 1; i <= MAX_INGREDIENT_SLOTS; i++) {
    const name = meal[`strIngredient${i}`]?.trim();
    if (!name) continue;
    ingredients.push({ name: capitalize(name), measure: meal[`strMeasure${i}`]?.trim() ?? '' });
  }
  return ingredients;
}

/**
 * TheMealDB instructions come in many shapes: one line per step, "STEP 1"
 * headings, numbered lines, or a single long paragraph. Normalise them all
 * into a clean list of steps.
 */
function parseInstructions(text) {
  if (!text) return [];

  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !STEP_HEADING.test(line))
    .map((line) => line.replace(STEP_PREFIX, '').trim())
    .filter(Boolean);

  if (lines.length === 1 && lines[0].length > 280) {
    return groupSentences(lines[0]);
  }
  return lines;
}

function groupSentences(paragraph, minLength = 160) {
  const sentences = paragraph.match(/[^.!?]+[.!?]+["')]*\s*|[^.!?]+$/g) ?? [paragraph];
  const steps = [];
  let current = '';
  for (const sentence of sentences) {
    current += sentence;
    if (current.length >= minLength) {
      steps.push(current.trim());
      current = '';
    }
  }
  if (current.trim()) steps.push(current.trim());
  return steps;
}

export function getIngredientImage(name) {
  return `${INGREDIENT_IMAGE_URL}/${encodeURIComponent(name)}-Small.png`;
}

export function sortRecipes(recipes, sort) {
  if (sort === 'az' || sort === 'za') {
    const direction = sort === 'az' ? 1 : -1;
    return [...recipes].sort((a, b) => direction * a.title.localeCompare(b.title));
  }
  return recipes;
}

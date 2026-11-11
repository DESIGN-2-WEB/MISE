import { useEffect, useState } from 'react';
import { getRecipeById, peekRecipe } from '../api/mealdb';

/**
 * Takes recipe summaries ({ id, title, image }) and progressively fills in the
 * full details. Summaries render immediately; details replace them as they
 * arrive. Recipes whose lookup fails are marked `isUnavailable`.
 */
export function useRecipeDetails(recipes) {
  const [failedIds, setFailedIds] = useState(() => new Set());
  const [, setLoadedCount] = useState(0);

  const missingKey = recipes
    .filter((recipe) => !recipe.isComplete && !peekRecipe(recipe.id))
    .map((recipe) => recipe.id)
    .join('|');

  useEffect(() => {
    if (!missingKey) return undefined;
    let cancelled = false;
    const ids = missingKey.split('|');

    Promise.allSettled(ids.map((id) => getRecipeById(id))).then((results) => {
      if (cancelled) return;
      const failed = ids.filter((_, index) => results[index].status === 'rejected');
      if (failed.length > 0) setFailedIds((previous) => new Set([...previous, ...failed]));
      setLoadedCount((count) => count + 1); // re-render so peekRecipe() sees the new cache entries
    });

    return () => {
      cancelled = true;
    };
  }, [missingKey]);

  return recipes.map((recipe) => {
    const details = recipe.isComplete ? recipe : peekRecipe(recipe.id);
    if (details) return details;
    return { ...recipe, isUnavailable: failedIds.has(recipe.id) };
  });
}

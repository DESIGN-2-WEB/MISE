import { useCallback } from 'react';
import { RECENT_LIMIT, RECENT_STORAGE_KEY } from '../constants/config';
import { parseSnapshots, toSnapshot, usePersistentState } from './usePersistentState';

/** The last few recipes opened, most recent first. */
export function useRecentlyViewed() {
  const [recent, setRecent] = usePersistentState(RECENT_STORAGE_KEY, [], parseSnapshots);

  const addRecent = useCallback(
    (recipe) => {
      if (!recipe?.id || !recipe.title) return;
      setRecent((previous) =>
        [toSnapshot(recipe), ...previous.filter((item) => item.id !== recipe.id)].slice(0, RECENT_LIMIT),
      );
    },
    [setRecent],
  );

  const clearRecent = useCallback(() => setRecent([]), [setRecent]);

  return { recent, addRecent, clearRecent };
}

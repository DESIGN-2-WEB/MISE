import { useCallback, useMemo } from 'react';
import { FAVORITES_STORAGE_KEY } from '../constants/config';
import { parseSnapshots, toSnapshot, usePersistentState } from './usePersistentState';

/**
 * Favourites are stored as lightweight snapshots so the saved list renders
 * instantly; full details are loaded on demand. Older versions stored plain id
 * strings, which parseSnapshots migrates transparently.
 */
export function useFavorites() {
  const [favorites, setFavorites] = usePersistentState(FAVORITES_STORAGE_KEY, [], parseSnapshots);

  const favoriteIds = useMemo(() => new Set(favorites.map((favorite) => favorite.id)), [favorites]);

  const isFavorite = useCallback((id) => favoriteIds.has(id), [favoriteIds]);

  /** Adds or removes a recipe. Returns true if the recipe is now saved. */
  const toggleFavorite = useCallback(
    (recipe) => {
      const willSave = !favoriteIds.has(recipe.id);
      setFavorites((previous) =>
        willSave ? [toSnapshot(recipe), ...previous] : previous.filter((favorite) => favorite.id !== recipe.id),
      );
      return willSave;
    },
    [favoriteIds, setFavorites],
  );

  return { favorites, isFavorite, toggleFavorite };
}

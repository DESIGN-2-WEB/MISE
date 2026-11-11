import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import Toast from '../components/ui/Toast';
import { getDayLabel } from '../constants/planner';
import { useFavorites } from '../hooks/useFavorites';
import { useMealPlan } from '../hooks/useMealPlan';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';
import { useToast } from '../hooks/useToast';
import { useLocation } from '../router/context';
import { KitchenContext } from './kitchen';

// The recipe dialog (with cooking mode) loads the first time a recipe is opened.
const RecipeModal = lazy(() => import('../components/recipes/RecipeModal'));

/** App-wide cooking state: saved recipes, meal plan, history, the recipe dialog and toasts. */
function KitchenProvider({ children }) {
  const { favorites, isFavorite, toggleFavorite } = useFavorites();
  const { recent, addRecent, clearRecent } = useRecentlyViewed();
  const { plan, addToPlan, removeFromPlan, clearPlan, getPlannedDays, plannedCount } = useMealPlan();
  const { toast, showToast } = useToast();
  const [activeRecipe, setActiveRecipe] = useState(null);
  const { key: locationKey } = useLocation();

  const openRecipe = useCallback(
    (recipe) => {
      setActiveRecipe(recipe);
      addRecent(recipe);
    },
    [addRecent],
  );

  const closeRecipe = useCallback(() => setActiveRecipe(null), []);

  // Going to another page (including the back button) closes the dialog.
  useEffect(() => {
    setActiveRecipe(null);
  }, [locationKey]);

  const toggleFavoriteWithToast = useCallback(
    (recipe) => {
      const saved = toggleFavorite(recipe);
      const name = recipe.title || 'Recipe';
      showToast(saved ? `Saved “${name}”` : `Removed “${name}” from saved recipes`);
    },
    [toggleFavorite, showToast],
  );

  const addToPlanWithToast = useCallback(
    (dayId, recipe) => {
      addToPlan(dayId, recipe);
      showToast(`Added to ${getDayLabel(dayId)}`);
    },
    [addToPlan, showToast],
  );

  const removeFromPlanWithToast = useCallback(
    (dayId, recipe) => {
      removeFromPlan(dayId, recipe.id);
      showToast(`Removed from ${getDayLabel(dayId)}`);
    },
    [removeFromPlan, showToast],
  );

  const togglePlanDay = useCallback(
    (dayId, recipe) => {
      if (getPlannedDays(recipe.id).includes(dayId)) removeFromPlanWithToast(dayId, recipe);
      else addToPlanWithToast(dayId, recipe);
    },
    [getPlannedDays, addToPlanWithToast, removeFromPlanWithToast],
  );

  const value = useMemo(
    () => ({
      favorites,
      isFavorite,
      toggleFavorite: toggleFavoriteWithToast,
      recent,
      clearRecent,
      plan,
      plannedCount,
      addToPlan: addToPlanWithToast,
      removeFromPlan: removeFromPlanWithToast,
      clearPlan,
      openRecipe,
    }),
    [
      favorites,
      isFavorite,
      toggleFavoriteWithToast,
      recent,
      clearRecent,
      plan,
      plannedCount,
      addToPlanWithToast,
      removeFromPlanWithToast,
      clearPlan,
      openRecipe,
    ],
  );

  return (
    <KitchenContext.Provider value={value}>
      {children}
      {activeRecipe && (
        <Suspense fallback={null}>
          <RecipeModal
            recipe={activeRecipe}
            isFavorite={isFavorite(activeRecipe.id)}
            plannedDays={getPlannedDays(activeRecipe.id)}
            onToggleFavorite={toggleFavoriteWithToast}
            onTogglePlanDay={togglePlanDay}
            onClose={closeRecipe}
          />
        </Suspense>
      )}
      <Toast message={toast.message} visible={toast.visible} />
    </KitchenContext.Provider>
  );
}

export default KitchenProvider;

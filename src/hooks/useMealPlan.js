import { useCallback, useMemo } from 'react';
import { MEAL_PLAN_STORAGE_KEY } from '../constants/config';
import { DAYS } from '../constants/planner';
import { parseSnapshots, toSnapshot, usePersistentState } from './usePersistentState';

const EMPTY_PLAN = Object.fromEntries(DAYS.map((day) => [day.id, []]));

function parsePlan(value) {
  if (!value || typeof value !== 'object') return EMPTY_PLAN;
  return Object.fromEntries(DAYS.map((day) => [day.id, parseSnapshots(value[day.id])]));
}

/** A weekly plan: each day (mon–sun) holds a list of recipe snapshots. */
export function useMealPlan() {
  const [plan, setPlan] = usePersistentState(MEAL_PLAN_STORAGE_KEY, EMPTY_PLAN, parsePlan);

  const addToPlan = useCallback(
    (dayId, recipe) => {
      setPlan((previous) => {
        if (previous[dayId].some((item) => item.id === recipe.id)) return previous;
        return { ...previous, [dayId]: [...previous[dayId], toSnapshot(recipe)] };
      });
    },
    [setPlan],
  );

  const removeFromPlan = useCallback(
    (dayId, recipeId) => {
      setPlan((previous) => ({ ...previous, [dayId]: previous[dayId].filter((item) => item.id !== recipeId) }));
    },
    [setPlan],
  );

  const clearPlan = useCallback(() => setPlan(EMPTY_PLAN), [setPlan]);

  /** Day ids that already contain the given recipe. */
  const getPlannedDays = useCallback(
    (recipeId) => DAYS.filter((day) => plan[day.id].some((item) => item.id === recipeId)).map((day) => day.id),
    [plan],
  );

  const plannedCount = useMemo(() => DAYS.reduce((total, day) => total + plan[day.id].length, 0), [plan]);

  return { plan, addToPlan, removeFromPlan, clearPlan, getPlannedDays, plannedCount };
}

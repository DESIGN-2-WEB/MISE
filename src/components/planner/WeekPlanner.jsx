import { useState } from 'react';
import { Plus, UtensilsCrossed, X } from 'lucide-react';
import { DAYS, getTodayId } from '../../constants/planner';
import { useKitchen } from '../../context/kitchen';
import { useHydrated } from '../../hooks/useHydrated';
import RecipePicker from './RecipePicker';

/** One card per day with its planned recipes. */
function WeekPlanner() {
  const { plan, addToPlan, removeFromPlan, openRecipe } = useKitchen();
  const [pickerDay, setPickerDay] = useState(null);
  // "Today" depends on the visitor's clock, so it is only shown in the browser.
  const hydrated = useHydrated();
  const todayId = hydrated ? getTodayId() : null;

  return (
    <>
      <ol className="planner">
        {DAYS.map((day) => {
          const meals = plan[day.id];
          const isToday = day.id === todayId;
          return (
            <li key={day.id} className={`planner-day${isToday ? ' is-today' : ''}`}>
              <header className="planner-day__header">
                <h2 className="planner-day__name">{day.label}</h2>
                {isToday && <span className="planner-day__today">Today</span>}
              </header>

              {meals.length === 0 ? (
                <p className="planner-day__empty">
                  <UtensilsCrossed size={14} aria-hidden="true" /> Nothing planned
                </p>
              ) : (
                <ul className="planner-day__meals">
                  {meals.map((recipe) => (
                    <li key={recipe.id} className="planned-meal">
                      <button type="button" className="planned-meal__open" onClick={() => openRecipe(recipe)}>
                        {recipe.image ? (
                          <img className="planned-meal__thumb" src={`${recipe.image}/small`} alt="" loading="lazy" />
                        ) : (
                          <span className="planned-meal__thumb" aria-hidden="true" />
                        )}
                        <span className="planned-meal__title">{recipe.title || 'Saved recipe'}</span>
                      </button>
                      <button
                        type="button"
                        className="planned-meal__remove no-print"
                        aria-label={`Remove ${recipe.title || 'recipe'} from ${day.label}`}
                        onClick={() => removeFromPlan(day.id, recipe)}
                      >
                        <X size={14} aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <button type="button" className="planner-day__add no-print" onClick={() => setPickerDay(day.id)}>
                <Plus size={16} aria-hidden="true" />
                Add recipe
              </button>
            </li>
          );
        })}
      </ol>

      {pickerDay && (
        <RecipePicker
          dayId={pickerDay}
          plannedIds={plan[pickerDay].map((recipe) => recipe.id)}
          onPick={(recipe) => addToPlan(pickerDay, recipe)}
          onClose={() => setPickerDay(null)}
        />
      )}
    </>
  );
}

export default WeekPlanner;

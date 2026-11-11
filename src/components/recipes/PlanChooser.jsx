import { CalendarDays } from 'lucide-react';
import { DAYS } from '../../constants/planner';

/** Day toggles for adding a recipe to (or removing it from) the weekly plan. */
function PlanChooser({ plannedDays, onToggleDay }) {
  return (
    <div className="plan-chooser" role="group" aria-labelledby="plan-chooser-label">
      <span className="plan-chooser__label" id="plan-chooser-label">
        <CalendarDays size={16} aria-hidden="true" />
        Add to meal plan
      </span>
      <div className="plan-chooser__days">
        {DAYS.map((day) => {
          const planned = plannedDays.includes(day.id);
          return (
            <button
              key={day.id}
              type="button"
              className={`chip chip--day${planned ? ' is-active' : ''}`}
              aria-pressed={planned}
              aria-label={day.label}
              title={planned ? `Remove from ${day.label}` : `Add to ${day.label}`}
              onClick={() => onToggleDay(day.id)}
            >
              {day.short}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default PlanChooser;

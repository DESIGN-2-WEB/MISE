import { useMemo, useRef, useState } from 'react';
import { Check, Heart, History, Plus, X } from 'lucide-react';
import { getDayLabel } from '../../constants/planner';
import { useKitchen } from '../../context/kitchen';
import { useModalDialog } from '../../hooks/useModalDialog';
import { Link } from '../../router/Link';
import { createTitleMatcher } from '../../utils/search';

function PickerGroup({ title, icon: Icon, recipes, plannedIds, onPick }) {
  if (recipes.length === 0) return null;
  return (
    <section className="picker__group">
      <h3 className="picker__group-title">
        <Icon size={14} aria-hidden="true" /> {title}
      </h3>
      <ul className="picker__list">
        {recipes.map((recipe) => {
          const added = plannedIds.includes(recipe.id);
          return (
            <li key={recipe.id}>
              <button type="button" className="picker__item" onClick={() => onPick(recipe)} disabled={added}>
                {recipe.image ? (
                  <img className="picker__thumb" src={`${recipe.image}/small`} alt="" loading="lazy" />
                ) : (
                  <span className="picker__thumb" aria-hidden="true" />
                )}
                <span className="picker__title">{recipe.title}</span>
                <span className="picker__state" aria-hidden="true">
                  {added ? <Check size={16} /> : <Plus size={16} />}
                </span>
                <span className="visually-hidden">{added ? '(already planned)' : ''}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** Dialog for choosing saved or recently viewed recipes to add to a day. */
function RecipePicker({ dayId, plannedIds, onPick, onClose }) {
  const { favorites, recent } = useKitchen();
  const filterRef = useRef(null);
  const dialogRef = useModalDialog(filterRef);
  const [filter, setFilter] = useState('');

  const { saved, recentOnly } = useMemo(() => {
    const matches = filter.trim() ? createTitleMatcher(filter) : () => true;
    const withTitles = (list) => list.filter((recipe) => recipe.title && matches(recipe.title));
    const savedList = withTitles(favorites);
    const savedIds = new Set(savedList.map((recipe) => recipe.id));
    return { saved: savedList, recentOnly: withTitles(recent).filter((recipe) => !savedIds.has(recipe.id)) };
  }, [favorites, recent, filter]);

  const hasAnyRecipes = favorites.some((recipe) => recipe.title) || recent.length > 0;
  const dayLabel = getDayLabel(dayId);

  return (
    <dialog
      ref={dialogRef}
      className="modal modal--picker"
      aria-labelledby="picker-title"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="modal__panel picker">
        <header className="picker__header">
          <h2 className="picker__heading" id="picker-title">
            Add to {dayLabel}
          </h2>
          <button type="button" className="modal__close modal__close--inline" aria-label="Close" onClick={onClose}>
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        {hasAnyRecipes ? (
          <>
            <label className="visually-hidden" htmlFor="picker-filter">
              Filter recipes
            </label>
            <input
              ref={filterRef}
              id="picker-filter"
              type="search"
              className="picker__filter"
              placeholder="Filter your recipes…"
              autoComplete="off"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            />
            <div className="picker__groups">
              <PickerGroup title="Saved recipes" icon={Heart} recipes={saved} plannedIds={plannedIds} onPick={onPick} />
              <PickerGroup title="Recently viewed" icon={History} recipes={recentOnly} plannedIds={plannedIds} onPick={onPick} />
              {saved.length === 0 && recentOnly.length === 0 && (
                <p className="picker__empty">No recipes match “{filter}”.</p>
              )}
            </div>
          </>
        ) : (
          <div className="picker__empty">
            <p>Save recipes with the heart button, and they&apos;ll appear here ready to plan.</p>
            <Link to="/recipes" className="btn btn--primary">
              Browse recipes
            </Link>
          </div>
        )}

        <footer className="picker__footer">
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Done
          </button>
        </footer>
      </div>
    </dialog>
  );
}

export default RecipePicker;

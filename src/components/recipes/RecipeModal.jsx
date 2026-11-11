import { useCallback, useEffect, useRef, useState } from 'react';
import { useModalDialog } from '../../hooks/useModalDialog';
import {
  AlertTriangle,
  Carrot,
  ChefHat,
  ExternalLink,
  Heart,
  ListOrdered,
  PlayCircle,
  Printer,
  X,
} from 'lucide-react';
import { getRecipeById, peekRecipe } from '../../api/mealdb';
import { useAsync } from '../../hooks/useAsync';
import StatusMessage from '../ui/StatusMessage';
import CookingMode from './CookingMode';
import IngredientList from './IngredientList';
import PlanChooser from './PlanChooser';

function RecipeDetails({
  recipe,
  isFavorite,
  plannedDays,
  checkedIngredients,
  onToggleIngredient,
  onToggleFavorite,
  onTogglePlanDay,
  onStartCooking,
}) {
  const facts = [
    { label: 'Cuisine', value: recipe.cuisine ?? '—' },
    { label: 'Category', value: recipe.category ?? '—' },
    { label: 'Ingredients', value: recipe.ingredients.length },
    { label: 'Steps', value: recipe.steps.length },
  ];

  return (
    <article className="recipe-detail">
      {recipe.image && <img className="recipe-detail__hero" src={recipe.image} alt="" />}

      <div className="recipe-detail__body">
        <p className="print-only print-brand">Mise · Recipe Finder</p>

        {recipe.tags.length > 0 && (
          <ul className="recipe-detail__tags" aria-label="Tags">
            {recipe.tags.map((tag) => (
              <li key={tag} className="badge badge--soft">
                {tag}
              </li>
            ))}
          </ul>
        )}

        <h2 className="recipe-detail__title" id="recipe-modal-title">
          {recipe.title}
        </h2>

        <dl className="recipe-detail__facts">
          {facts.map((fact) => (
            <div key={fact.label} className="fact">
              <dt className="fact__label">{fact.label}</dt>
              <dd className="fact__value">{fact.value}</dd>
            </div>
          ))}
        </dl>

        <div className="recipe-detail__actions">
          <button type="button" className="btn btn--primary" onClick={onStartCooking} disabled={recipe.steps.length === 0}>
            <ChefHat size={16} aria-hidden="true" />
            Start cooking
          </button>
          <button
            type="button"
            className={`btn ${isFavorite ? 'btn--secondary' : 'btn--ghost'}`}
            aria-pressed={isFavorite}
            onClick={() => onToggleFavorite(recipe)}
          >
            <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} aria-hidden="true" />
            {isFavorite ? 'Saved' : 'Save'}
          </button>
          <button type="button" className="btn btn--ghost" onClick={() => window.print()}>
            <Printer size={16} aria-hidden="true" />
            Print
          </button>
          {recipe.videoUrl && (
            <a className="btn btn--ghost" href={recipe.videoUrl} target="_blank" rel="noopener noreferrer">
              <PlayCircle size={16} aria-hidden="true" />
              Video
            </a>
          )}
          {recipe.sourceUrl && (
            <a className="btn btn--ghost" href={recipe.sourceUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink size={16} aria-hidden="true" />
              Original
            </a>
          )}
        </div>

        <PlanChooser plannedDays={plannedDays} onToggleDay={(dayId) => onTogglePlanDay(dayId, recipe)} />

        <div className="recipe-detail__columns">
          <section aria-labelledby="ingredients-heading">
            <h3 className="recipe-detail__heading" id="ingredients-heading">
              <Carrot size={18} aria-hidden="true" /> Ingredients
            </h3>
            <IngredientList ingredients={recipe.ingredients} checked={checkedIngredients} onToggle={onToggleIngredient} />
          </section>

          <section aria-labelledby="method-heading">
            <h3 className="recipe-detail__heading" id="method-heading">
              <ListOrdered size={18} aria-hidden="true" /> Method
            </h3>
            {recipe.steps.length > 0 ? (
              <ol className="step-list">
                {recipe.steps.map((step, index) => (
                  <li key={index} className="step">
                    <span className="step__number" aria-hidden="true">
                      {index + 1}
                    </span>
                    <p className="step__text">{step}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="recipe-detail__empty">No instructions provided.</p>
            )}
          </section>
        </div>

        {recipe.sourceUrl && <p className="print-only print-source">Original recipe: {recipe.sourceUrl}</p>}
      </div>
    </article>
  );
}

function RecipeDetailsSkeleton({ title }) {
  return (
    <div className="recipe-detail" aria-busy="true">
      <div className="recipe-detail__hero skeleton" />
      <div className="recipe-detail__body">
        <h2 className="recipe-detail__title" id="recipe-modal-title">
          {title || <span className="skeleton skeleton--title" />}
        </h2>
        <div className="recipe-detail__facts">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="fact skeleton" style={{ height: 68 }} />
          ))}
        </div>
        {Array.from({ length: 5 }, (_, index) => (
          <span key={index} className="skeleton skeleton--text" style={{ display: 'block', marginBottom: 12 }} />
        ))}
      </div>
    </div>
  );
}

/**
 * Recipe details in a native <dialog>, which provides focus trapping, Escape
 * handling and an inert background for free. Switches to full-screen cooking mode.
 */
function RecipeModal({ recipe: selected, isFavorite, plannedDays, onToggleFavorite, onTogglePlanDay, onClose }) {
  const closeButtonRef = useRef(null);
  const dialogRef = useModalDialog(closeButtonRef);
  const [view, setView] = useState('details');
  const [checkedIngredients, setCheckedIngredients] = useState(() => new Set());

  const cached = selected.isComplete ? selected : peekRecipe(selected.id);
  const loadRecipe = useCallback(() => getRecipeById(selected.id), [selected.id]);
  const { data, error, status, retry } = useAsync(cached ? null : loadRecipe);
  const recipe = cached ?? data;
  const isCooking = view === 'cooking' && Boolean(recipe);

  // Each view starts at the top; returning from cooking mode puts focus back in the details.
  useEffect(() => {
    dialogRef.current?.querySelector('.modal__panel')?.scrollTo(0, 0);
    if (view === 'details') closeButtonRef.current?.focus();
  }, [view, dialogRef]);

  const toggleIngredient = useCallback((index) => {
    setCheckedIngredients((previous) => {
      const next = new Set(previous);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className={`modal${isCooking ? ' modal--cooking' : ''}`}
      aria-labelledby="recipe-modal-title"
      // Escape leaves cooking mode (handled inside CookingMode) instead of closing.
      onCancel={(event) => {
        if (isCooking) event.preventDefault();
      }}
      // Escape closes the dialog natively; keep React state in sync with it.
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget && !isCooking) onClose();
      }}
    >
      <div className="modal__panel">
        {isCooking ? (
          <CookingMode
            recipe={recipe}
            checkedIngredients={checkedIngredients}
            onToggleIngredient={toggleIngredient}
            onExit={() => setView('details')}
          />
        ) : (
          <>
            <button
              ref={closeButtonRef}
              type="button"
              className="modal__close"
              aria-label="Close recipe"
              onClick={onClose}
            >
              <X size={18} aria-hidden="true" />
            </button>

            {recipe ? (
              <RecipeDetails
                recipe={recipe}
                isFavorite={isFavorite}
                plannedDays={plannedDays}
                checkedIngredients={checkedIngredients}
                onToggleIngredient={toggleIngredient}
                onToggleFavorite={onToggleFavorite}
                onTogglePlanDay={onTogglePlanDay}
                onStartCooking={() => setView('cooking')}
              />
            ) : status === 'error' ? (
              <div className="modal__status">
                <h2 className="visually-hidden" id="recipe-modal-title">
                  {selected.title || 'Recipe'}
                </h2>
                <StatusMessage icon={AlertTriangle} tone="error" title="Couldn't load this recipe" description={error.message}>
                  <button type="button" className="btn btn--primary" onClick={retry}>
                    Try again
                  </button>
                </StatusMessage>
              </div>
            ) : (
              <RecipeDetailsSkeleton title={selected.title} />
            )}
          </>
        )}
      </div>
    </dialog>
  );
}

export default RecipeModal;

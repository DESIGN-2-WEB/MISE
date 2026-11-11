import { useState } from 'react';
import { Heart, ListChecks, ListOrdered, UtensilsCrossed } from 'lucide-react';

const MAX_ANIMATION_DELAY_MS = 400;

function RecipeCard({ recipe, index = 0, isFavorite, onToggleFavorite, onOpen }) {
  const [imageFailed, setImageFailed] = useState(false);
  const { title, image, cuisine, category, ingredients, steps, isComplete, isUnavailable } = recipe;
  // A card whose details failed to load stays openable: the modal retries the
  // lookup and offers its own "Try again".
  const displayTitle = title || (isUnavailable ? 'Saved recipe' : '');

  return (
    <article
      className="recipe-card"
      style={{ animationDelay: `${Math.min(index * 50, MAX_ANIMATION_DELAY_MS)}ms` }}
    >
      <div className="recipe-card__media">
        {image && !imageFailed ? (
          <img
            className="recipe-card__img"
            src={`${image}/medium`}
            alt=""
            loading="lazy"
            decoding="async"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="recipe-card__img recipe-card__img--placeholder" aria-hidden="true">
            <UtensilsCrossed size={36} />
          </div>
        )}
        {category && <span className="badge badge--overlay recipe-card__badge">{category}</span>}
      </div>

      <button
        type="button"
        className={`recipe-card__fav${isFavorite ? ' is-active' : ''}`}
        aria-pressed={isFavorite}
        aria-label={isFavorite ? `Remove ${displayTitle || 'recipe'} from saved` : `Save ${displayTitle || 'recipe'}`}
        onClick={() => onToggleFavorite(recipe)}
      >
        <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} aria-hidden="true" />
      </button>

      <div className="recipe-card__body">
        {cuisine ? (
          <p className="recipe-card__eyebrow">{cuisine}</p>
        ) : (
          !isComplete && !isUnavailable && <span className="skeleton skeleton--text recipe-card__eyebrow-skeleton" />
        )}

        <h3 className="recipe-card__title">
          {displayTitle ? (
            <button type="button" className="recipe-card__link" onClick={() => onOpen(recipe)}>
              {displayTitle}
            </button>
          ) : (
            <span className="skeleton skeleton--title" />
          )}
        </h3>

        <div className="recipe-card__meta">
          {isComplete ? (
            <>
              <span className="recipe-card__stat">
                <ListChecks size={14} aria-hidden="true" />
                {ingredients.length} ingredients
              </span>
              <span className="recipe-card__stat">
                <ListOrdered size={14} aria-hidden="true" />
                {steps.length} {steps.length === 1 ? 'step' : 'steps'}
              </span>
            </>
          ) : isUnavailable ? (
            <span className="recipe-card__stat">Couldn&apos;t load details — open to retry</span>
          ) : (
            <span className="skeleton skeleton--text recipe-card__meta-skeleton" />
          )}
        </div>
      </div>
    </article>
  );
}

export default RecipeCard;

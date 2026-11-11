import { History, UtensilsCrossed } from 'lucide-react';
import { useKitchen } from '../../context/kitchen';

/** Horizontal strip of recently opened recipes. Hidden until something has been viewed. */
function RecentlyViewed() {
  const { recent, openRecipe, clearRecent } = useKitchen();
  if (recent.length === 0) return null;

  return (
    <section className="section section--compact" id="recent" aria-labelledby="recent-title">
      <div className="container">
        <div className="recent__header">
          <h2 className="recent__title" id="recent-title">
            <History size={20} aria-hidden="true" /> Recently viewed
          </h2>
          <button type="button" className="btn btn--ghost btn--sm" onClick={clearRecent}>
            Clear history
          </button>
        </div>
        <ul className="recent__list">
          {recent.map((recipe) => (
            <li key={recipe.id}>
              <button type="button" className="recent-card" onClick={() => openRecipe(recipe)}>
                {recipe.image ? (
                  <img className="recent-card__img" src={`${recipe.image}/small`} alt="" loading="lazy" />
                ) : (
                  <span className="recent-card__img" aria-hidden="true">
                    <UtensilsCrossed size={20} />
                  </span>
                )}
                <span className="recent-card__text">
                  <span className="recent-card__title">{recipe.title}</span>
                  {recipe.category && <span className="recent-card__meta">{recipe.category}</span>}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default RecentlyViewed;

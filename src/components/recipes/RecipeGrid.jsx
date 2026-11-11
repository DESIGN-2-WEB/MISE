import { useKitchen } from '../../context/kitchen';
import RecipeCard from './RecipeCard';

function RecipeCardSkeleton() {
  return (
    <div className="recipe-card recipe-card--skeleton" aria-hidden="true">
      <div className="recipe-card__media">
        <div className="recipe-card__img skeleton" />
      </div>
      <div className="recipe-card__body">
        <span className="skeleton skeleton--text recipe-card__eyebrow-skeleton" />
        <span className="skeleton skeleton--title" />
        <span className="skeleton skeleton--text recipe-card__meta-skeleton" />
      </div>
    </div>
  );
}

function RecipeGrid({ recipes = [], loading = false, skeletonCount = 8 }) {
  const { isFavorite, toggleFavorite, openRecipe } = useKitchen();

  if (loading) {
    return (
      <div className="recipe-grid" aria-busy="true" aria-label="Loading recipes">
        {Array.from({ length: skeletonCount }, (_, index) => (
          <RecipeCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="recipe-grid">
      {recipes.map((recipe, index) => (
        <RecipeCard
          key={recipe.id}
          recipe={recipe}
          index={index}
          isFavorite={isFavorite(recipe.id)}
          onToggleFavorite={toggleFavorite}
          onOpen={openRecipe}
        />
      ))}
    </div>
  );
}

export default RecipeGrid;

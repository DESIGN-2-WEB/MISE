import { Heart } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import RecentlyViewed from '../components/recipes/RecentlyViewed';
import RecipeGrid from '../components/recipes/RecipeGrid';
import StatusMessage from '../components/ui/StatusMessage';
import { useKitchen } from '../context/kitchen';
import { useHydrated } from '../hooks/useHydrated';
import { useRecipeDetails } from '../hooks/useRecipeDetails';
import { Link } from '../router/Link';

function SavedRecipes() {
  const { favorites } = useKitchen();
  const recipes = useRecipeDetails(favorites);
  // Saved recipes live in this browser, so there is nothing to show until the page is running here.
  const hydrated = useHydrated();

  if (!hydrated) return <RecipeGrid loading skeletonCount={4} />;

  if (favorites.length === 0) {
    return (
      <StatusMessage icon={Heart} title="No saved recipes yet" description="Tap the heart on any recipe to keep it here for later.">
        <Link to="/recipes" className="btn btn--primary">
          Browse recipes
        </Link>
      </StatusMessage>
    );
  }

  return (
    <>
      <p className="results-header__count saved-count">
        {favorites.length} saved {favorites.length === 1 ? 'recipe' : 'recipes'}
      </p>
      <RecipeGrid recipes={recipes} />
    </>
  );
}

function SavedPage() {
  return (
    <>
      <PageHeader
        eyebrow="Your collection"
        title="Saved recipes"
        description="Recipes you've saved with the heart button. They're kept in this browser, on this device."
      />
      <section className="section section--tight" aria-label="Saved recipes">
        <div className="container">
          <SavedRecipes />
        </div>
      </section>
      <RecentlyViewed />
    </>
  );
}

export default SavedPage;

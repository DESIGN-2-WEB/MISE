import { useMemo, useState } from 'react';
import { AlertTriangle, ArrowRight, Shuffle } from 'lucide-react';
import { getAllRecipes } from '../api/mealdb';
import PageHeader from '../components/layout/PageHeader';
import RecipeGrid from '../components/recipes/RecipeGrid';
import CallToAction from '../components/ui/CallToAction';
import StatusMessage from '../components/ui/StatusMessage';
import { INSPIRATION_COUNT } from '../constants/config';
import { useAsync } from '../hooks/useAsync';
import { useRecipeDetails } from '../hooks/useRecipeDetails';
import { Link } from '../router/Link';
import { createRandom, randomSeed, sample } from '../utils/random';

const NO_RECIPES = [];

/** A random handful of recipes, picked from the loaded catalogue so shuffling is instant. */
function InspirationPage() {
  const { status, data: catalog, error, retry } = useAsync(getAllRecipes);
  const [seed, setSeed] = useState(randomSeed);

  const picks = useMemo(
    () => (catalog ? sample(catalog, INSPIRATION_COUNT, createRandom(seed)) : NO_RECIPES),
    [catalog, seed],
  );
  const recipes = useRecipeDetails(picks);

  return (
    <>
      <PageHeader
        eyebrow="Need ideas?"
        title="Today's inspiration"
        description="Not sure what to cook? Here's a random selection of recipes from around the world. Shuffle for a fresh set."
      >
        <div className="page-header__actions">
          <button type="button" className="btn btn--primary" onClick={() => setSeed(randomSeed())} disabled={!catalog}>
            <Shuffle size={16} aria-hidden="true" />
            Shuffle recipes
          </button>
        </div>
      </PageHeader>

      <section className="section section--tight" aria-label="Recipe ideas">
        <div className="container">
          {status === 'error' ? (
            <StatusMessage icon={AlertTriangle} tone="error" title="Couldn't load recipes" description={error.message}>
              <button type="button" className="btn btn--primary" onClick={retry}>
                Try again
              </button>
            </StatusMessage>
          ) : (
            <RecipeGrid loading={status !== 'success'} skeletonCount={INSPIRATION_COUNT} recipes={recipes} />
          )}
        </div>
      </section>

      <CallToAction title="Know what you're after?" text="Search by name or by the ingredients you already have.">
        <Link to="/recipes" className="btn btn--primary">
          Search recipes
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
        <Link to="/categories" className="btn btn--ghost">
          Browse categories
        </Link>
      </CallToAction>
    </>
  );
}

export default InspirationPage;

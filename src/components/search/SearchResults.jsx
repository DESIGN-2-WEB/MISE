import { useCallback, useMemo, useState } from 'react';
import { AlertTriangle, SearchX } from 'lucide-react';
import { findRecipes } from '../../api/mealdb';
import { getCuisineLabel } from '../../constants/catalog';
import { PAGE_SIZE } from '../../constants/config';
import { useAsync } from '../../hooks/useAsync';
import { useRecipeDetails } from '../../hooks/useRecipeDetails';
import { hasActiveSearch } from '../../hooks/useSearchCriteria';
import { sortRecipes } from '../../utils/recipe';
import RecipeGrid from '../recipes/RecipeGrid';
import StatusMessage from '../ui/StatusMessage';
import ActiveFilters from './ActiveFilters';
import FilterBar from './FilterBar';

const NO_RESULTS = [];

function describeResults({ query, mode, cuisine, category }) {
  if (query) return mode === 'ingredients' ? `Recipes with ${query}` : `Results for “${query}”`;
  if (!cuisine && !category) return 'All recipes';
  return `${[cuisine && getCuisineLabel(cuisine), category].filter(Boolean).join(' · ')} recipes`;
}

/** Filters and the matching recipes. With no criteria it lists the whole collection. */
function SearchResults({ criteria, onChange, onReset }) {
  const { query, mode, cuisine, category, sort } = criteria;

  const search = useCallback(
    () => findRecipes({ query, mode, cuisine, category }),
    [query, mode, cuisine, category],
  );
  const { status, data, error, retry } = useAsync(search);
  const sorted = useMemo(() => sortRecipes(data ?? NO_RESULTS, sort), [data, sort]);

  // Reset "Show more" whenever the result set changes, without an extra effect.
  const resultsKey = `${query}|${mode}|${cuisine}|${category}|${sort}`;
  const [page, setPage] = useState({ key: resultsKey, count: PAGE_SIZE });
  const visibleCount = page.key === resultsKey ? page.count : PAGE_SIZE;
  const visible = useRecipeDetails(sorted.slice(0, visibleCount));
  const remaining = sorted.length - visible.length;

  let content;
  if (status === 'error') {
    content = (
      <StatusMessage icon={AlertTriangle} tone="error" title="Something went wrong" description={error.message}>
        <button type="button" className="btn btn--primary" onClick={retry}>
          Try again
        </button>
      </StatusMessage>
    );
  } else if (status !== 'success') {
    content = <RecipeGrid loading skeletonCount={12} />;
  } else if (sorted.length === 0) {
    content = (
      <StatusMessage
        icon={SearchX}
        title="No recipes match"
        description="Try a different spelling, fewer ingredients, or remove a filter."
      >
        <button type="button" className="btn btn--ghost" onClick={onReset}>
          Clear all filters
        </button>
      </StatusMessage>
    );
  } else {
    content = (
      <>
        <RecipeGrid recipes={visible} />
        {remaining > 0 && (
          <div className="results-more">
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => setPage({ key: resultsKey, count: visibleCount + PAGE_SIZE })}
            >
              Show more recipes
            </button>
            <p className="results-more__count">
              Showing {visible.length} of {sorted.length}
            </p>
          </div>
        )}
      </>
    );
  }

  return (
    <section className="section section--tight" id="results" aria-labelledby="results-title">
      <div className="container">
        <FilterBar
          criteria={criteria}
          onChange={onChange}
          onClear={onReset}
          canClear={hasActiveSearch(criteria) || sort !== 'relevance'}
        />
        <ActiveFilters criteria={criteria} onChange={onChange} />
        <div className="results-header">
          <h2 className="results-header__title" id="results-title">
            {describeResults(criteria)}
          </h2>
          {status === 'success' && (
            <p className="results-header__count" aria-live="polite">
              {sorted.length} {sorted.length === 1 ? 'recipe' : 'recipes'}
            </p>
          )}
        </div>
        {content}
      </div>
    </section>
  );
}

export default SearchResults;

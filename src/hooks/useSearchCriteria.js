import { useCallback, useMemo } from 'react';
import { CATEGORIES, CUISINES, SEARCH_MODES, SORT_OPTIONS } from '../constants/catalog';
import { useLocation } from '../router/context';
import { replaceSearch } from '../router/history';

const DEFAULT_CRITERIA = {
  query: '',
  mode: 'name',
  cuisine: '',
  category: '',
  sort: 'relevance',
};

const pick = (value, allowed, fallback) => (allowed.includes(value) ? value : fallback);

/** Reads criteria from a query string, ignoring anything that isn't a known value. */
function parseCriteria(search) {
  const params = new URLSearchParams(search);
  return {
    query: (params.get('q') ?? '').trim(),
    mode: pick(params.get('mode'), SEARCH_MODES.map((mode) => mode.value), DEFAULT_CRITERIA.mode),
    cuisine: pick(params.get('cuisine'), CUISINES.map((cuisine) => cuisine.value), ''),
    category: pick(params.get('category'), CATEGORIES, ''),
    sort: pick(params.get('sort'), SORT_OPTIONS.map((option) => option.value), DEFAULT_CRITERIA.sort),
  };
}

/** The query string for some criteria, leaving out defaults: "q=pasta&cuisine=Italy". */
function toSearchString(criteria) {
  const { query, mode, cuisine, category, sort } = { ...DEFAULT_CRITERIA, ...criteria };
  const params = new URLSearchParams();
  if (query) {
    params.set('q', query);
    if (mode !== DEFAULT_CRITERIA.mode) params.set('mode', mode);
  }
  if (cuisine) params.set('cuisine', cuisine);
  if (category) params.set('category', category);
  if (sort !== DEFAULT_CRITERIA.sort) params.set('sort', sort);
  return params.toString();
}

/** Link to the recipe finder with a search applied, e.g. recipesHref({ category: 'Vegan' }). */
export function recipesHref(criteria = {}, hash = '#results') {
  const search = toSearchString(criteria);
  return `/recipes${search ? `?${search}` : ''}${hash}`;
}

export function hasActiveSearch({ query, cuisine, category }) {
  return Boolean(query || cuisine || category);
}

/** Search criteria live in the URL, so searches can be bookmarked, shared and restored. */
export function useSearchCriteria() {
  const { search } = useLocation();
  const criteria = useMemo(() => parseCriteria(search), [search]);

  /** Merges changes into the current criteria without reloading the page. */
  const updateCriteria = useCallback((changes) => {
    replaceSearch(toSearchString({ ...parseCriteria(window.location.search), ...changes }));
  }, []);

  const resetCriteria = useCallback(() => replaceSearch(''), []);

  return { criteria, updateCriteria, resetCriteria };
}

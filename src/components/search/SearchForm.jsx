import { useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { SEARCH_MODES } from '../../constants/catalog';
import { useKitchen } from '../../context/kitchen';
import { recipesHref } from '../../hooks/useSearchCriteria';
import { splitIngredientQuery, useSearchSuggestions } from '../../hooks/useSearchSuggestions';
import { navigate } from '../../router/history';
import { SEARCH_INPUT_ID } from '../../utils/dom';
import SuggestionList from './SuggestionList';

const LISTBOX_ID = 'search-suggestions';

/**
 * Search box with a suggestions dropdown (ARIA combobox pattern). Holds an
 * editable draft of the query; parents remount it (via `key`) when the active
 * search changes elsewhere, so the input always reflects the current search.
 */
function SearchForm({ initialQuery = '', initialMode = 'name', onSubmit }) {
  const { recent, openRecipe } = useKitchen();
  const [query, setQuery] = useState(initialQuery);
  const [mode, setMode] = useState(initialMode);
  const [isOpen, setIsOpen] = useState(false);
  const [hasFocused, setHasFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef(null);

  const activeMode = SEARCH_MODES.find((option) => option.value === mode) ?? SEARCH_MODES[0];
  const { suggestions, term } = useSearchSuggestions({ query, mode, recent, enabled: hasFocused });
  const showSuggestions = isOpen && suggestions.length > 0;
  const highlighted = showSuggestions && activeIndex < suggestions.length ? activeIndex : -1;

  const closeSuggestions = () => {
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const choose = (suggestion) => {
    if (suggestion.type === 'ingredient') {
      // Complete the ingredient being typed and leave room for the next one.
      const { done } = splitIngredientQuery(query);
      setQuery(`${[...done, suggestion.value].join(', ')}, `);
      setActiveIndex(-1);
      inputRef.current?.focus();
      return;
    }
    closeSuggestions();
    if (suggestion.recipe) openRecipe(suggestion.recipe);
    else if (suggestion.criteria) navigate(recipesHref(suggestion.criteria));
  };

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      if (suggestions.length === 0) return;
      event.preventDefault();
      setIsOpen(true);
      const last = suggestions.length - 1;
      setActiveIndex((index) => {
        if (event.key === 'ArrowDown') return index >= last ? 0 : index + 1;
        return index <= 0 ? last : index - 1;
      });
    } else if (event.key === 'Enter' && highlighted >= 0) {
      event.preventDefault();
      choose(suggestions[highlighted]);
    } else if (event.key === 'Escape' && showSuggestions) {
      event.preventDefault();
      closeSuggestions();
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    closeSuggestions();
    onSubmit({ query: query.trim().replace(/,\s*$/, ''), mode });
  };

  return (
    <form className="search-form" role="search" onSubmit={handleSubmit}>
      <fieldset className="search-form__modes">
        <legend className="visually-hidden">Search type</legend>
        {SEARCH_MODES.map((option) => (
          <label key={option.value} className={`search-form__mode${mode === option.value ? ' is-active' : ''}`}>
            <input
              type="radio"
              name="search-mode"
              value={option.value}
              checked={mode === option.value}
              onChange={() => {
                setMode(option.value);
                setActiveIndex(-1);
              }}
            />
            {option.label}
          </label>
        ))}
      </fieldset>

      <div className="search-form__box">
        <Search className="search-form__icon" size={20} aria-hidden="true" />
        <label htmlFor={SEARCH_INPUT_ID} className="visually-hidden">
          {mode === 'ingredients' ? 'Ingredients' : 'Recipe name'}
        </label>
        <input
          ref={inputRef}
          id={SEARCH_INPUT_ID}
          type="search"
          className="search-form__input"
          placeholder={activeMode.placeholder}
          autoComplete="off"
          enterKeyHint="search"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showSuggestions}
          aria-controls={LISTBOX_ID}
          aria-activedescendant={highlighted >= 0 ? `${LISTBOX_ID}-${highlighted}` : undefined}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => {
            setHasFocused(true);
            setIsOpen(true);
          }}
          onBlur={closeSuggestions}
          onKeyDown={handleKeyDown}
        />
        <button type="submit" className="search-form__submit">
          Search
        </button>

        {showSuggestions && (
          <SuggestionList
            id={LISTBOX_ID}
            suggestions={suggestions}
            activeIndex={highlighted}
            term={term}
            onChoose={choose}
            onHover={setActiveIndex}
          />
        )}
      </div>

      <p className="search-form__hint">
        {mode === 'ingredients'
          ? 'Separate ingredients with commas. Results use all of them.'
          : 'Search by dish, ingredient, cuisine or category.'}
      </p>
    </form>
  );
}

export default SearchForm;

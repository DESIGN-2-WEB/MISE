import { Carrot, Clock, Globe2, LayoutGrid, UtensilsCrossed } from 'lucide-react';

const TYPE_ICONS = {
  category: LayoutGrid,
  cuisine: Globe2,
  ingredient: Carrot,
  recent: Clock,
  recipe: UtensilsCrossed,
};

/** Bolds the first occurrence of `term` in `text`. */
function Highlight({ text, term }) {
  const index = term ? text.toLowerCase().indexOf(term.toLowerCase()) : -1;
  if (index < 0) return text;
  return (
    <>
      {text.slice(0, index)}
      <mark>{text.slice(index, index + term.length)}</mark>
      {text.slice(index + term.length)}
    </>
  );
}

function SuggestionList({ id, suggestions, activeIndex, term, onChoose, onHover }) {
  return (
    <ul className="suggestions" id={id} role="listbox" aria-label="Search suggestions">
      {suggestions.map((suggestion, index) => {
        const Icon = TYPE_ICONS[suggestion.type];
        return (
          <li
            key={suggestion.id}
            id={`${id}-${index}`}
            role="option"
            aria-selected={index === activeIndex}
            className={`suggestion${index === activeIndex ? ' is-active' : ''}`}
            // Keep focus in the input so the list doesn't close before the click lands.
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => onChoose(suggestion)}
            onMouseEnter={() => onHover(index)}
          >
            {suggestion.image ? (
              <img className="suggestion__thumb" src={`${suggestion.image}/small`} alt="" loading="lazy" />
            ) : (
              <span className="suggestion__icon" aria-hidden="true">
                <Icon size={16} />
              </span>
            )}
            <span className="suggestion__label">
              <Highlight text={suggestion.label} term={term} />
            </span>
            {suggestion.meta && <span className="suggestion__meta">{suggestion.meta}</span>}
          </li>
        );
      })}
    </ul>
  );
}

export default SuggestionList;

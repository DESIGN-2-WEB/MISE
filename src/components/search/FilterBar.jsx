import { CATEGORIES, CUISINES, SORT_OPTIONS } from '../../constants/catalog';

function FilterSelect({ id, label, value, onChange, children }) {
  return (
    <div className="filters__group">
      <label className="filters__label" htmlFor={id}>
        {label}
      </label>
      <select className="filters__select" id={id} value={value} onChange={(event) => onChange(event.target.value)}>
        {children}
      </select>
    </div>
  );
}

function FilterBar({ criteria, onChange, onClear, canClear }) {
  return (
    <div className="filters">
      <FilterSelect id="cuisine-filter" label="Cuisine" value={criteria.cuisine} onChange={(cuisine) => onChange({ cuisine })}>
        <option value="">All cuisines</option>
        {CUISINES.map((cuisine) => (
          <option key={cuisine.value} value={cuisine.value}>
            {cuisine.label}
          </option>
        ))}
      </FilterSelect>

      <FilterSelect id="category-filter" label="Category" value={criteria.category} onChange={(category) => onChange({ category })}>
        <option value="">All categories</option>
        {CATEGORIES.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </FilterSelect>

      <FilterSelect id="sort-filter" label="Sort by" value={criteria.sort} onChange={(sort) => onChange({ sort })}>
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </FilterSelect>

      <button type="button" className="btn btn--ghost filters__clear" onClick={onClear} disabled={!canClear}>
        Clear all
      </button>
    </div>
  );
}

export default FilterBar;

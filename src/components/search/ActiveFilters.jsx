import { X } from 'lucide-react';
import { getCuisineLabel } from '../../constants/catalog';

function ActiveFilters({ criteria, onChange }) {
  const chips = [];

  if (criteria.query) {
    chips.push({
      key: 'query',
      label: criteria.mode === 'ingredients' ? `Ingredients: ${criteria.query}` : `Name: “${criteria.query}”`,
      clear: { query: '' },
    });
  }
  if (criteria.cuisine) {
    chips.push({ key: 'cuisine', label: `Cuisine: ${getCuisineLabel(criteria.cuisine)}`, clear: { cuisine: '' } });
  }
  if (criteria.category) {
    chips.push({ key: 'category', label: `Category: ${criteria.category}`, clear: { category: '' } });
  }

  if (chips.length === 0) return null;

  return (
    <ul className="active-filters" aria-label="Active filters">
      {chips.map((chip) => (
        <li key={chip.key}>
          <button
            type="button"
            className="chip chip--removable"
            aria-label={`Remove filter ${chip.label}`}
            onClick={() => onChange(chip.clear)}
          >
            {chip.label}
            <X size={14} aria-hidden="true" />
          </button>
        </li>
      ))}
    </ul>
  );
}

export default ActiveFilters;

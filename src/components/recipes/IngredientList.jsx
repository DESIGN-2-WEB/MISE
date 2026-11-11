import { getIngredientImage } from '../../utils/recipe';

/** Ingredient checklist. `checked` is a Set of indexes, owned by the parent. */
function IngredientList({ ingredients, checked, onToggle, compact = false }) {
  if (ingredients.length === 0) return <p className="recipe-detail__empty">No ingredients listed.</p>;

  return (
    <ul className={`ingredient-list${compact ? ' ingredient-list--compact' : ''}`}>
      {ingredients.map((ingredient, index) => (
        <li key={`${ingredient.name}-${index}`}>
          <label className={`ingredient${checked.has(index) ? ' is-checked' : ''}`}>
            <input type="checkbox" checked={checked.has(index)} onChange={() => onToggle(index)} />
            {!compact && (
              <img
                className="ingredient__img"
                src={getIngredientImage(ingredient.name)}
                alt=""
                loading="lazy"
                onError={(event) => {
                  event.currentTarget.style.visibility = 'hidden';
                }}
              />
            )}
            <span className="ingredient__name">{ingredient.name}</span>
            {ingredient.measure && <span className="ingredient__measure">{ingredient.measure}</span>}
          </label>
        </li>
      ))}
    </ul>
  );
}

export default IngredientList;

import { CUISINES } from '../../constants/catalog';
import { recipesHref } from '../../hooks/useSearchCriteria';
import { Link } from '../../router/Link';

/** Chips linking to recipes for each cuisine (all of them, or the given cuisine values). */
function CuisineList({ cuisines }) {
  const items = cuisines ? CUISINES.filter((cuisine) => cuisines.includes(cuisine.value)) : CUISINES;
  return (
    <ul className="cuisine-list">
      {items.map((cuisine) => (
        <li key={cuisine.value}>
          <Link to={recipesHref({ cuisine: cuisine.value })} className="chip">
            {cuisine.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default CuisineList;

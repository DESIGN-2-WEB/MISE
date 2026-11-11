import { CATEGORIES, categoryImage } from '../../constants/catalog';
import { recipesHref } from '../../hooks/useSearchCriteria';
import { Link } from '../../router/Link';

/** Links to every recipe category. Static, so the links are crawlable in prerendered pages. */
function CategoryGrid({ categories = CATEGORIES }) {
  return (
    <ul className="categories-grid">
      {categories.map((category) => (
        <li key={category}>
          <Link to={recipesHref({ category })} className="category-card">
            <img className="category-card__img" src={categoryImage(category)} alt="" width="160" height="100" loading="lazy" />
            <span className="category-card__name">{category}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default CategoryGrid;

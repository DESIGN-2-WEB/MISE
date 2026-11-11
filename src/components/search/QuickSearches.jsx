import { QUICK_SEARCHES } from '../../constants/catalog';
import { recipesHref } from '../../hooks/useSearchCriteria';
import { Link } from '../../router/Link';

function QuickSearches() {
  return (
    <div className="quick-searches">
      <span className="quick-searches__label">Popular:</span>
      {QUICK_SEARCHES.map((item) => (
        <Link key={item.label} to={recipesHref(item.criteria)} className="chip">
          {item.label}
        </Link>
      ))}
    </div>
  );
}

export default QuickSearches;

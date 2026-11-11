import { ArrowRight, LayoutGrid } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import CallToAction from '../components/ui/CallToAction';
import { CUISINES } from '../constants/catalog';
import { recipesHref } from '../hooks/useSearchCriteria';
import { Link } from '../router/Link';

function CuisinesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Browse"
        title="World cuisines"
        description={`Recipes from ${CUISINES.length} cuisines around the world. Pick a country and see what people cook there.`}
      />

      <section className="section section--tight" aria-label="All cuisines">
        <div className="container">
          <ul className="cuisine-grid">
            {CUISINES.map((cuisine) => (
              <li key={cuisine.value}>
                <Link to={recipesHref({ cuisine: cuisine.value })} className="cuisine-card">
                  <span className="cuisine-card__name">{cuisine.label}</span>
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CallToAction title="Looking for a particular kind of dish?" text="Browse by category instead, from breakfast to dessert.">
        <Link to="/categories" className="btn btn--primary">
          <LayoutGrid size={16} aria-hidden="true" />
          Browse categories
        </Link>
        <Link to="/recipes" className="btn btn--ghost">
          Search all recipes
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </CallToAction>
    </>
  );
}

export default CuisinesPage;

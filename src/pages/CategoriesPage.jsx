import { ArrowRight, Globe2 } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import CategoryGrid from '../components/recipes/CategoryGrid';
import CallToAction from '../components/ui/CallToAction';
import { CATEGORIES } from '../constants/catalog';
import { Link } from '../router/Link';

function CategoriesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Browse"
        title="Recipe categories"
        description={`All ${CATEGORIES.length} categories, from hearty beef dishes to light vegan plates. Pick one to see every recipe in it.`}
      />

      <section className="section section--tight" aria-label="All categories">
        <div className="container">
          <CategoryGrid />
        </div>
      </section>

      <CallToAction
        title="Prefer to browse by country?"
        text="Explore recipes from 37 cuisines, or search for something specific."
      >
        <Link to="/cuisines" className="btn btn--primary">
          <Globe2 size={16} aria-hidden="true" />
          Browse cuisines
        </Link>
        <Link to="/recipes" className="btn btn--ghost">
          Search all recipes
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </CallToAction>
    </>
  );
}

export default CategoriesPage;

import { useEffect } from 'react';
import { ArrowRight, Globe2, LayoutGrid, Sparkles } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import QuickSearches from '../components/search/QuickSearches';
import SearchForm from '../components/search/SearchForm';
import SearchResults from '../components/search/SearchResults';
import { useSearchCriteria } from '../hooks/useSearchCriteria';
import { useLocation } from '../router/context';
import { Link } from '../router/Link';
import { focusSearchInput, scrollToSection } from '../utils/dom';

const EXPLORE_LINKS = [
  { to: '/categories', icon: LayoutGrid, title: 'Browse categories', text: 'Beef, seafood, vegetarian, dessert and more.' },
  { to: '/cuisines', icon: Globe2, title: 'Browse cuisines', text: 'Recipes from 37 countries around the world.' },
  { to: '/inspiration', icon: Sparkles, title: 'Get inspiration', text: "Can't decide? Let us pick something for you." },
];

function RecipesPage() {
  const { criteria, updateCriteria, resetCriteria } = useSearchCriteria();
  const { hash } = useLocation();

  // Arriving from "Find a recipe" puts the cursor straight into the search box.
  useEffect(() => {
    if (hash === '#search') focusSearchInput();
  }, [hash]);

  return (
    <>
      <PageHeader
        eyebrow="Recipe finder"
        title="Browse recipes"
        description="Search nearly 800 recipes by name or by the ingredients you already have, then narrow them down by cuisine and category."
      >
        <div className="page-header__search" id="search">
          <SearchForm
            key={`${criteria.query}|${criteria.mode}`}
            initialQuery={criteria.query}
            initialMode={criteria.mode}
            onSubmit={(changes) => {
              updateCriteria(changes);
              scrollToSection('results');
            }}
          />
          <QuickSearches />
        </div>
      </PageHeader>

      <SearchResults criteria={criteria} onChange={updateCriteria} onReset={resetCriteria} />

      <section className="section section--alt" aria-labelledby="explore-title">
        <div className="container">
          <h2 className="explore-title" id="explore-title">
            Keep exploring
          </h2>
          <ul className="explore-links">
            {EXPLORE_LINKS.map(({ to, icon: Icon, title, text }) => (
              <li key={to}>
                <Link to={to} className="explore-card">
                  <span className="explore-card__icon" aria-hidden="true">
                    <Icon size={22} />
                  </span>
                  <span className="explore-card__text">
                    <span className="explore-card__title">{title}</span>
                    <span className="explore-card__subtitle">{text}</span>
                  </span>
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}

export default RecipesPage;

import { getCuisineLabel, POPULAR_CUISINES } from '../../constants/catalog';
import { DATA_SOURCE, SITE } from '../../constants/site';
import { recipesHref } from '../../hooks/useSearchCriteria';
import { Link } from '../../router/Link';
import InstallAppButton from './InstallAppButton';

const FOOTER_COLUMNS = [
  {
    title: 'Explore',
    links: [
      { to: '/recipes', label: 'Browse recipes' },
      { to: '/categories', label: 'Categories' },
      { to: '/cuisines', label: 'Cuisines' },
      { to: '/inspiration', label: 'Recipe ideas' },
    ],
  },
  {
    title: 'Your kitchen',
    links: [
      { to: '/saved', label: 'Saved recipes' },
      { to: '/planner', label: 'Meal planner' },
    ],
  },
  {
    title: 'Popular',
    links: [
      ...POPULAR_CUISINES.slice(0, 3).map((cuisine) => ({
        to: recipesHref({ cuisine }),
        label: `${getCuisineLabel(cuisine)} recipes`,
      })),
      { to: recipesHref({ category: 'Vegetarian' }), label: 'Vegetarian recipes' },
      { to: recipesHref({ category: 'Dessert' }), label: 'Desserts' },
    ],
  },
  {
    title: 'Company',
    links: [
      { to: '/about', label: 'About us' },
      { to: '/contact', label: 'Contact us' },
      { to: '/privacy', label: 'Privacy policy' },
      { to: '/terms', label: 'Terms of use' },
    ],
  },
];


function SiteFooter() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <Link to="/" className="footer__logo">
            Mise
          </Link>
          <p className="footer__tagline">
            {SITE.tagline} A free recipe finder with a weekly meal planner and step-by-step cooking mode.
          </p>
          <InstallAppButton className="btn btn--ghost btn--sm footer__install" />
        </div>

        <nav className="footer__links" aria-label="Footer">
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title} className="footer__col">
              <h2 className="footer__heading">{column.title}</h2>
              <ul>
                {column.links.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className="footer__bottom">
        <p>
          © <span suppressHydrationWarning>{new Date().getFullYear()}</span> {SITE.name}. Recipe data and images from{' '}
          <a href={DATA_SOURCE.url} target="_blank" rel="noopener noreferrer">
            {DATA_SOURCE.name}
          </a>
          .
        </p>
      </div>
    </footer>
  );
}

export default SiteFooter;

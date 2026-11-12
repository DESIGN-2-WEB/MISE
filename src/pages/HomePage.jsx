import { ArrowRight, CalendarDays, Sparkles, Timer } from 'lucide-react';
import InstallAppButton from '../components/layout/InstallAppButton';
import ThemeToggle from '../components/layout/ThemeToggle';
import { CATEGORIES, CUISINES } from '../constants/catalog';
import { SITE } from '../constants/site';
import { Link } from '../router/Link';

const MEAL_IMAGE_URL = 'https://www.themealdb.com/images/media/meals';

const DISHES = [
  { title: 'Lasagne', meta: 'Italian · Pasta', image: `${MEAL_IMAGE_URL}/wtsvxx1511296896.jpg`, variant: 'main' },
  { title: 'Pad See Ew', meta: 'Thai · Chicken', image: `${MEAL_IMAGE_URL}/uuuspp1468263334.jpg`, variant: 'top' },
  { title: 'Shakshuka', meta: 'Egyptian · Vegetarian', image: `${MEAL_IMAGE_URL}/g373701551450225.jpg`, variant: 'bottom' },
];

const STATS = [
  { value: 'Nearly 800', label: 'recipes' },
  { value: String(CUISINES.length), label: 'cuisines' },
  { value: String(CATEGORIES.length), label: 'categories' },
  { value: 'No', label: 'sign-up' },
];

const ENTRANCE_LINKS = [
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
  { to: '/privacy', label: 'Privacy' },
  { to: '/terms', label: 'Terms' },
];

/**
 * The entrance to the site: one screen, no scrolling. Everything else lives on
 * its own page, so this only welcomes visitors and points them inside.
 */
function HomePage() {
  return (
    <section className="entrance">
      <div className="entrance__glow" aria-hidden="true" />

      <div className="entrance__theme">
        <ThemeToggle />
      </div>

      <div className="entrance__inner">
        <div className="entrance__content">
          <p className="eyebrow-pill">
            <Sparkles size={15} aria-hidden="true" />
            Free recipe finder &amp; meal planner
          </p>
          <h1 className="entrance__title">
            <span className="entrance__logo">{SITE.name}</span>
            <span className="entrance__tagline">{SITE.tagline}</span>
          </h1>
          <p className="entrance__intro">
            Nearly 800 recipes you can search by name or by what&apos;s already in your kitchen, a weekly meal planner,
            and a step-by-step cooking mode with built-in timers.
          </p>

          <div className="entrance__actions">
            <Link to="/recipes" className="btn btn--primary btn--lg">
              Browse recipes
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link to="/planner" className="btn btn--ghost btn--lg">
              <CalendarDays size={18} aria-hidden="true" />
              Plan your week
            </Link>
          </div>

          <ul className="entrance__stats">
            {STATS.map((stat) => (
              <li key={stat.label}>
                <strong>{stat.value}</strong> {stat.label}
              </li>
            ))}
          </ul>
        </div>

        <div className="entrance__visual">
          {DISHES.map((dish) => (
            <figure key={dish.title} className={`entrance-dish entrance-dish--${dish.variant}`}>
              <img
                src={`${dish.image}/medium`}
                alt={dish.title}
                width="700"
                height="700"
                fetchPriority={dish.variant === 'main' ? 'high' : 'auto'}
              />
              <figcaption>
                <strong>{dish.title}</strong>
                <span>{dish.meta}</span>
              </figcaption>
            </figure>
          ))}
          <div className="entrance-chip entrance-chip--timer" aria-hidden="true">
            <Timer size={16} />
            <span>Simmer</span>
            <strong>12:00</strong>
          </div>
          <div className="entrance-chip entrance-chip--plan" aria-hidden="true">
            <CalendarDays size={16} />
            <span>Added to Friday</span>
          </div>
        </div>
      </div>

      <nav className="entrance__links" aria-label="About this site">
        {ENTRANCE_LINKS.map((link) => (
          <Link key={link.to} to={link.to}>
            {link.label}
          </Link>
        ))}
        <InstallAppButton className="entrance__install" iconSize={15} />
      </nav>
    </section>
  );
}

export default HomePage;

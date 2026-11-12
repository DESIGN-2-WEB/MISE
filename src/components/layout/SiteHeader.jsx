import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { useKitchen } from '../../context/kitchen';
import { useCanInstall } from '../../hooks/useInstallState';
import { useLocation } from '../../router/context';
import { Link, NavLink } from '../../router/Link';
import { focusSearchInput } from '../../utils/dom';
import InstallAppButton from './InstallAppButton';
import ThemeToggle from './ThemeToggle';

// About, Contact and the legal pages live in the footer, as on most sites.
const NAV_LINKS = [
  { to: '/recipes', label: 'Recipes' },
  { to: '/categories', label: 'Categories' },
  { to: '/cuisines', label: 'Cuisines' },
  { to: '/inspiration', label: 'Inspiration' },
  { to: '/saved', label: 'Saved', countKey: 'saved' },
  { to: '/planner', label: 'Planner', countKey: 'planned' },
];

function SiteHeader() {
  const { favorites, plannedCount } = useKitchen();
  const { pathname, key } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const canInstall = useCanInstall();
  const counts = { saved: favorites.length, planned: plannedCount };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close the mobile menu after navigating, or with Escape.
  useEffect(() => {
    setMenuOpen(false);
  }, [key]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [menuOpen]);

  return (
    <header className={`nav${scrolled || menuOpen ? ' is-scrolled' : ''}`}>
      <div className="nav__inner">
        <Link to="/" className="nav__logo">
          Mise
        </Link>

        <nav className="nav__menu" aria-label="Main">
          <ul className={`nav__links${menuOpen ? ' is-open' : ''}`} id="site-menu">
            {NAV_LINKS.map((link) => {
              const count = link.countKey ? counts[link.countKey] : 0;
              return (
                <li key={link.to}>
                  <NavLink to={link.to} className="nav__link" onClick={() => setMenuOpen(false)}>
                    {link.label}
                    {count > 0 && (
                      <span className="nav__count" aria-label={`(${count})`}>
                        {count}
                      </span>
                    )}
                  </NavLink>
                </li>
              );
            })}
            {/* Phones only: desktop browsers offer install in the address bar, and the footer has a button. */}
            {canInstall && (
              <li className="nav__install-item">
                <InstallAppButton className="nav__link nav__install" iconSize={18} />
              </li>
            )}
          </ul>
        </nav>

        <ThemeToggle />

        <Link
          to="/recipes#search"
          className="btn btn--primary btn--sm nav__cta"
          onClick={() => {
            if (pathname === '/recipes') focusSearchInput();
          }}
        >
          <Search size={16} aria-hidden="true" />
          Find a recipe
        </Link>

        <button
          type="button"
          className={`nav__hamburger${menuOpen ? ' is-open' : ''}`}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="site-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}

export default SiteHeader;

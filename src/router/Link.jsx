import { preloadRoute } from '../routes';
import { scrollToSection, scrollToTop } from '../utils/dom';
import { useLocation } from './context';
import { navigate } from './history';

const isModifiedClick = (event) =>
  event.button !== 0 || event.metaKey || event.altKey || event.ctrlKey || event.shiftKey;

const preload = (to) => preloadRoute(new URL(to, 'http://localhost').pathname).catch(() => {});

/**
 * An <a> that navigates without a full page reload. Links to the current page
 * (optionally with a #section) just scroll, keeping any search in the URL.
 * The target page's code starts loading on hover or focus, and navigation
 * waits for it, so the current page never flashes a loading state.
 */
export function Link({ to, replace = false, onClick, onMouseEnter, onFocus, ref, ...props }) {
  const handleClick = (event) => {
    onClick?.(event);
    if (event.defaultPrevented || isModifiedClick(event) || props.target === '_blank' || props.download != null) return;

    const url = new URL(to, window.location.href);
    if (url.origin !== window.location.origin) return;
    event.preventDefault();

    if (url.pathname === window.location.pathname && !url.search) {
      const { pathname, search } = window.location;
      window.history.replaceState(window.history.state, '', pathname + search + url.hash);
      if (url.hash) scrollToSection(decodeURIComponent(url.hash.slice(1)));
      else scrollToTop();
      return;
    }

    preload(url.pathname).then(() => navigate(url.pathname + url.search + url.hash, { replace }));
  };

  return (
    <a
      ref={ref}
      href={to}
      onClick={handleClick}
      onMouseEnter={(event) => {
        onMouseEnter?.(event);
        preload(to);
      }}
      onFocus={(event) => {
        onFocus?.(event);
        preload(to);
      }}
      {...props}
    />
  );
}

/** A Link that marks itself with aria-current="page" when its page is open. */
export function NavLink({ to, className = '', ...props }) {
  const location = useLocation();
  const isActive = new URL(to, 'http://localhost').pathname === location.pathname;
  return (
    <Link
      to={to}
      className={`${className}${isActive ? ' is-active' : ''}`}
      aria-current={isActive ? 'page' : undefined}
      {...props}
    />
  );
}

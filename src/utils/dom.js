const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const behavior = (smooth) => (smooth && !prefersReducedMotion() ? 'smooth' : 'auto');

export function scrollToSection(id, { smooth = true } = {}) {
  document.getElementById(id)?.scrollIntoView({ behavior: behavior(smooth), block: 'start' });
}

export function scrollToTop({ smooth = true } = {}) {
  window.scrollTo({ top: 0, behavior: behavior(smooth) });
}

export const SEARCH_INPUT_ID = 'recipe-search';

export function focusSearchInput() {
  document.getElementById(SEARCH_INPUT_ID)?.focus({ preventScroll: true });
}

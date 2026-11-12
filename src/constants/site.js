/**
 * Site-wide settings for SEO, legal pages and contact details.
 * Set VITE_SITE_URL and VITE_CONTACT_EMAIL (see .env.example) before deploying.
 */
const PLACEHOLDER_URL = 'https://www.example.com';
const PLACEHOLDER_EMAIL = 'hello@example.com';

const siteUrl = (import.meta.env.VITE_SITE_URL || PLACEHOLDER_URL).replace(/\/+$/, '');
const contactEmail = import.meta.env.VITE_CONTACT_EMAIL || PLACEHOLDER_EMAIL;

export const SITE = {
  name: 'Mise',
  tagline: 'Find it. Plan it. Cook it.',
  description:
    'Mise is a free recipe finder. Search nearly 800 recipes by name or ingredients, plan your week and cook step by step with built-in timers.',
  url: siteUrl,
  contactEmail,
  language: 'en',
  locale: 'en_GB',
  ogImage: '/og-image.png',
  logo: '/icons/icon-512.png',
};

export const DATA_SOURCE = { name: 'TheMealDB', url: 'https://www.themealdb.com' };

/** Shown at the top of the privacy policy and terms of use. */
export const LEGAL_LAST_UPDATED = { iso: '2026-11-12', label: '12 November 2026' };

/** Settings still using placeholders; the build prints a warning for each. */
export const SITE_CONFIG_WARNINGS = [
  siteUrl === PLACEHOLDER_URL && 'VITE_SITE_URL is not set, so canonical URLs and the sitemap use example.com.',
  contactEmail === PLACEHOLDER_EMAIL && 'VITE_CONTACT_EMAIL is not set, so the contact pages show hello@example.com.',
].filter(Boolean);

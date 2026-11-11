/**
 * Search engine and social metadata for every page. Titles are completed with
 * " | Mise" (except the home page); keep descriptions under about 155 characters.
 * Pages with `sitemap: true` are listed in sitemap.xml.
 */
export const PAGE_META = {
  home: {
    path: '/',
    title: 'Mise – Free Recipe Finder, Meal Planner & Cooking Mode',
    description:
      'Find recipes by name or by the ingredients you have, filter by cuisine, plan your week and cook step by step with built-in timers. Free, no sign-up.',
    sitemap: true,
  },
  recipes: {
    path: '/recipes',
    title: 'Browse Recipes by Ingredient, Cuisine & Category',
    description:
      'Search nearly 800 recipes by name or ingredients, then filter by 37 cuisines and 14 categories, from quick vegetarian dinners to desserts.',
    type: 'CollectionPage',
    breadcrumb: 'Recipes',
    sitemap: true,
  },
  categories: {
    path: '/categories',
    title: 'Recipe Categories: Chicken, Vegetarian, Dessert & More',
    description:
      'Browse recipes by category: beef, chicken, seafood, pasta, vegetarian, vegan, breakfast, dessert and more. 14 categories to pick from.',
    type: 'CollectionPage',
    breadcrumb: 'Categories',
    sitemap: true,
  },
  cuisines: {
    path: '/cuisines',
    title: 'Recipes by Cuisine: Italian, Indian, Thai & 34 More',
    description:
      'Explore recipes from 37 world cuisines, including Italian, Indian, Mexican, Thai, Japanese, French and Chinese cooking.',
    type: 'CollectionPage',
    breadcrumb: 'Cuisines',
    sitemap: true,
  },
  inspiration: {
    path: '/inspiration',
    title: 'Recipe Ideas: What Should I Cook Tonight?',
    description:
      "Stuck for dinner ideas? Get a random selection of recipes from around the world, and shuffle until something takes your fancy.",
    breadcrumb: 'Inspiration',
    sitemap: true,
  },
  planner: {
    path: '/planner',
    title: 'Weekly Meal Planner',
    description:
      'Plan your meals for the week: add saved recipes to any day, see what is on today and print your plan. Free, with no account needed.',
    breadcrumb: 'Meal planner',
    sitemap: true,
  },
  saved: {
    path: '/saved',
    title: 'Saved Recipes',
    description: 'The recipes you have saved in Mise, kept in this browser.',
    robots: 'noindex, follow',
    breadcrumb: 'Saved recipes',
  },
  about: {
    path: '/about',
    title: 'About Us',
    description:
      'Mise is a free, privacy-friendly recipe finder that helps you decide what to cook, plan your week and cook step by step.',
    type: 'AboutPage',
    breadcrumb: 'About',
    sitemap: true,
  },
  contact: {
    path: '/contact',
    title: 'Contact Us',
    description: 'Questions, feedback or a problem with a recipe? Get in touch with the Mise team.',
    type: 'ContactPage',
    breadcrumb: 'Contact',
    sitemap: true,
  },
  privacy: {
    path: '/privacy',
    title: 'Privacy Policy',
    description:
      'How Mise handles your information: no accounts, no tracking or advertising cookies, and your saved recipes stay on your device.',
    breadcrumb: 'Privacy policy',
    sitemap: true,
  },
  terms: {
    path: '/terms',
    title: 'Terms of Use',
    description: 'The terms for using Mise, including recipe content, food safety, acceptable use and liability.',
    breadcrumb: 'Terms of use',
    sitemap: true,
  },
  notFound: {
    path: null,
    title: 'Page Not Found',
    description: 'Sorry, the page you were looking for could not be found.',
    robots: 'noindex, follow',
  },
};

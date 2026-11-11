/**
 * Static catalogue data for TheMealDB.
 *
 * TheMealDB's area filter is inconsistent: some cuisines only match their
 * country name ("France", "United States"), others match either form. Using
 * the country name as the filter value works for every cuisine, so `value`
 * is what we send to the API and `label` is what we show to people.
 */
export const CUISINES = [
  { label: 'Algerian', value: 'Algeria' },
  { label: 'American', value: 'United States' },
  { label: 'Argentinian', value: 'Argentina' },
  { label: 'Australian', value: 'Australia' },
  { label: 'British', value: 'United Kingdom' },
  { label: 'Canadian', value: 'Canada' },
  { label: 'Chinese', value: 'China' },
  { label: 'Croatian', value: 'Croatia' },
  { label: 'Dutch', value: 'Netherlands' },
  { label: 'Egyptian', value: 'Egypt' },
  { label: 'Filipino', value: 'Philippines' },
  { label: 'French', value: 'France' },
  { label: 'Greek', value: 'Greece' },
  { label: 'Indian', value: 'India' },
  { label: 'Irish', value: 'Ireland' },
  { label: 'Italian', value: 'Italy' },
  { label: 'Jamaican', value: 'Jamaica' },
  { label: 'Japanese', value: 'Japan' },
  { label: 'Kenyan', value: 'Kenya' },
  { label: 'Malaysian', value: 'Malaysia' },
  { label: 'Mexican', value: 'Mexico' },
  { label: 'Moroccan', value: 'Morocco' },
  { label: 'Norwegian', value: 'Norway' },
  { label: 'Polish', value: 'Poland' },
  { label: 'Portuguese', value: 'Portugal' },
  { label: 'Russian', value: 'Russia' },
  { label: 'Saudi Arabian', value: 'Saudi Arabia' },
  { label: 'Slovak', value: 'Slovakia' },
  { label: 'Spanish', value: 'Spain' },
  { label: 'Syrian', value: 'Syria' },
  { label: 'Thai', value: 'Thailand' },
  { label: 'Tunisian', value: 'Tunisia' },
  { label: 'Turkish', value: 'Turkey' },
  { label: 'Ukrainian', value: 'Ukraine' },
  { label: 'Uruguayan', value: 'Uruguay' },
  { label: 'Venezuelan', value: 'Venezuela' },
  { label: 'Vietnamese', value: 'Vietnam' },
];

/** Meal categories exactly as TheMealDB names them. */
export const CATEGORIES = [
  'Beef',
  'Breakfast',
  'Chicken',
  'Dessert',
  'Goat',
  'Lamb',
  'Miscellaneous',
  'Pasta',
  'Pork',
  'Seafood',
  'Side',
  'Starter',
  'Vegan',
  'Vegetarian',
];

export const SORT_OPTIONS = [
  { value: 'relevance', label: 'Recommended' },
  { value: 'az', label: 'Name (A–Z)' },
  { value: 'za', label: 'Name (Z–A)' },
];

export const SEARCH_MODES = [
  { value: 'name', label: 'By name', placeholder: 'e.g. lasagna or curry' },
  { value: 'ingredients', label: 'By ingredients', placeholder: 'e.g. chicken, garlic' },
];

const CATEGORY_IMAGE_URL = 'https://www.themealdb.com/images/category';

export const categoryImage = (category) => `${CATEGORY_IMAGE_URL}/${category.toLowerCase()}.png`;

/** Cuisines featured on the landing page and in the footer. */
export const POPULAR_CUISINES = ['Italy', 'India', 'Mexico', 'Thailand', 'Japan', 'France', 'China', 'Greece'];

/** One-click searches shown under the search box. */
export const QUICK_SEARCHES = [
  { label: 'Pasta', criteria: { category: 'Pasta' } },
  { label: 'Chicken', criteria: { query: 'chicken', mode: 'ingredients' } },
  { label: 'Vegetarian', criteria: { category: 'Vegetarian' } },
  { label: 'Thai', criteria: { cuisine: 'Thailand' } },
  { label: 'Desserts', criteria: { category: 'Dessert' } },
  { label: 'Seafood', criteria: { category: 'Seafood' } },
];

const cuisineLookup = new Map(
  CUISINES.flatMap((cuisine) => [
    [cuisine.value.toLowerCase(), cuisine.label],
    [cuisine.label.toLowerCase(), cuisine.label],
  ]),
);

/** Turns a TheMealDB area ("France", "Italian", "Unknown") into a display label. */
export function formatCuisine(area) {
  if (!area || area.toLowerCase() === 'unknown') return null;
  return cuisineLookup.get(area.toLowerCase()) ?? area;
}

export function getCuisineLabel(value) {
  return CUISINES.find((cuisine) => cuisine.value === value)?.label ?? value;
}

# Mise – Recipe Finder, Meal Planner & Cooking Mode

Mise is a free recipe website built with React and Vite. Search nearly 800 recipes by name or by
the ingredients you already have, filter by cuisine and category, plan your week, and cook step by
step with built-in timers.

Recipe data and images come from [TheMealDB](https://www.themealdb.com) — no API key or backend
required for development.

What has been built so far is in [docs/PROJECT_LOG.md](docs/PROJECT_LOG.md), and the plan for
what comes next is in [docs/ROADMAP.md](docs/ROADMAP.md).

## Pages

| Route          | Page                                                    |
| -------------- | ------------------------------------------------------- |
| `/`            | Entrance screen: one welcome screen, no scrolling        |
| `/recipes`     | Recipe finder: search, filters and results               |
| `/categories`  | All 14 recipe categories                                 |
| `/cuisines`    | All 37 world cuisines                                    |
| `/inspiration` | A random set of recipe ideas, with Shuffle               |
| `/saved`       | Saved recipes and recently viewed (kept in the browser)  |
| `/planner`     | Weekly meal planner                                      |
| `/about`       | About Mise, what it does, principles and FAQ             |
| `/contact`     | Contact form and details                                 |
| `/privacy`     | Privacy policy                                           |
| `/terms`       | Terms of use                                             |

`/` is the entrance: no site header or footer, just a welcome and the way in. Every other page has the
header (linking to the browsing pages) and the footer (About, Contact and the legal pages).

## Features

- **Smart search** – matches every word against recipe titles (handling plurals like "curries"),
  and also treats the query as a category, cuisine or main ingredient.
- **Search by ingredients** – a comma-separated list returns recipes that use all of them.
- **Suggestions as you type** – recipes, categories, cuisines and ingredient names.
- **Combinable filters** – cuisine, category and sorting, all kept in the URL so searches can be
  bookmarked and shared (`/recipes?q=pasta&cuisine=Italy`).
- **Weekly meal planner** – put saved recipes on any day and print the week.
- **Cooking mode** – full screen, one step at a time, one-tap timers taken from the step text,
  and the screen stays awake.
- **Saved recipes and history** – stored in the browser, synced across open tabs, no account.
- **Install as an app** – an "Install app" button (phone menu, footer and entrance screen) opens
  the browser's install prompt on Android, Chrome and Edge, and shows the "Add to Home Screen"
  steps on iPhone and iPad.
- **Works offline** – a service worker keeps the pages, app code and the recipes and photos you
  have opened, so cooking mode keeps working with no signal.
- **Light and dark themes** and print-friendly recipes.
- **Accessible** – one `<h1>` per page, skip link, keyboard support, focus management, visible
  focus states and reduced-motion support.

## SEO

Every page is prerendered to static HTML at build time, so crawlers and link previews get full
content without running JavaScript:

- per-page `<title>`, meta description, canonical URL, Open Graph and Twitter card tags
- JSON-LD structured data (Organization, WebSite with SearchAction and WebApplication on the
  entrance; FAQPage on About, where the questions are actually shown; WebPage and BreadcrumbList)
- `sitemap.xml` and `robots.txt` generated from the same page metadata
- `/saved` and the 404 page are marked `noindex`

Page metadata lives in `src/seo/pages.js`; the tags are built in `src/seo/head.js` and applied both
at build time (prerendering) and on client-side navigation.

## Getting started

Requires Node.js 20.19+ or 22.12+.

```bash
npm install
npm run dev
```

| Script            | What it does                                                    |
| ----------------- | --------------------------------------------------------------- |
| `npm run dev`     | Start the dev server with hot reload                             |
| `npm run build`   | Build, prerender every page, write sitemap.xml, robots.txt and the service worker's offline file list |
| `npm run preview` | Serve the built site the way a static host does                  |
| `npm run lint`    | Lint the project with Oxlint                                     |
| `npm run icons`   | Regenerate all app icons (Windows PowerShell)                    |

### Before deploying

Copy `.env.example` to `.env` and set:

- `VITE_SITE_URL` – your public address, used for canonical URLs, social tags and the sitemap.
- `VITE_CONTACT_EMAIL` – the address shown on the contact and legal pages.
- `VITE_MEALDB_API_KEY` – TheMealDB's shared test key `1` is for development; they ask you to
  become a supporter before releasing publicly.

`npm run build` prints a warning for any of these left unset. The legal pages are a starting point
written for this site's behaviour, not legal advice; have them reviewed before you publish, and add
a governing-law section if you need one.

Deploy the `dist/` folder to any static host. Each route is a real HTML file
(`dist/about/index.html`), and `dist/404.html` should be configured as the not-found page.

The site must be served over HTTPS for the service worker, and so for installing the app and
offline use (`localhost` also works, for `npm run preview`). Serve `/sw.js` with
`Cache-Control: no-cache` so browsers pick up each new release. The service worker is only
registered in production builds, so `npm run dev` never serves stale code; test offline and
install with `npm run build` and `npm run preview`.

## Project structure

```
docs/                       # Project log and development roadmap
public/                     # Icons, social image, web app manifest, service worker (sw.js)
resources/app-icon.png      # Source artwork for the app icons
scripts/
├── generate-icons.ps1      # Builds the icon set from the source artwork
└── prerender.mjs           # Writes static HTML, sitemap.xml, robots.txt and the offline file list
src/
├── api/mealdb.js           # TheMealDB client: caching, rate limiting, combined search
├── components/
│   ├── contact/            # Contact form
│   ├── content/            # Feature grid and FAQ, shared by the content pages
│   ├── layout/             # Header, footer, page header, theme toggle, error boundary
│   ├── legal/              # Shared layout for the privacy and terms pages
│   ├── planner/            # Weekly planner and its recipe picker
│   ├── recipes/            # Recipe card, grid, dialog, cooking mode, categories
│   ├── search/             # Search form, suggestions, filters, results
│   └── ui/                 # Section header, status message, toast, call to action
├── constants/              # Cuisines and categories, settings, days, site details
├── content/faq.js          # FAQ shown on the About page and published as structured data
├── context/                # Saved recipes, plan, history and the recipe dialog
├── hooks/                  # Data loading, storage, theme, search, timers, wake lock
├── pages/                  # One component per route
├── router/                 # Small History API router with prefetching links
├── seo/                    # Page metadata, head tags, structured data, sitemap
├── styles/                 # Design tokens and per-area stylesheets
├── utils/                  # Recipe parsing, search matching, durations, helpers
├── App.jsx
├── entry-server.js         # Used by the prerender script
└── main.jsx
```

## Notes on TheMealDB

- The free API has no "list all recipes" endpoint, so the catalogue is built from one request per
  category (14 requests, cached for the session) and shuffled once a day.
- Only one filter is allowed per request, so active filters are fetched separately and intersected
  by recipe id.
- Recipe details are fetched per recipe as cards appear, at most 4 at a time, to stay within
  TheMealDB's rate limits.
- Cuisine filters use country names (`France`, `United States`) because some adjectives
  (`French`, `American`) return no results.
- The API has no cooking times, difficulty, ratings or nutrition, so Mise only shows real data:
  cuisine, category, ingredient count and step count.

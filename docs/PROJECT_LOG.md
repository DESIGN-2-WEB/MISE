# Mise – Project Log

What has been built, why, and where the project stands. Newest entries first.
Add an entry whenever something ships or a decision is made. The plan for what comes next is in
[ROADMAP.md](ROADMAP.md).

## Current status — 22 Sep 2026

| Area            | Status                                                                         |
| --------------- | ------------------------------------------------------------------------------ |
| Stage           | Feature-complete for a first release. **Not deployed yet.**                    |
| Pages           | 11 pages plus a 404 page, all prerendered to static HTML                       |
| Recipe data     | TheMealDB: 793 recipes, 37 cuisines, 14 categories                             |
| Code size       | 94 source files: about 5,300 lines of JS/JSX and 3,200 lines of CSS            |
| Download size   | Main script 69 KB and main stylesheet 10 KB (gzipped); other pages load on demand |
| Quality checks  | Lint clean, build passes. **No automated tests.**                              |
| Version control | **None.** The project is not a git repository.                                 |

**Before a public launch:** put the code under git, set the production settings and API key, get
the legal pages reviewed, and deploy. See Phase 0 of the [roadmap](ROADMAP.md#phase-0--ready-to-launch).

## Log

### 11 Nov 2026 — Broken links fixed

- **Fixed:** the header menu, footer, "Find a recipe" button and the "Browse recipes" buttons on
  seven pages still linked to the old `/app/…` addresses, so they opened the 404 page. They now
  use `/recipes`, `/categories`, `/cuisines`, `/inspiration`, `/saved` and `/planner`. The "Find
  a recipe" button also focuses the search box again when you are already on `/recipes`.
- **Fixed:** the FAQ link on the Contact page pointed at `/#faq`, but the FAQ is on the About
  page. It now goes to `/about#faq`.
- Checked: every internal link in the built pages points at a page that exists.

### 22 Sep 2026 — Project log and roadmap

- Added this log and [ROADMAP.md](ROADMAP.md).

### 19 Sep 2026 — Separate pages and an entrance screen

- Split the long Recipes page into separate pages: `/recipes`, `/categories`, `/cuisines`,
  `/inspiration`, `/saved` and `/planner`.
- Turned `/` into an entrance screen that fits on one screen with no scrolling. It has no site
  header or footer. It shows the wordmark and tagline, **Browse recipes** and **Plan your week**
  buttons, real figures, and a collage of three dish photos with a timer chip and a planner chip.
  On phones the collage becomes a strip of photos. Checked at 1280×800 and 375×812, in light and
  dark themes.
- **Fixed:** canonical URLs, sitemap entries and breadcrumbs still used an old `/app/…` address
  scheme, so they pointed at pages that don't exist. Routes now read their paths from the SEO
  metadata (`src/seo/pages.js`), so the two can't disagree again.
- **Fixed:** `npm run preview` served the home page's HTML for every address, which looked like a
  React hydration error. A small preview middleware now serves each prerendered page.
- Agreed on the page names: **Terms of Use**, **Privacy Policy**, and **Contact** in the menus
  with **Contact Us** as the page title.

### 12–17 Sep 2026 — Landing page, legal pages and SEO

- Removed the chef-hat icon beside the title in the header.
- Added **About** (features and FAQ), **Contact** (a form that opens the visitor's email app),
  **Privacy Policy** and **Terms of Use**.
- SEO: every page is prerendered at build time. Each page has its own title, description,
  canonical URL, and Open Graph and Twitter tags. Added JSON-LD structured data (Organization,
  WebSite with SearchAction, WebApplication, FAQPage, WebPage and BreadcrumbList), generated
  `sitemap.xml` and `robots.txt`, and marked `/saved` and the 404 page `noindex`.
- Made saved data and time-based UI safe to hydrate, so the prerendered HTML and the browser agree.
- Removed code that was no longer used, including the old landing-page stylesheet.

### 11–12 Sep 2026 — Planner, suggestions, themes and cooking mode

- **Weekly meal planner:** put saved or recently viewed recipes on any day, and print the week.
- **Search suggestions** as you type (recipes, categories, cuisines and ingredients), and a
  **recently viewed** list.
- **Light and dark themes**, and a print-friendly recipe layout.
- **Cooking mode:** full screen, one step at a time in large text. It offers one-tap timers for
  times found in the step text ("cook for 12 mins"), plays an alarm, and keeps the screen awake.
- Saved recipes, the plan and history are stored in the browser and stay in sync across open tabs.

### 11 Sep 2026 — From a few dishes to 793

- **Problem:** only a few dishes were visible. The browse section stayed empty until you searched,
  search only matched words in recipe titles ("pasta" found 1 recipe, "desserts" found 0), and
  results came 12 at a time.
- **Fix:** the full catalogue is built from the 14 category lists and shuffled once a day. Browse
  shows all 793 recipes, 24 at a time. Search now also matches categories, cuisines and
  ingredients, and handles plurals: "pasta" finds 13 recipes, "desserts" 168, "curries" 19.
- Recipe details load at most 4 at a time, to stay under TheMealDB's rate limit.
- TheMealDB only has about 800 recipes. A larger catalogue would need a paid API (see the roadmap).

### 10 Sep 2026 — Review, rebuild and app icon

- **Review found:** two of the four filters (cook time and difficulty) did nothing, because every
  recipe had a hard-coded "30 min, Medium". Several cuisine and diet options always returned
  nothing (Asian, Mediterranean, Keto, Gluten-Free…). Filters didn't combine. Ratings and
  calories were random numbers. Results could go stale, the toast fired twice, and two old
  unused files were left in the project.
- **Rebuilt** with a clear structure: API client, components grouped by area, hooks, context,
  router, SEO, styles and utilities. `App.jsx` no longer holds everything. Unused code was removed.
- Filters now combine: each one is fetched separately and the results are intersected. Cuisine
  options use country names (the API returns nothing for "French", but does for "France"). Mise
  shows only real data, with no invented times, ratings or calories.
- Handled TheMealDB's `{"meals": "Invalid ID"}` response, and made native `<dialog>` modals
  close reliably.
- **App icon:** created the full icon set (favicon, Apple touch icon, and install and maskable
  icons) from the chef-hat artwork, using `npm run icons`.

## Decisions

| Decision | Why | Trade-off |
| -------- | --- | --------- |
| No backend or accounts. Data stays in the browser. | Free static hosting, nothing to secure, a simple privacy policy | No sync between devices, and data is lost if browser data is cleared |
| Show only real data | TheMealDB has no times, ratings or nutrition, and made-up numbers mislead | Cards show less detail |
| Our own small router instead of React Router | Only 11 fixed pages. Keeps the bundle small and supports prefetch on hover. | Addresses with parameters (like `/recipe/:id`) need adding by hand |
| Prerender at build time, no server | Static hosting, with full HTML for search engines and link previews | Pages only change when the site is rebuilt |
| Cuisine values are country names | Some adjectives return no results from the API | — |
| The contact form uses `mailto:` | No form backend, and nothing is stored | The visitor needs an email app set up |
| Minimal entrance screen with no header or footer | Chosen on 19 Sep: a clean way into the app | The content lives on the inner pages |
| Plain CSS with design tokens | No framework needed at this size, with full control over themes | — |

## Known issues and limits

- **No version control.** The code exists only in this OneDrive folder, and OneDrive also syncs
  `node_modules` and `dist`.
- **No automated tests or CI.** The `/app/…` canonical bug on 19 Sep is the kind of mistake tests
  would catch.
- `VITE_SITE_URL` and `VITE_CONTACT_EMAIL` are not set, and TheMealDB's test key `1` is for
  development only.
- The legal pages have not been reviewed by a lawyer.
- Recipes open in a dialog and have no address of their own. You can't share them, bookmark them,
  or find them in search engines.
- No offline support. Cooking mode needs a connection to load a recipe.
- TheMealDB has no cooking times, nutrition or servings, and ingredient amounts are free text
  ("1 cup", "to taste").

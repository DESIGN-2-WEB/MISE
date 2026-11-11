# Mise – Development Plan

What to build next, in order. What has already been done is in [PROJECT_LOG.md](PROJECT_LOG.md).

**Priority:** Must = needed before launch · Should = next most valuable · Could = nice to have
**Size:** S = up to half a day · M = 1–3 days · L = about a week or more

When an item is done, tick it here and add an entry to the project log.

## Next up

1. [ ] Put the project under git (0.1)
2. [ ] Production settings and TheMealDB key (0.2)
3. [ ] Automated tests and CI (0.3, 0.4)
4. [ ] Deploy (0.5)
5. [ ] A page for every recipe (1.1, 1.2)

## Phase 0 — Ready to launch

| # | Item | Priority | Size | Done when |
| - | ---- | -------- | ---- | --------- |
| 0.1 | **Version control.** Run `git init`, make the first commit and push to a private GitHub repo. Move the project out of OneDrive, or stop OneDrive from syncing `node_modules` and `dist`. | Must | S | The code is on GitHub and `git status` is clean |
| 0.2 | **Production settings.** Set `VITE_SITE_URL` and `VITE_CONTACT_EMAIL` in `.env`. Become a TheMealDB supporter to get a production API key. | Must | S | `npm run build` prints no warnings |
| 0.3 | **Automated tests** with Vitest: search matching, duration parsing, recipe parsing, the API client with a mocked `fetch` ("Invalid ID", filter intersection), route matching, and SEO (every page has metadata, canonical paths match routes, `noindex` pages stay out of the sitemap). | Must | M | `npm test` passes |
| 0.4 | **CI** with GitHub Actions: run lint, tests and the build on every push and pull request. | Should | S | Every push shows a green check |
| 0.5 | **Deploy** `dist/` to Netlify, Cloudflare Pages or Vercel. Set `404.html` as the not-found page, and add a custom domain with HTTPS. | Must | S | The site is live on its own domain |
| 0.6 | **Legal review** of the Privacy Policy and Terms of Use, including a governing-law section. | Must | — | Approved by someone qualified |
| 0.7 | **Launch checks:** Lighthouse on `/` and `/recipes`, an axe accessibility scan, and tests on a real iPhone (Safari) and Android phone (Chrome): install the app, print a recipe, and run a cooking-mode timer with the screen kept awake. Submit the sitemap to Google Search Console and Bing Webmaster Tools. | Must | M | Lighthouse scores are all 90 or above, axe finds no serious issues, and the sitemap is accepted |

## Phase 1 — A page for every recipe

Recipes currently open in a dialog with no address. This phase is the biggest gain for search
traffic and for sharing.

| # | Item | Priority | Size | Done when |
| - | ---- | -------- | ---- | --------- |
| 1.1 | **Recipe addresses** like `/recipe/52772-teriyaki-chicken-casserole`. The dialog stays as a quick view but updates the address, and opening a link goes straight to the recipe. The router needs support for addresses with parameters. | Should | M | Any recipe can be linked, bookmarked and reopened |
| 1.2 | **Prerender every recipe page** at build time: about 800 lookups, throttled and cached on disk between builds. Add each page to the sitemap with `schema.org/Recipe` data (name, image, ingredients, steps, cuisine, category, video). Leave out times and nutrition rather than invent them. | Should | L | Google's Rich Results Test accepts the Recipe data |
| 1.3 | **Share button:** the Web Share API on phones, and Copy link on desktop. | Should | S | Sharing to a chat app works |
| 1.4 | **Recipe link previews:** use the recipe's photo and title as its social image. | Should | S | The link preview shows the dish |

**Check first:** make sure TheMealDB's terms (at the supporter tier) allow caching their recipes
and publishing them as static pages.

## Phase 2 — Planner and kitchen

| # | Item | Priority | Size | Done when |
| - | ---- | -------- | ---- | --------- |
| 2.1 | **Shopping list from the week's plan.** Group ingredients by name across the planned recipes and list each amount ("Chicken: 500g, 2 breasts"). Items can be ticked off, printed or shared. Amounts are free text, so list them side by side instead of adding them up. | Should | M | A week's plan turns into one list you can tick off |
| 2.2 | **"Use what I have" ranking.** Ingredient search today needs every ingredient. Add a mode that ranks recipes by how many of your ingredients they use: one request per ingredient, then count the matches, so no extra detail requests are needed. | Should | M | Entering 5 ingredients shows the best matches first |
| 2.3 | **Backup and restore.** Export saved recipes, the plan and history to a file, and import them on another device. | Should | S | Data moves between two browsers |
| 2.4 | **Meal slots:** breakfast, lunch and dinner on each day of the planner. | Could | M | Each day shows three slots |
| 2.5 | **Personal notes** on a recipe, stored in the browser. | Could | S | A note is still there after a reload |
| 2.6 | **Servings scaler.** Only amounts that start with a number can be scaled. Research this first. | Could | M | Numeric amounts scale, and the rest are left as they are |

## Phase 3 — Offline and polish

| # | Item | Priority | Size | Done when |
| - | ---- | -------- | ---- | --------- |
| 3.1 | **Offline support** with a service worker. Cache the app, plus the details and photos of saved recipes, so cooking mode works in a kitchen with no signal. | Should | M | A saved recipe opens in cooking mode in airplane mode |
| 3.2 | **Update prompt** ("A new version is available") when the site changes. | Could | S | The prompt appears after a deploy |
| 3.3 | **Performance:** check icon imports in the 69 KB main script, preload the entrance photos, and serve smaller images on phones. | Could | S | Lighthouse performance stays at 90 or above on a mid-range phone |
| 3.4 | **Cooking mode extras:** several timers on screen at once, and optional voice control ("next step"). | Could | M | Two timers run side by side |

## Phase 4 — Later, only if there is demand

These need a backend, or they change what the Privacy Policy promises. Update the policy before
shipping any of them.

- **Contact form backend** (Formspree or Netlify Forms), so visitors without an email app can
  send a message.
- **Cookieless, privacy-friendly analytics** (Plausible or Cloudflare Web Analytics), to learn
  which features people use.
- **Accounts and sync across devices.** This needs sign-in, a database and a way to handle data
  deletion requests. Do backup and restore (2.3) first; it may be enough.
- **A larger recipe catalogue:** Spoonacular or Edamam have far more than 800 recipes, and
  cooking times and nutrition too, but they need API keys and paid plans.
- **Other languages.**

## Risks

| Risk | Effect | What to do |
| ---- | ------ | ---------- |
| TheMealDB is down or changes its API | No recipes load | Error messages are already in place. Offline caching (3.1) keeps saved recipes working. |
| The test API key is used in production | Against TheMealDB's terms | Supporter key (0.2) |
| A visitor clears their browser data | Their saved recipes and plan are lost | Backup and restore (2.3) |
| Code only exists in OneDrive | One bad sync or deletion loses work | Git and GitHub (0.1) |

## Ongoing

- **Monthly:** run `npm outdated`, update dependencies, then run lint, tests and the build.
- **After each change:** add an entry to [PROJECT_LOG.md](PROJECT_LOG.md) and tick the item here.
- **When data handling changes** (anything in Phase 4): update the Privacy Policy first.

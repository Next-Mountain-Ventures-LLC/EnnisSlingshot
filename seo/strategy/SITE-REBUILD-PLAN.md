# Ennis Slingshot — Site Rebuild Blueprint

_Produced 2026-09-04 by the code-architect pass over this repo + `SITE-STRUCTURE.md`, `SEO-STRATEGY.md` §5, `/LINKING-CONVENTIONS.md`, `keywords.md`, `TODO.md`. Visual design stays identical; this is the engineering plan for the new URL tree, prerendering, SEO plumbing, blog system, interactive builds, and fixes._

## 0. Existing-state facts that drove the decisions

- **No `client/content/blog/*.md` files exist yet**, but `client/lib/blog.ts` is fully built to read them via `import.meta.glob('../content/blog/*.md', {eager:true, query:'?raw'})` with a Zod frontmatter schema matching the WordPress sync plugin's output (title, pubDate, description/excerpt, slug, updatedDate, draft, status, heroImage/heroImageAlt, tags/tagSlugs, categories/categorySlugs, author/authorEmail/authorUrl/authorBio, postId, permalink, wordCount, readingTime). Routes today: `/`, `/blog`, `/blog/:slug`, `*` → `NotFound` (`client/App.tsx:23-27`).
- `server/index.ts:17` statically serves `dist/blog` — dead code on Netlify (only `dist/spa` is published). Remove in this rebuild; blog HTML is prerendered into `dist/spa`.
- `netlify.toml` has only the `/api/*` → function redirect. **No SPA fallback, no `_redirects`, no security headers, no www→apex redirect** exist in the repo (the audit's "redirect hygiene is clean" refers to live DNS/Netlify settings, not repo config — add explicit rules).
- Hero video and Booking video (`Hero.tsx:21-22`, `Booking.tsx:55-56`) both load the same 51 MB `.mov` with `preload="auto"` + `autoPlay` — two full downloads.
- `FAQ.tsx:117-121` conditionally unmounts answers; `client/components/ui/accordion.tsx` (Radix, DOM-retained) exists and is unused by `FAQ.tsx`.
- `YourRide.tsx:34-40` states "1.5L Twin-Cylinder / 203 HP" — wrong; correct: **ProStar 2.0L four-cylinder, 180/204 hp by trim**.
- `Contact.tsx` has no phone, no address, no hours. `public/robots.txt` has no `Sitemap:` line; no `sitemap.xml`, no `llms.txt`.
- No `react-helmet-async`, no prerender tool, no `leaflet`, no consent library installed.

## 1. Rendering strategy decision

**Decision: `vite-react-ssg`** — build-time `renderToString` per route, React Router-native, official `react-helmet-async` and `<ClientOnly>` island support.

| Option | Verdict | Why |
|---|---|---|
| **vite-react-ssg** | **Chosen** | Drop-in for Vite + React 18 + React Router 6. Replaces only the app bootstrap (`createRoot`/`BrowserRouter` → `ViteSSG(...)`); every existing page/component/route stays. Renders every route to static HTML at build time in Node (no headless browser), including dynamic routes enumerated from data (`includedRoutes`) — exactly what turns `client/content/blog/*.md` and `client/content/pages/**/*.md` into routes. `<ClientOnly>` covers Leaflet/Open-Meteo widgets. Output still lands in `dist/spa`, so `netlify.toml` `publish` is unchanged. |
| vite-plugin-ssr / Vike | Rejected | Forces migration to its file-router (`+Page.tsx`/`+data.ts`) — a routing rewrite for no incremental benefit. |
| react-snap / puppeteer | Rejected | Post-hoc headless crawl: non-deterministic, slow/flaky at ~270 pages, no clean per-route `<head>`/JSON-LD control, duplicates route discovery. |
| Netlify bot-only prerendering | Rejected | Serves HTML only to sniffed bots — cloaking-adjacent, paid legacy add-on, unreliable for GPTBot/ClaudeBot/PerplexityBot, no inspectable artifact for the CI gate. |

**Markdown → routes at build time:** `client/lib/blog.ts`'s `import.meta.glob` works unmodified under `vite-react-ssg`. A new route manifest (`client/lib/routes.ts`) calls `getPublishedPosts()` (blog) and `getAllPageRoutes()` (site pages) at build time and feeds `includedRoutes`, so every `/blog/[slug]/`, `/blog/category/[slug]/`, and every hub/spoke gets its own `index.html` in `dist/spa`.

**Islands:** Acuity iframe (already client-side on click), Leaflet trail map, Open-Meteo weather, bloom-tracker badge — each wrapped in `<ClientOnly fallback={…}>` with a static SSR fallback (poster image / text list / normals table) so prerendered HTML has real crawlable content around the island.

## 2. Route map → file map

### 2.1 Content structure
```
client/content/
├── blog/*.md                         (WordPress-synced posts — never hand-written)
├── pages/                            (NEW — one .md per site page, mirrors the URL tree 1:1)
│   ├── index.md                                   → /
│   ├── slingshot-rental/index.md                  → /slingshot-rental/
│   ├── slingshot-rental/{drive-and-go,bluebonnet-trail-experience,date-night,groups,gift-cards,pricing,requirements,near-dallas,near-fort-worth,near-arlington,waxahachie-ellis-county,texas}.md
│   ├── bluebonnets/index.md                       → /bluebonnets/
│   ├── bluebonnets/{festival,trail-map,bloom-tracker,weather,photo-spots,welcome-center,bluebonnet-capital-of-texas,where-to-see-bluebonnets-near-dallas,texas-bluebonnet-festivals,history}.md   (trail-map/bloom-tracker/weather = intro/FAQ copy only; islands are code)
│   ├── ennis/index.md                             → /ennis/
│   ├── ennis/{day-trip-from-dallas,weekend-itinerary,texas-motorplex,national-polka-festival,where-to-eat,where-to-stay,downtown,events}.md
│   ├── blog-categories/{bluebonnets,ennis-dfw,date-ideas,slingshot-101,news}.md   (category-page intro copy)
│   ├── about.md, faq.md, reviews.md, gallery.md, contact.md, book.md, privacy.md, terms.md
└── data/                             (NEW)
    ├── events.json                   → /ennis/events/
    ├── bloom-status.json             → /bluebonnets/bloom-tracker/ + home badge
    └── trail-map.geojson             → /bluebonnets/trail-map/
```

### 2.2 Site-page frontmatter schema (`shared/content/page-schema.ts`, Zod)
```
title, metaDescription, canonicalPath, h1,
hub: "slingshot-rental" | "bluebonnets" | "ennis" | null,   // auto hub↔spoke nav + breadcrumbs
schemaType: "LocalBusiness" | "Service" | "TouristAttraction" | "Article" | "ItemList" | "ContactPage" | "AboutPage" | ...,
faqs?: { question; answer }[],                                // shared FaqAccordion + optional FAQPage schema
packagePrice?: { name; price; priceValidUntil? }[],
island?: "TrailMap" | "BloomTracker" | "Weather" | "EventsCalendar",
updatedDate, publishDate, ogImage?, breadcrumbLabel
```
`shared/content/blog-schema.ts` receives the existing `client/lib/blog.ts` Zod schema unchanged so the client bundle and the Node scripts share one parser.

### 2.3 Component / route map
| URL(s) | Page component | Layout | Data | Reused landing components |
|---|---|---|---|---|
| `/` | `client/pages/Index.tsx` (+`<Seo>`) | `SiteLayout` | hardcoded + `shared/vehicle-spec.ts`, `shared/business.ts` | Hero, YourRide, Trails, Booking, FAQ, Contact (patched per §4) |
| `/slingshot-rental/`, `/bluebonnets/`, `/ennis/` | `client/pages/site/HubPage.tsx` (generic) | `SiteLayout` | `client/content/pages/<hub>/index.md` via `client/lib/pages.ts` | Breadcrumbs, FaqAccordion, HubSpokeNav (auto from `getPagesUnderHub()`), CtaBanner |
| All non-[BUILD] spokes + about/reviews/gallery/book/privacy/terms | `client/pages/site/ContentPage.tsx` (generic) | `SiteLayout` | matching `.md` | Breadcrumbs, FaqAccordion, PackagePriceTable, CtaBanner, Booking deep-link |
| `/bluebonnets/trail-map/` | `TrailMapPage.tsx` | `SiteLayout` | `.md` + `trail-map.geojson` | TrailMapIsland |
| `/bluebonnets/bloom-tracker/` | `BloomTrackerPage.tsx` | `SiteLayout` | `.md` + `bloom-status.json` | BloomTrackerIsland + BloomBadge (also on `/`) |
| `/bluebonnets/weather/` | `WeatherPage.tsx` | `SiteLayout` | `.md` + Open-Meteo (client) + April normals constant | WeatherIsland |
| `/ennis/events/` | `EventsPage.tsx` | `SiteLayout` | `.md` + `events.json` | EventsCalendarIsland |
| `/blog/` (+ `/blog/page/N/`) | `BlogIndexTemplate.tsx` (+pagination) | `SiteLayout` | `client/lib/blog.ts` | — |
| `/blog/category/[slug]/` | `BlogCategoryTemplate.tsx` (NEW) | `SiteLayout` | `getPostsByCategorySlug` + intro `.md` | — |
| `/blog/[slug]/` | `BlogTemplate.tsx` (extended) | `SiteLayout` | `client/lib/blog.ts` | AuthorBox, RelatedPosts, PrevNextPost (NEW) |
| `/faq/` | `FaqPage.tsx` (master, statute-linked) | `SiteLayout` | `faq.md` | FaqAccordion |
| `/contact/` | `ContactPage.tsx` | `SiteLayout` | `shared/business.ts` | NAP block + map embed |
| `/404` | `NotFound.tsx` (restyled) | — | — | — |
| `/sitemap.xml`, `/robots.txt`, `/llms.txt`, `/rss.xml` | generated files (§3, §8) | — | route manifest + `shared/business.ts` | — |

`SiteLayout` (`client/components/layout/SiteLayout.tsx`) wraps every route: Header (global nav), Breadcrumbs, content, StickyBookBar (mobile), Contact footer (NAP).

## 3. SEO plumbing
- **`client/components/seo/Seo.tsx`** wraps `react-helmet-async`: `title`, `description`, `canonicalPath` (absolutized to `https://ennisslingshot.com`), `ogImage`, `ogType`, `noindex?`, `jsonLd: object[]` → `<title>`, meta description, canonical, OG/Twitter, one `<script type="application/ld+json">` per object.
- **SSG integration:** wrap `App` in `<HelmetProvider>`; in the `vite-react-ssg` head-injection hook, splice each route's Helmet output into its generated HTML before writing `dist/spa/<route>/index.html`.
- **JSON-LD builders** (`client/lib/schema/*.ts`):

| Page type | Schema stack |
|---|---|
| `/` | `LocalBusiness` (additionalType `TouristAttraction`, `AutoRental`), `Organization`, `WebSite`+`SearchAction`, `OfferCatalog` |
| `/slingshot-rental/` + package spokes | `Service` + `OfferCatalog` + `LocalBusiness` + `BreadcrumbList` (+ `FAQPage` when `faqs[]`) |
| `/bluebonnets/` | `Article` + `TouristAttraction` + `BreadcrumbList` (+ `Event` once dates known) |
| `/bluebonnets/festival/` | `Event` + `BreadcrumbList` |
| `/ennis/` | `ItemList` + `TouristDestination` + `BreadcrumbList` |
| `/blog/[slug]/` | `BlogPosting` + `Person` + `Organization` + `BreadcrumbList` |
| `/faq/` | `FAQPage` |
| `/contact/` | `ContactPage` + `LocalBusiness` |
| `/book/` | `ReserveAction` |
| every page | `BreadcrumbList` via `Breadcrumbs.tsx` (visible + JSON-LD in one component) |

- **Sitemap / robots / llms.txt:** `scripts/generate-seo-files.ts` (tsx, plain `fs`, uses `shared/content/*-schema.ts`) runs after `vite-ssg build`, writes into `dist/spa/`: `sitemap.xml` (one URL per manifest route; exclude `/404`, pagination ≥2; `lastmod` from `updatedDate`/`pubDate`), `robots.txt` (allow all incl. GPTBot/ClaudeBot/PerplexityBot; `Sitemap:` line), `llms.txt` (summary, NAP, hubs, `/faq/`, pillar posts).
- **`netlify.toml`:** prerender `NotFound` at `/404` and copy to `dist/spa/404.html` (real 404 status; no blanket `/* → /index.html 200`, which would mask real 404s — every legitimate URL is a physical file); `[[redirects]]` www→apex 301 (`force = true`); non-trailing-slash → trailing-slash 301s for the hub/spoke tree; `[[headers]]` `/*`: `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, HSTS preload, and a CSP allow-listing googletagmanager.com, connect.facebook.net, embed/app.acuityscheduling.com, youtube.com, google-analytics.com, api.open-meteo.com, cdn.builder.io, images.pexels.com, *.tile.openstreetmap.org, facebook.com. Existing `/api/*` redirect unchanged.

## 4. Component changes
| Fix | Files | Change |
|---|---|---|
| FAQ answers unmounted | `FAQ.tsx` → `client/components/shared/FaqAccordion.tsx` (reused on `/`, `/faq/`, every `faqs[]`) | Use Radix `Accordion` from `ui/accordion.tsx` — content stays in the DOM (CSS collapse), `aria-expanded` native; emits `FAQPage` JSON-LD when given `faqs[]`. |
| 51 MB hero video ×2 | `Hero.tsx`, `Booking.tsx` → `client/components/shared/HeroVideo.tsx` | One compressed self-hosted source (`public/videos/hero.mp4` + `.webm`, ≤ 8 MB), `preload="metadata"`, `poster="/videos/hero-poster.jpg"`, `<img>` fallback inside `<video>`; Booking video becomes click-to-play (`ClickToPlayVideo`); respect `prefers-reduced-motion`. **Asset swap needed** (current file has burned-in third-party text). |
| Images without dimensions | all `<img>` in landing + blog templates | Explicit `width`/`height` (intrinsic sizes) → no CLS. |
| No NAP | `Contact.tsx`, `/contact/` | `shared/business.ts` single source (name, address, phone, email, hours, geo, sameAs) → footer NAP block + `/contact/` + `LocalBusiness` JSON-LD. Placeholders marked `TODO` until the owner supplies phone/address — never fabricate. |
| Wrong vehicle spec | `YourRide.tsx`, `PromotionalPopup.tsx`, any copy | `shared/vehicle-spec.ts` — `{ engine: "Polaris ProStar 2.0L four-cylinder", hpByTrim: [{S/SL: 180}, {SLR/R: 204}], transmission: "AutoDrive automated manual (no clutch) or 5-speed manual", seating: 2, licenseNote }`; specs grid reads from it. |
| No global nav / breadcrumbs | `Header.tsx`, new `layout/Breadcrumbs.tsx` | Nav: **Experiences · Bluebonnets · Ennis · Blog · FAQ · Book**; breadcrumbs `Home › Hub › Page` on every non-home route. |
| No sticky Book bar | `layout/StickyBookBar.tsx` in `SiteLayout` | Mobile-only fixed bottom CTA → `/book/` (or `#booking-header` on `/`), safe-area aware. |

## 5. Interactive builds (`client/components/islands/`, `<ClientOnly>` with real SSR fallbacks)
| Island | Data shape | Notes |
|---|---|---|
| **TrailMapIsland** | `trail-map.geojson` FeatureCollection; LineString props `{ loop: "north"\|"south"\|"west"\|"slingshot-route", name, color, distanceMiles }`; Point props `{ type: "photo-spot"\|"restroom"\|"parking"\|"welcome-center", name, description }` | Leaflet + react-leaflet + OSM tiles; `?embed=1` chrome-less mode for bloggers; SSR fallback = static map image + text list of loops. |
| **BloomTrackerIsland** + **BloomBadge** | `bloom-status.json`: `{ updatedAt, status: "not-started"\|"early"\|"peak"\|"fading"\|"past", weeklyEntries: [{ date, status, note, photoUrl? }] }` | Checked-in JSON edited weekly in season; status renders as plain SSR content; island only for photo carousel; JSON endpoint copied to `dist/spa/bloom-status.json` for newsrooms. |
| **WeatherIsland** | Open-Meteo forecast for 32.3293,-96.6255 (client fetch, no key); `client/lib/weather-normals.ts` `{ avgHighF: 78, avgLowF: 55, rainDayPct: 26 }` | SSR fallback = normals table + ride/no-ride policy; 10-day forecast hydrates client-side. |
| **EventsCalendarIsland** | `events.json`: `[{ id, name, startDate, endDate?, location, description, url? }]` | Prerendered list + `Event` JSON-LD at build time; island adds filter/sort. |
| **Drive-time widget** | `client/lib/drive-times.ts`: `[{ originCity, miles, minutes }]` (Dallas 35/37, Arlington 52/53, Plano 53/54, Fort Worth 57/59, Frisco 64/62, Waco 74/75 — verify in Maps) | Fully static; embedded in `near-*` and `texas` pages. |

## 6. Blog system
No schema fields need adding (author, categories, tags, heroImage, updatedDate, draft already exist). Additions:
1. Extract `shared/content/blog-schema.ts` (schema + `parseFrontmatter`) shared by `client/lib/blog.ts` and the Node scripts.
2. Optional `authorImage` field → `AuthorBox`.
3. `getAdjacentPosts(post)` → `PrevNextPost`; `getReadingTime(post)` (frontmatter or 200 wpm fallback).
4. `BlogCategoryTemplate.tsx` for `/blog/category/[slug]/` with intro copy from `client/content/pages/blog-categories/[slug].md`; **hide the routing category** (`EnnisSlingshot.com`) everywhere; visible category = SEO category.
5. `BlogTemplate.tsx`: AuthorBox, RelatedPosts, PrevNextPost, reading time, `BlogPosting`+`Person`+`Organization`+`BreadcrumbList` JSON-LD, OG fallback `/og/blog-default.jpg`.
6. Pagination at 12/page (`/blog/page/2/`, `/blog/category/[slug]/page/2/`), self-canonical; only page 1 in sitemap.
7. `scripts/generate-rss.ts` → `dist/spa/rss.xml`.
8. Port hipaasoft's `prebuild` hero-image pipeline: `scripts/fetch-blog-images.mjs` downloads + recompresses each post's `heroImage` into `public/blog-images/<postId>.webp`; `resolveHeroImage()` falls back to the remote URL if missing.

## 7. Analytics / consent
- Keep GA4 (`G-MN5MEYR77J`) and Meta Pixel (`1547801854018398`) in `index.html` (now the SSG template for every page).
- Consent Mode v2: inline `gtag('consent','default',{…})` block **above** the gtag.js `<script async>` in `index.html` (plain script, not React); `client/components/shared/ConsentBanner.tsx` calls `gtag('consent','update',…)` **and** `fbq('consent','grant'|'revoke')`; persist choice in localStorage; wrap `fbq('track', …)` calls in a consent check.

## 8. Build & deploy
```
"build:client": "vite-ssg build && tsx scripts/generate-seo-files.ts && tsx scripts/generate-rss.ts && node scripts/split-404.mjs && node scripts/assert-prerendered.mjs",
"prebuild": "node scripts/fetch-blog-images.mjs"
```
- `scripts/split-404.mjs` — `dist/spa/404/index.html` → `dist/spa/404.html`.
- `scripts/assert-prerendered.mjs` — **CI gate**: every manifest route must exist and contain a rendered `<h1>` inside `#root`; fail otherwise.
- New deps: `vite-react-ssg`, `react-helmet-async`, `leaflet`, `react-leaflet`, `@types/leaflet`, `tsx` (dev). No consent library.
- Code-split per route (`React.lazy`); Leaflet never in the main bundle. Budgets: hero video ≤ 8 MB, LCP < 2.5 s, per-route JS ≤ 150 KB gzip (excl. islands), CLS < 0.1, INP < 200 ms.

## 9. Work breakdown
**Foundation** — T1 add vite-react-ssg + react-helmet-async, convert `App.tsx` bootstrap (M) · T2 route manifest `client/lib/routes.ts` → `includedRoutes` (M) · T3 `Seo.tsx` + `lib/schema/*` + head injection (L) · T4 `generate-seo-files.ts`, schema extraction, `split-404`, `assert-prerendered` (M) · T5 `netlify.toml` 404/redirects/headers/CSP (S)
**Pages** — T6 `pages.ts` + `page-schema.ts` + `ContentPage`/`HubPage`/`Breadcrumbs`/`SiteLayout` (L) · T7 write ~30 `client/content/pages/**` markdown files (L, content) · T8 `FaqPage`, `ContactPage`, `PackagePriceTable`, `HubSpokeNav` (M)
**Blog** — T9 `blog-schema.ts` extraction + `getAdjacentPosts`/`getReadingTime` (S) · T10 category pages + pagination (M) · T11 AuthorBox/RelatedPosts/PrevNext + Article JSON-LD (M) · T12 RSS (S) · T12b hero-image prebuild pipeline (S)
**Interactive** — T13 TrailMap (L) · T14 BloomTracker + badge (M) · T15 Weather (M) · T16 Events (M) · T17 drive-times (S)
**Fixes** — T18 HeroVideo/ClickToPlay + compressed assets (M; needs a real video file) · T19 FaqAccordion on Radix (S) · T20 `vehicle-spec.ts` (S) · T21 `business.ts` NAP (S; blocked on phone/address) · T22 image dimensions (S) · T23 Header nav + StickyBookBar (M) · T24 Consent Mode v2 + banner (M)
**QA** — T25 Lighthouse budgets on `/`, a hub, a post, a [BUILD] page · T26 schema validation per JSON-LD type · T27 crawl test: zero orphans, `assert-prerendered` green for all routes

Order: T1→T2→T3 first; then T4/T5 ∥ Pages (T6–T8) ∥ Blog (T9–T12b); Interactive (T13–T17) and Fixes (T18–T24) fully parallel once T1–T3 land; QA last, gating launch.

**Blocking content dependencies:** real phone/address (T21); replacement hero video file (T18); 2027 festival dates (Event schema, `festival.md`).

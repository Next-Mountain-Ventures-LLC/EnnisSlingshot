## Summary
Rebuilds ennisslingshot.com on the new SEO structure without changing the visual design, and adds the full content program (calendar + briefs) that the WordPress writer is executing against.

**Site (React/Vite, same look)**
- Static prerender of every route via `vite-react-ssg` (50 routes; `scripts/assert-prerendered.mjs` fails the build if any route lacks real HTML)
- Three hubs — `/slingshot-rental/`, `/bluebonnets/`, `/ennis/` — with 46 markdown-driven pages in `client/content/pages/**`
- Per-route `<Seo>` (title/meta/canonical/OG) + JSON-LD builders (LocalBusiness/TouristAttraction/AutoRental, Service+OfferCatalog, Article, ItemList, BlogPosting+Person+Organization, Event, BreadcrumbList, FAQPage)
- `sitemap.xml`, `robots.txt` (AI crawlers allowed), `llms.txt`, `rss.xml`, real `404.html`, Netlify www→apex + security headers/CSP
- Blog system: routing category hidden, visible SEO categories, category pages, pagination, author box, related/prev-next, hero-image prebuild
- Interactive islands: Leaflet trail map (3 official loops reconstructed from the Ennis Garden Club map, flagged approximate; `?embed=1`), bloom tracker + badge, Open-Meteo weather, events calendar with Event schema, drive-time picker
- Audit fixes: FAQ answers in the DOM, hero poster/`preload=metadata`/single fetch, image dimensions, corrected vehicle spec (ProStar 2.0L 4-cyl, 180/204 hp), NAP block (phone/address are `TODO` in `shared/business.ts`), Consent Mode v2 + Meta Pixel gating (closes TODO.md), stale "April 2026" copy replaced

**Content program**
- `seo/` — research (DataForSEO keyword DB, SERP/competitor intel, audience, backlinks), strategy, site structure, cluster plans, rebuild plan
- `calendars/CONTENT-CALENDAR.md` — 239 daily posts Sep 5 2026 → May 1 2027; one brief per post in `calendars/YYYY-MM-briefs/`; 14 spare topics in `calendars/bench/`
- Root docs: `CLAUDE.md`, `keywords.md`, `LINKING-CONVENTIONS.md`, `seo-onpage-strategy.md`

## Owner TODOs
- Real phone + address in `shared/business.ts` (placeholders are hidden in the UI until set)
- Replace the hero video file (current file has burned-in third-party text) — poster is in place
- 2027 festival dates when announced → `client/content/pages/bluebonnets/festival.md`, `client/content/data/events.json`
- After the Sep 15 laws post syncs, point the footer "Texas Slingshot Laws" link at `/blog/texas-slingshot-laws/` (`client/components/landing/Contact.tsx`)
- Review WordPress posts tagged `Needs Attention` (907, 917, 926, 927)

## Verification
- `pnpm run typecheck` ✔ · `pnpm run build:client` ✔ (50 routes prerendered; sitemap 49 URLs)
- All 49 pages: title/canonical/description present; JSON-LD parses; 0 orphans; 0 broken internal links
- Playwright pass over home/hubs/islands: 0 console errors
- Briefs: 239/239 present, format-validated, link paths validated against the route manifest, no forward links

🤖 Generated with [Claude Code](https://claude.com/claude-code)

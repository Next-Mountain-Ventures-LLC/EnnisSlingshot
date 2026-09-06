# seo-onpage-strategy.md — Running strategy record (Ennis Slingshot Experience)

_Living document. Newest entries at the top. Full documents live in `seo/`; this file is the index and the decision log the content-generation skill reads first._

## Where things are
| Document | Path |
|---|---|
| Keyword map (tracked targets → URLs) | `/keywords.md` |
| URL & internal-linking rules | `/LINKING-CONVENTIONS.md` |
| SEO strategy (plan, roadmap, KPIs) | `seo/strategy/SEO-STRATEGY.md` |
| Site structure (hub/spoke, page specs, schema) | `seo/strategy/SITE-STRUCTURE.md` |
| Offerings & business ideas memo | `seo/strategy/OFFERINGS-AND-BUSINESS-IDEAS.md` |
| Cluster plans (seo-cluster output) | `seo/strategy/cluster-ennis-bluebonnets.md`, `seo/strategy/cluster-slingshot-rental.md` |
| Research (keywords, SERP, competitors, audience, backlinks, business facts) | `seo/research/` |
| Content calendar + briefs | `seo/content-calendar/` |
| Sep 4 2026 technical audit | scratchpad `ennisslingshot-audit/` (findings copied into strategy where relevant) |

## Decision log
- **2026-09-05 — Full go-ahead (overnight build).** Owner approved: calendar + briefs, writer engaged in background (Sonnet writes; one week at a time; no image generation — a separate image agent fills WordPress featured images later), full site restructure in this React repo on branch `seo-rebuild` (PR, no merge/deploy), interactive builds (trail map, bloom tracker, weather via Open-Meteo, events, drive times). Defaults in force: author byline Joshua Ford; phone/address `TODO` tokens in `shared/business.ts`; hero video kept with poster + swap flagged; publish time 08:00 America/Chicago. WordPress sync verified working: post 195 landed at `client/content/blog/whats-it-like-to-ride-a-polaris-slingshot.md` (commit `bcd9961`).
- **2026-09-04 — Owner approvals (checkpoint):** plan approved as written. **Fleet = 2 Slingshots max at a time → groups cap at 4 people (2 vehicles); bachelor/bachelorette content stays but framed as "small group / up to 4," never large parties.** Site stays in this React/Vite repo (no Astro rebuild) because interactive assets (trail map, bloom tracker, weather) fit React; the restructure is part of this program. Defaults in force until changed: drivers 21+, meeting point Ennis Welcome Center (published address TBD), late-March soft open gated by bloom tracker, no June pilot in copy, Two-Up $149, Date Night $169. A separate Q&A session will settle remaining items.
- **2026-09-04 — Strategy phase.** Business = experience rental, Ennis TX, April season. Three hubs (`/slingshot-rental/`, `/bluebonnets/`, `/ennis/`) + blog with five pillar posts. Own the "Ennis bluebonnets" entity; target "slingshot rental (dallas/near me/texas)" honestly as an experience rental; capture DFW date-night/day-trip demand. Daily blog cadence Sep 5, 2026 → May 1, 2027. Pending owner decisions listed in the offerings memo §7.
- **2026-09-04 — Facts locked:** trails Apr 1–30; 2026 festival Apr 17–19 (2027 TBD, assume mid-April until announced); meeting point Ennis Welcome Center, 201 NW Main St; no motorcycle license needed (Tex. Transp. Code §521.085(b)); helmet rules §661.0015/§661.003; vehicle spec must be corrected to ProStar 2.0L 4-cyl, 180/204 hp by trim.
- **2026-09-04 — Exclusions:** "slingshot ride" (amusement ride), Slingshot for-sale/parts terms (except rent-vs-buy angle), suburb rental pages, Bluebonnet brand-noise terms.

## Publishing pipeline (WordPress → plugin → this repo)
- **Engine:** NXTMT Blog, `https://blog.nxtmt.ventures` (WordPress.com blog_id **249186184**, Jetpack, MCP-enabled). Posts are authored and **scheduled there** (`status: future` + `date`), never committed by hand; the routing plugin commits formatted markdown into `client/content/blog/` and the site renders it (`client/lib/blog.ts`).
- **Categories per post (exactly two + tags):** routing category **`EnnisSlingshot.com` (ID 34, slug `ennisslingshot-com`)** — hidden on the site — plus **one SEO category** for the pillar. Proposed SEO categories (to be created on the engine once approved): `Ennis Bluebonnets`, `Ennis & DFW Things to Do`, `Dallas Date Ideas`, `Polaris Slingshot 101`, `Ennis Slingshot News`. The engine's `Needs Attention` (ID 76) convention applies to posts published with first-hand passages omitted.
- **Existing Ennis content on the engine:** post 195 "What's it like to ride a Polaris Slingshot?" (Mar 25, 2026; categories About + EnnisSlingshot.com) — refresh candidate; do not duplicate the topic.
- **Site side:** blog templates must hide the routing category, render the SEO category as the visible category page, and read `pubDate`/`slug`/`categories`/`tags`/`heroImage` from the plugin's frontmatter.

## On-page standards (apply to every page and post)
- Title 45–60 chars, primary keyword front-loaded, brand suffix "| Ennis Slingshot" on site pages (optional on posts).
- Meta description 140–160 chars, page-specific, includes the offer or the answer.
- One H1; H2s phrased as the reader's task/question; answer-first paragraphs; tables with `<thead>` for anything comparative.
- FAQ answers rendered in the DOM (never conditionally unmounted).
- Author: named owner byline + `/about/` bio on every post; `Article`/`BlogPosting` + `Person` + `Organization` + `BreadcrumbList` schema baseline; `Event`/`TouristAttraction`/`Service`/`Offer` where applicable. No `HowTo`; `FAQPage` optional (AI citation only).
- Images: WebP/AVIF, explicit width/height, descriptive alt, LCP image not lazy. 3+ images per post; original Ennis photos preferred over stock.
- Every post: 8+ sourced facts/stats for factual topics, 3–8 external tier 1–3 links, ≥3 internal links per `/LINKING-CONVENTIONS.md`, one CTA to a package.
- Quality gate: `/blog analyze` score ≥ 80 before publishing.
- Freshness: seasonal pages refreshed each January; festival page updated the day dates are announced; bloom tracker weekly Mar 15–May 1.

## Build log — 2026-09-05 overnight (branch `seo-rebuild`)
- **Site:** static prerender via vite-react-ssg (50 routes; CI gate `assert-prerendered`), three hubs + 46 markdown pages, `<Seo>` + JSON-LD on every page, sitemap/robots/llms.txt/rss, real 404, Netlify www→apex + security headers/CSP, blog system (hidden routing category, category pages, pagination, author/related/prev-next, hero-image prebuild), Consent Mode v2 + Pixel gating, hero poster + image dimensions, corrected vehicle spec, NAP block with `TODO` phone/address. Interactive: trail map (Leaflet, `?embed=1`), bloom tracker + badge, Open-Meteo weather, events calendar (Event schema), drive-time picker.
- **Content:** 239/239 briefs (≈321k words of briefs) in `calendars/`, validated for format, link paths against the built route manifest, and the no-forward-link rule (`LATER(publishes …)` markers). 8 core Slingshot-101 spokes swapped in on Oct 5/14/19/24 and Nov 8/16/24/25; 14 displaced topics benched in `calendars/bench/`.
- **Writer:** Weeks 1–2 scheduled on the engine (posts 907–929; 907 auto-published Sep 5), Week 3 released; owner took over the writer session from here. `Needs Attention` posts to review: 907, 917, 926, 927.
- **Open owner items:** phone/address (`shared/business.ts`), hero video file swap (poster in place), 2027 festival dates (festival.md, events.json, Event schema), Chamber/Polaris Adventures/Garden Club sign-ups, late-March soft-open + Date Night pricing decisions, footer "Texas Slingshot Laws" link → `/blog/texas-slingshot-laws/` after Sep 15 sync.
- **Push/PR:** blocked by the session's permission classifier — owner runs `git push -u origin seo-rebuild` and `gh pr create` (PR body in `seo/strategy/PR-BODY.md`).

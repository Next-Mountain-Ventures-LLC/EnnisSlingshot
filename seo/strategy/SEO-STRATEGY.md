# SEO Strategy — Ennis Slingshot Experience (ennisslingshot.com)

_Prepared 2026-09-04 with the claude-seo `seo-plan` process (local-service template) on top of DataForSEO keyword/SERP data, GSC ground truth, and the Sep 4 site audit. Companion documents: `SITE-STRUCTURE.md`, `OFFERINGS-AND-BUSINESS-IDEAS.md`, `/keywords.md`, `/LINKING-CONVENTIONS.md`, cluster plans in this folder, research in `seo/research/`._

## 1. Discovery

| Item | Finding |
|---|---|
| Business | Experience rental of Polaris Slingshots — 1–2 hour self-drive rides on the Ennis Bluebonnet Trails, deploying from the Ennis Welcome Center. $69.99 / $79 / $149. Insurance included, no deposit, no motorcycle license. April season; proven bookings in 2026. |
| Audience | (1) Surprise planners buying birthdays/anniversaries for a partner, (2) DFW couples on a spring day-trip, (3) friend groups/bachelorettes, (4) try-before-buy enthusiasts, (5) out-of-town festival/Motorplex visitors. Details: `research/audience-market-research.md`. |
| Goal | Sell out every April 2027 day; build the organic engine so 2028 sells out without paid social. Secondary: prove/disprove off-season demand with data. |
| Current state | One CSR landing page, no blog content, no NAP, no schema, no sitemap, no GBP. GSC: 4 queries / 0 clicks in 90 days. Health score 31/100 (audit, Sep 4). 22 referring domains, all spam. |
| Constraints | Site look must stay identical; tech rebuild is happening anyway; custom development available; owner wants zero day-to-day involvement in content production. |
| KPIs | Organic sessions, GSC impressions/clicks by cluster, local-pack presence for "slingshot rental dallas/near me," rankings for P1 keywords, referring domains, bookings attributed to organic (GA4 → Acuity), gift-card sales Dec/Feb, April sell-through %. |

## 2. Competitive analysis (summary — full detail in `research/competitors.md`, `research/serp-intelligence.md`)

| Competitor | What they have | What they don't |
|---|---|---|
| dallasslingshotrental.com (Arlington) | #1 organic + local pack for "slingshot rental dallas"; 460 reviews; Polaris Adventures listing; one "things to do in Dallas" post capturing ~90k/mo adjacent volume | No city pages, no bluebonnet/Ennis content, no legal FAQ; 62 referring domains mostly spam |
| dfwslingshotrentals.com | #1 local pack on GBP strength alone (141 reviews) | Zero organic footprint |
| bigalsslingshots.com (Arlington) | Local pack #3 | Homepage-only site, no content |
| slingshotrentalssa.com (San Antonio) | `/faq` cited in Google's AI Overview for the Texas license question; scenic-route posts | Wrong region |
| adventures.polaris.com / cloudofgoods.com | Platform authority; templated city pages with price snippets | Not local, not experiential |
| Bluebonnet SERP owners (bluebonnettrail.org, visitennistexas.com, .gov, CVBs, bloggers) | Authority for every Ennis/bluebonnet query | **No rental or experience business anywhere on page 1** |

**Where we win:** every Ennis/bluebonnet query (first-party location advantage, zero commercial competition), every DFW "date ideas / day trip" query (no slingshot presence), Fort Worth (no dedicated competitor page), the Texas-law FAQ (contested AI Overview), and the local pack once a GBP exists. Keyword difficulty across all of it is 0–28.

## 3. Architecture (full spec: `SITE-STRUCTURE.md`)
- **Hub 1 `/slingshot-rental/`** — transactional: packages, pricing, requirements, four area pages (near Dallas / Fort Worth / Arlington / Waxahachie–Ellis County) and one Texas page. Visible `Offer` pricing for rich snippets.
- **Hub 2 `/bluebonnets/`** — the entity pillar ("Ennis Bluebonnet Trails & Festival 2027 Guide") with 10 evergreen spokes including three custom builds: interactive Trail Map, live Bloom Tracker, Weather page.
- **Hub 3 `/ennis/`** — "Things to Do in Ennis" tourism pillar with day-trip, Motorplex, Polka Fest, Scarborough/Waxahachie, eat/stay spokes and an Events calendar build.
- **Blog** — five pillar posts (Slingshot 101, Texas Slingshot Laws, Dallas Date Ideas, Things to Do in Dallas This Weekend, Texas Bluebonnet Season) with ~230 spokes across five categories.
- **Support** — About (E-E-A-T), FAQ (statute-cited, DOM-rendered), Reviews, Gallery, Contact (NAP), Book.
- Internal linking per `/LINKING-CONVENTIONS.md`: hub↔spoke bidirectional, cross-cluster bridges, ≥3 links/post, no orphans. Location pages: 5 (well under the 30-page gate), each ≥600 unique words.

## 4. Content strategy

### Pillars and cadence
| Pillar | Share of posts | Purpose | Season weight |
|---|---|---|---|
| Ennis bluebonnets | 30% | Own the entity; earn authority links; convert festival tourists | Light Sep–Dec (evergreen prep), heavy Jan–Apr (weekly bloom updates Mar 15–May 1) |
| Ennis & DFW tourism / day trips | 20% | Capture "things to do near Dallas / Waxahachie / Ennis" and event traffic (Motorplex Oct & Mar, Scarborough Apr) | Year-round; event-timed |
| Dallas date ideas & occasions | 20% | Highest adjacent volume; feeds Date Night + Gift Cards | Year-round; spikes Dec (gifts), Feb (Valentine's) |
| Polaris Slingshot 101 | 20% | National informational authority; first-timer reassurance; AI-citation targets | Year-round; front-load Sep–Nov |
| News & business | 10% | Season announcements, packages, recaps, partner features, E-E-A-T | As it happens |

Cadence: **1 post/day, Sep 5 2026 → May 1 2027 (239 posts)**, drafted from briefs in `seo/content-calendar/briefs/`. Mix inside "new" content follows the calendar heuristic (guides 35%, listicles 20%, comparisons 15%, data/case 10%, thought/news 10%, FAQ/knowledge 10%). Freshness: seasonal pages get a January refresh pass; the bloom tracker is weekly.

### E-E-A-T plan
- Named owner byline on every post; `/about/` with the "motorcyclist who found these roads" story, safety credentials, and the Welcome Center relationship.
- First-hand content only where it's real: route reports, bloom photos, ride-along video, what riders say. No fabricated testimonials or ratings.
- Every legal/spec claim cites a primary source (Texas Transportation Code, Polaris spec pages, ennistx.gov, bluebonnettrail.org).
- Reviews: capture at hand-back (QR to Google + TripAdvisor); publish `aggregateRating` only when ≥5 real reviews exist.

### Content quality standards
`/blog analyze` ≥ 80 before publish; Flesch 60–70; 3+ images (original preferred), 1–2 charts where data exists; tables with `<thead>`; answer-first sections; FAQ items only where PAA justifies; schema baseline Article/BlogPosting + Person + Organization + BreadcrumbList.

## 5. Technical foundation (carry-over from the Sep 4 audit)
| Requirement | Target |
|---|---|
| Rendering | Prerender/SSG every route (current CSR shell is empty to AI crawlers) |
| Routing | SPA fallback so `/blog/*` and hubs stop 404ing |
| Sitemap | Build-time `sitemap.xml`, declared in `robots.txt`; submit to GSC + Bing |
| Canonical + meta | Per-route title/description/canonical/OG |
| Schema | `LocalBusiness` (+`TouristAttraction`, `AutoRental`), `Service`/`OfferCatalog`, `Event` (festival), `TouristAttraction` (trails), `Article`, `Person`, `Organization`, `BreadcrumbList`, optional `FAQPage` |
| CWV | LCP < 2.5 s (replace/compress the 51 MB hero video; poster image; `preload="metadata"`), CLS < 0.1 (width/height on all images), INP < 200 ms; code-split routes |
| AI readiness | `llms.txt`; robots allows GPTBot/ClaudeBot/PerplexityBot; FAQ answers in DOM |
| Local | GBP (category "Tourist attraction" + "Recreational vehicle rental agency"), Bing Places, Apple Business Connect; NAP identical everywhere |
| Analytics | GA4 (already installed) with Acuity booking events; grant the reporting service account access; Consent Mode v2 banner (TODO.md) |
| Measurement | GSC `sc-domain:ennisslingshot.com`; Search Atlas rank tracking for P1/P2 keywords from Jan 2027 |

## 6. Implementation roadmap

### Phase 1 — Foundation (Sep 5 – Oct 31, 2026)
- Rebuild on the new structure (same design): hubs, package pages, support pages, schema, sitemap, prerender. Fix vehicle spec, add NAP, replace hero video.
- Publish blog daily from Sep 5 (Slingshot 101 cluster + evergreen Ennis/DFW + date ideas). Pillar posts: Slingshot 101 (Sep), Texas Slingshot Laws (Oct).
- Citations & foundations: GBP, Bing, Apple, Yelp, TripAdvisor, Nextdoor; Ennis Chamber; Polaris Adventures application; Visit Ennis / Ennis Y'all app; Ennis Daily News story. Events calendar build (Oct). Motorplex Stampede of Speed presence (Oct).

### Phase 2 — Expansion (Nov 1 – Dec 31, 2026)
- Gift-card product live by Nov 15; "experience gifts Dallas" content; Valentine's prep. Texas Motorplex + Scarborough + Polka pages. Dallas Date Ideas pillar (Nov). Marketplace listings (Viator, Airbnb Experiences, GetYourGuide, Cloud of Goods). Groupon off-season test. Garden Club sponsorship conversation. Draft Trail Map data.

### Phase 3 — Scale into season (Jan 1 – Mar 31, 2027)
- `/bluebonnets/` hub + all spokes live by Jan 15 with "2027" titles; Trail Map build (Jan); day-trip itineraries; Weather page (Feb); blogger pitches (Jan) and regional media pitches (Feb) per `research/backlink-opportunities.md`; Bloom Tracker live Mar 15; soft-open "Early Bloom Rides" if Option B approved; festival page updated the day dates drop; vendor booth application (~Feb deadline).

### Phase 4 — Peak & harvest (Apr 1 – May 1, 2027)
- Daily bloom updates, festival week coverage, live "what's blooming this weekend" posts, media ride-alongs, review capture, photo pack shoot. May 1: season recap data post; refresh every seasonal page with 2027 facts; decide on May/June pilots with booking data.

## 7. KPI targets
| Metric | Baseline (Sep 2026) | Dec 31, 2026 | Mar 31, 2027 | Apr 30, 2027 |
|---|---|---|---|---|
| Indexed pages | 1 | 130+ | 230+ | 270+ |
| GSC impressions / 28d | 20 | 5,000 | 40,000 | 150,000+ (April spike) |
| GSC clicks / 28d | 0 | 150 | 1,500 | 6,000+ |
| P1 keywords in top 10 (of ~45) | 0 | 8 | 20 | 30 |
| Local pack for "slingshot rental dallas/near me" | absent | listed | top 3 (Ennis-adjacent) | top 3 |
| Legit referring domains | 0 | 15 | 25 | 35+ |
| Organic-attributed bookings | 0 | gift cards: 20 | pre-bookings: 100 | April sell-through ≥ 85% |

## 8. Risks & mitigations
- **2027 festival dates unannounced** → publish "mid-April" with a dated update banner; `Event` schema added on announcement.
- **Bloom timing** → Bloom Tracker + flexible rescheduling; "Early Bloom Rides" gated by status.
- **No physical address for GBP** → decide address model now (see offerings memo §7); without GBP the local pack is unwinnable.
- **Fleet capacity vs. demand** → festival-weekend premium pricing + waitlist; group page states vehicle count.
- **Spam backlinks (22)** → disavow file once real links exist.
- **Owner bandwidth** → every post ships from a brief; only decisions listed in the offerings memo need the owner.

## 9. Deliverables index
- `SEO-STRATEGY.md` (this), `SITE-STRUCTURE.md`, `OFFERINGS-AND-BUSINESS-IDEAS.md`, `cluster-ennis-bluebonnets.md`, `cluster-slingshot-rental.md`
- `/keywords.md`, `/LINKING-CONVENTIONS.md`, `/seo-onpage-strategy.md`
- `seo/research/*` (keyword DB, SERP intelligence, competitors, audience, backlinks, business context)
- `seo/content-calendar/` (calendar + briefs — next phase)

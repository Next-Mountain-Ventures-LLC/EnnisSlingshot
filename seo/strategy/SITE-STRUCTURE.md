# Site Structure — ennisslingshot.com (rebuild)

_Designed 2026-09-04 from DataForSEO keyword data, live SERP analysis, and audience research (see `seo/research/`). Visual design stays identical to the current site; this document defines the URL hierarchy, what each page is for, the keyword it targets, its template, and its schema. Pages marked **[BUILD]** are custom-developed interactive assets, not just copy._

## Design principles (why it's shaped this way)

1. **Three hubs, one blog.** Google rewards three different page types for our three intents: a *local business/booking* page for rental intent, an *authority guide* for Ennis-bluebonnet intent, and a *"things to do" listicle hub* for tourism intent. Each gets its own hub with spokes; the blog feeds all three.
2. **Own the entity, not just the keyword.** "Ennis bluebonnets" is a knowledge-graph entity (festival, trails, Welcome Center, Bluebonnet Capital). Site pages under `/bluebonnets/` are evergreen, updated annually, and carry the interactive assets that earn links. Dated/seasonal articles live in `/blog/`.
3. **Rental terms without misleading anyone.** `/slingshot-rental/` captures "slingshot rental (dallas / near me / texas)" — the highest-value, lowest-difficulty commercial terms — while every page says plainly: 1–2 hour self-drive *experiences* from Ennis, TX, 35 miles south of Dallas. Area pages are "near Dallas / near Fort Worth," never "in Dallas."
4. **Few, deep location pages.** Only Dallas, Fort Worth, Arlington and Waxahachie/Ellis County have any measurable demand or strategic reason to exist. No suburb spray (Plano/Frisco/etc. returned zero volume). Well under the 30-page quality gate.
5. **Every commercial page is bookable in one tap; every informational page ends at a package.** Acuity booking links are on every hub and package page; blog posts link to the relevant package and to their hub.

## URL hierarchy

```
/                                                Home
├── /slingshot-rental/                           HUB 1 — Rental & Experiences (transactional)
│   ├── /slingshot-rental/drive-and-go/              1-Hour Drive & Go ($69.99)
│   ├── /slingshot-rental/bluebonnet-trail-experience/ 2-Hour Bluebonnet Trail Experience ($79 / $149)
│   ├── /slingshot-rental/date-night/                Date Night / Golden Hour Ride (proposed)
│   ├── /slingshot-rental/groups/                    Groups, birthdays, bachelorette, convoys
│   ├── /slingshot-rental/gift-cards/                Gift cards & e-vouchers
│   ├── /slingshot-rental/pricing/                   Pricing & what's included
│   ├── /slingshot-rental/requirements/              Driver requirements, approval, insurance, what to wear
│   ├── /slingshot-rental/near-dallas/               Area page
│   ├── /slingshot-rental/near-fort-worth/           Area page
│   ├── /slingshot-rental/near-arlington/            Area page
│   ├── /slingshot-rental/waxahachie-ellis-county/   Area page (home county + Scarborough tie-in)
│   └── /slingshot-rental/texas/                     "Slingshot Rental in Texas" — statewide page for Houston/Austin/SA/Waco travelers
├── /bluebonnets/                                HUB 2 — Ennis Bluebonnet Trails & Festival Guide (authority pillar, updated yearly)
│   ├── /bluebonnets/festival/                       Ennis Bluebonnet Trails Festival 2027 (dates, tickets, schedule, parking)
│   ├── /bluebonnets/trail-map/          [BUILD]     Interactive Ennis Bluebonnet Trail Map (3 official loops + our 2-hr route + photo pins)
│   ├── /bluebonnets/bloom-tracker/      [BUILD]     Live Bloom Tracker — weekly dated status Mar 15–May 1 (+ "when do bluebonnets bloom")
│   ├── /bluebonnets/weather/            [BUILD]     Trail & festival weather (10-day forecast + April climate normals + ride/no-ride guidance)
│   ├── /bluebonnets/photo-spots/                    Best bluebonnet photo spots in Ennis (+ free photo pack)
│   ├── /bluebonnets/welcome-center/                 Ennis Welcome Center guide — where the trails (and we) start
│   ├── /bluebonnets/bluebonnet-capital-of-texas/    Why Ennis is the Official Bluebonnet City of Texas (entity page; Ennis vs Burnet)
│   ├── /bluebonnets/where-to-see-bluebonnets-near-dallas/  Regional guide (Ennis first, then alternatives)
│   ├── /bluebonnets/texas-bluebonnet-festivals/     Every Texas bluebonnet festival & trail, compared
│   └── /bluebonnets/history/                        70+ years of the Ennis trails (Ennis Garden Club, 1951→)
├── /ennis/                                      HUB 3 — Things to Do in Ennis, TX (tourism listicle pillar)
│   ├── /ennis/day-trip-from-dallas/                 Dallas → Ennis day-trip itinerary (35 mi / ~37 min)
│   ├── /ennis/weekend-itinerary/                    Ennis + Waxahachie weekend (Scarborough Faire + bluebonnets)
│   ├── /ennis/texas-motorplex/                      Texas Motorplex race-weekend guide (what else to do in Ennis)
│   ├── /ennis/national-polka-festival/              National Polka Festival guide (Memorial Day weekend)
│   ├── /ennis/where-to-eat/                         Restaurants in Ennis
│   ├── /ennis/where-to-stay/                        Hotels, B&Bs, RV in Ennis & Waxahachie
│   ├── /ennis/downtown/                             Historic downtown Ennis guide
│   └── /ennis/events/                   [BUILD]     Ennis & Ellis County event calendar (year-round; linkable)
├── /blog/                                       Blog index (category filters)
│   ├── /blog/category/slingshot-101/                Informational Slingshot cluster (pillar post + spokes)
│   ├── /blog/category/bluebonnets/                  Seasonal bluebonnet articles, bloom updates, festival news
│   ├── /blog/category/ennis-dfw/                    Day trips, things to do, local events
│   ├── /blog/category/date-ideas/                   Dallas date ideas, occasions, gifts
│   ├── /blog/category/news/                         Business updates, season announcements, recaps
│   └── /blog/[slug]/                                Individual posts (flat slugs, no dates in URL)
├── /about/                                      Owner story, why Ennis, the roads, safety-first approach (E-E-A-T)
├── /faq/                                        Master FAQ incl. "Do you need a motorcycle license for a Slingshot in Texas?" (statute-cited)
├── /reviews/                                    Reviews & rider stories (Google/TripAdvisor embeds once they exist)
├── /gallery/                                    Photo & video gallery (Slingshot in bluebonnets)
├── /contact/                                    NAP, map, hours, Welcome Center meeting point, text/call
└── /book/                                       Booking (Acuity) — all packages, add-ons, gift cards
```

Also: `/sitemap.xml`, `/robots.txt` (with Sitemap directive), `/llms.txt`, `/privacy/`, `/terms/` (rental agreement summary).

## Page-by-page spec

### Home `/`
- **Purpose:** Convert. Same hero look as today, but the H1 carries the entity and the offer: *"Ennis Slingshot Experience — Drive a Polaris Slingshot Through the Bluebonnet Capital of Texas"*; subhead: 35 minutes south of Dallas · from $69.99 · insurance included · no motorcycle license needed.
- **Targets:** `ennis slingshot` (brand), `slingshot experience` (50 US, KD 1, peaks April), `polaris slingshot rental near dallas` (support), plus sitelinks to hubs.
- **Above the fold:** meeting point (Ennis Welcome Center, 201 NW Main), season dates, three package cards, "Book" CTA.
- **Sections:** how it works (3 steps), packages, the trails (map teaser → `/bluebonnets/trail-map/`), why Ennis, reviews, FAQ excerpt (rendered in DOM), footer NAP.
- **Schema:** `LocalBusiness` (subtype `TouristAttraction` + `AutoRental` via `additionalType`), `Organization`, `WebSite` with `SearchAction`, `OfferCatalog`.

### HUB 1 — `/slingshot-rental/`
- **Title:** Slingshot Rental & Experiences Near Dallas | Ennis Slingshot Experience
- **Targets:** `slingshot rental dallas` / `rent slingshot dallas` (880 TX, KD 2), `slingshot rental near me` (480 TX / 6,600 US), `polaris slingshot rental` (170 TX / 1,900 US, KD 11), `rent a slingshot` (2,400 TX), `slingshot rentals`.
- **Content (1,800–2,500 words):** what an "experience rental" is vs a daily rental (honest, first screen), packages with visible prices (Offer schema → price snippets like Cloud of Goods gets), requirements summary, "coming from Dallas / Fort Worth / Arlington" with drive times, the route, FAQ block, reviews. Links to every child page and to `/bluebonnets/`.
- **Template:** pillar-page (commercial). **Schema:** `Service` + `OfferCatalog` + `LocalBusiness` + `FAQPage`(optional) + `BreadcrumbList`.

| Child page | Target keyword(s) | Notes |
|---|---|---|
| `/drive-and-go/` | `drive a slingshot` (140 US), `slingshot test drive` (20), `1 hour slingshot rental` | Position as the no-dealer test drive; try-before-buy persona |
| `/bluebonnet-trail-experience/` | `bluebonnet tour` (10), `bluebonnet tours texas` (20, Mar 90), `slingshot tour`, `ennis bluebonnet trails tour` | Flagship; embeds trail map; 2-hr route description with stops |
| `/date-night/` | `date night ideas dallas` (2,900 TX), `unique date ideas dallas` (70, KD 0), `couples activities dallas` (1,600) | Proposed golden-hour package; couples photo stop |
| `/groups/` | `bachelorette party ideas dallas` (90), `bachelor party ideas dallas` (50), `birthday ideas dallas` (320), `group activities near dallas` | State fleet size and how convoys/waves work |
| `/gift-cards/` | `experience gifts dallas` (90; Dec 480), `slingshot gift card`, `experience gifts for him texas` | Acuity gift certificates; Dec/Feb/June pushes |
| `/pricing/` | `how much is it to rent a slingshot` (20), `slingshot rental prices` (10), `polaris slingshot rental cost` | Comparison table vs typical DFW rental ($150/hr + deposit) |
| `/requirements/` | `slingshot rental requirements` (10), `slingshot rental insurance` (10), `slingshot rental age requirement` | Approval flow, insurance, age, what to wear, weather policy |
| `/near-dallas/` | `slingshot rental dallas` (support), `polaris slingshot rental dallas` (50 US, Jun 210), `things to do near dallas` (1,000) | Itinerary from Dallas + booking; visible price schema |
| `/near-fort-worth/` | `slingshot rental fort worth` (40, KD 0), `polaris slingshot rental fort worth` | No independent competitor page exists |
| `/near-arlington/` | `slingshot rental arlington tx` (40) | Competitors are Arlington-based; position as the scenic alternative |
| `/waxahachie-ellis-county/` | `things to do in waxahachie` (1,900, KD 6) support, `slingshot rental waxahachie` | Scarborough Faire weekend pairing |
| `/texas/` | `texas slingshot` (90 US), `slingshot texas` (30), `slingshot rental texas` (10, KD 0), `slingshot experience texas` | Statewide page: drive times from Houston/Austin/SA/Waco; "make it a bluebonnet weekend" |

### HUB 2 — `/bluebonnets/` (the entity we own)
- **Title:** Ennis Bluebonnet Trails & Festival 2027: The Complete Guide | Ennis Slingshot
- **Targets:** `ennis bluebonnet trails` / `bluebonnet trail ennis` (12,100 TX in Apr, KD 12), `ennis bluebonnet festival` (14,800 Apr, KD 7), `ennis bluebonnet festival 2027` (2026 variant: 3,600 Mar+Apr), `ennis texas bluebonnet` (1,600 Apr), `bluebonnet capital of texas`.
- **Content (3,500–4,500 words, refreshed every January and weekly in season):** dates (trails Apr 1–30; festival TBD → placeholder "mid-April, historically 2nd/3rd weekend"), how the trails work (3 loops, 40+ miles, Ennis Garden Club), Welcome Center, bloom timing, map embed, photo etiquette/laws, parking/crowds, where to eat/stay, other April events, "how we fit in" (one section, not a sales page). Links to all spokes.
- **Template:** pillar-page. **Schema:** `Article` + `Event` (festival, once dates known) + `TouristAttraction` (trails) + `BreadcrumbList` + `FAQPage`(optional).

| Spoke | Target keyword(s) | Build notes |
|---|---|---|
| `/festival/` | `ennis bluebonnet festival` (14,800 Apr), `ennis bluebonnet festival 2027`, `…dates`, `…parking` (30), `…schedule`, `…tickets` | `Event` schema; update the day dates are announced; parking map |
| `/trail-map/` **[BUILD]** | `ennis bluebonnet trail map` (1,000 Apr), `ennis texas bluebonnet trails map` (1,000), `bluebonnet trail texas map` (260 Mar), `bluebonnet trail map` | Leaflet/Mapbox map: official North/South/West loops, our 2-hr Slingshot route, photo pins, restrooms, parking; downloadable PDF; embed code for bloggers |
| `/bloom-tracker/` **[BUILD]** | `when do bluebonnets bloom` (1,300 Mar, KD 4), `are the bluebonnets blooming`, `bluebonnet report texas`, `bluebonnet forecast`, `best time to see bluebonnets in ennis` | Weekly dated status + photos per loop, mirrors Ennis Garden Club report; status badge reused on home + hub; RSS/JSON so newsrooms can cite |
| `/weather/` **[BUILD]** | `ennis bluebonnet weather`, `ennis tx weather` (6,600 US), festival-weekend weather | Open-Meteo forecast widget for 75119, April normals (78°F/55°F, ~26% rain-day), ride/no-ride policy |
| `/photo-spots/` | `bluebonnet photos` (4,400 Mar), `bluebonnet photoshoot` (720 Mar), `bluebonnet family photos` (720), `best places to take bluebonnet pictures`, `bluebonnet pictures near me` | Named spots (Meadow View, Bluebonnet Park, Sugar Ridge Rd, Lakeview/Bardwell), etiquette, golden-hour times; free CC-BY photo pack |
| `/welcome-center/` | `ennis welcome center` (3,600 Apr), `ennis visitor center` (260 Apr) | Hours, maps, restrooms, what to grab, "our Slingshots stage here"; NAP consistent with city listing |
| `/bluebonnet-capital-of-texas/` | `bluebonnet capital of texas` (210 Mar), "what city in Texas has the most bluebonnets" (PAA) | Entity page: 1997 legislature designation, Ennis vs Burnet, Texas Highways "co-capitals" piece |
| `/where-to-see-bluebonnets-near-dallas/` | `where to see bluebonnets in texas` (880 Mar, KD 0), `bluebonnets near dallas` (90 Apr), `bluebonnet fields near dallas`, `bluebonnet trails near me` (320) | Ennis first, then honest regional list; drive times |
| `/texas-bluebonnet-festivals/` | `texas bluebonnet festival` (18,100 Apr US), `bluebonnet festivals in texas`, `burnet bluebonnet festival` (12,100 Apr) | Comparison table: Ennis, Burnet, Chappell Hill, Marble Falls; why Ennis for DFW |
| `/history/` | `ennis bluebonnet trails an april driving route` (18,100 Apr US — Google's KG name for the trails), `oldest bluebonnet trail texas` | Historical-marker sourced; links to Garden Club |

### HUB 3 — `/ennis/` (tourism)
- **Title:** Things to Do in Ennis, TX (2026–2027): Bluebonnets, Motorplex, Polka & More
- **Targets:** `things to do in ennis tx` / `ennis tx attractions` (390 TX; 590 Mar/Apr/Oct; KD 0), `what to do in ennis tx`, `ennis texas` (6,600 TX), `downtown ennis tx` (260).
- **Content (2,500–3,500 words):** ranked listicle of 20+ attractions (Google's top_sights carousel is the model), seasonal picks, day-trip logistics. **Template:** listicle/pillar hybrid. **Schema:** `ItemList` + `TouristDestination` + `BreadcrumbList`.

| Spoke | Target keyword(s) |
|---|---|
| `/day-trip-from-dallas/` | `day trips from dallas` (880, KD 0; Mar 1,300), `things to do near dallas` (1,000, KD 11), `weekend getaways from dallas` (1,600) |
| `/weekend-itinerary/` | `things to do in waxahachie` (1,900, KD 6), `scarborough renaissance festival` (135,000 Apr — capture with "what else to do near Scarborough Faire"), `romantic getaways near dallas` (140) |
| `/texas-motorplex/` | `texas motorplex` (12,100 TX; 40,500 Mar / 33,100 Oct), `texas motorplex schedule` (210), `things to do near texas motorplex` |
| `/national-polka-festival/` | `ennis polka festival` (480; May 3,600), `ennis czech music festival` |
| `/where-to-eat/` | `restaurants in ennis tx` (2,900 US; Apr 4,400) |
| `/where-to-stay/` | `hotels in ennis tx` (1,900 US; Mar 4,400), `ennis tx rv park`, `bed and breakfast ennis tx` |
| `/downtown/` | `downtown ennis tx` (260; Apr 720), `ennis tx shopping` |
| `/events/` **[BUILD]** | `ennis tx events` (40; Apr 70), `what's going on in ennis this weekend` (PAA) — `Event` schema feed |

### Blog `/blog/`
- Flat slugs, no dates in URL. Category pages are real indexable pages with intro copy (not thin).
- **Pillar posts (3,000–4,000 words, `pillar-page` template):**
  1. `/blog/polaris-slingshot-101/` — "What Is a Polaris Slingshot? The First-Timer's Complete Guide" (`what is a polaris slingshot` 170; `polaris slingshot` 74,000/KD 20 long-tail capture; `polaris slingshot 3 wheel` 5,400)
  2. `/blog/texas-slingshot-laws/` — "Texas Slingshot (Autocycle) Laws: License, Helmet, Age, Insurance" (`do you need a motorcycle license for a slingshot` 590 US/KD 5; currently an AI Overview cites a competitor FAQ with contradictory info)
  3. `/blog/dallas-date-ideas/` — "75 Dallas Date Ideas (Ranked by Vibe)" (`date ideas dallas` 2,400/KD 0; `date night ideas dallas` 2,900; `fun date ideas dallas` 720)
  4. `/blog/things-to-do-in-dallas-this-weekend/` — living post (`things to do in dallas this weekend` 9,900) — the dallasslingshotrental.com play, done properly
  5. `/blog/bluebonnet-season-texas/` — "Texas Bluebonnet Season 2027: When, Where, and How to See Them" (`bluebonnet season texas` 1,300 Mar/KD 9; `texas bluebonnet` 27,100 Mar US)
- **Spokes:** ~230 dated posts across the five categories, mapped in the content calendar (`seo/content-calendar/`).

### Support pages
| Page | Purpose | Targets / schema |
|---|---|---|
| `/about/` | Owner story (motorcyclist who found these roads), why an *experience* not a rental, safety approach, team | E-E-A-T; `Person` + `Organization` |
| `/faq/` | Master FAQ — every question from the PAA bank, statute-cited; answers rendered in DOM | `FAQPage` (AI-citation), links to `/blog/texas-slingshot-laws/` |
| `/reviews/` | Review wall + rider stories; ask-for-review QR flow | `LocalBusiness` w/ `aggregateRating` once ≥5 real reviews |
| `/gallery/` | Photos/video; VideoObject for ride-along | `ImageGallery`, `VideoObject` |
| `/contact/` | NAP (needs a real phone + address), Welcome Center meeting point map, hours, text | `ContactPage`, `LocalBusiness` |
| `/book/` | Acuity embeds for all packages + add-ons + gift cards | `ReserveAction` |

## Internal linking rules (summary — full rules in `/LINKING-CONVENTIONS.md`)
- Every hub links to all its spokes; every spoke links to its hub in the first 300 words with varied anchor text.
- Every blog post: ≥3 internal links — its category pillar, one related spoke, one commercial page (package or hub).
- Cross-hub bridges: `/bluebonnets/*` → `/slingshot-rental/bluebonnet-trail-experience/`; `/ennis/*` → `/slingshot-rental/near-dallas/`; `/blog/slingshot-101/*` → `/slingshot-rental/drive-and-go/`.
- Global nav: Experiences · Bluebonnets · Ennis · Blog · FAQ · Book. Footer: NAP, hubs, top 6 spokes, socials.

## Custom builds (linkable assets) — priority order
1. **Interactive Trail Map** (`/bluebonnets/trail-map/`) — Jan 2027. Leaflet + GeoJSON of the three loops (digitize from the official PDF with the Garden Club's blessing), our route, pins; embed snippet for bloggers.
2. **Bloom Tracker** (`/bluebonnets/bloom-tracker/`) — live Mar 15, 2027. Markdown-driven weekly entries + JSON endpoint + badge component.
3. **Weather page** (`/bluebonnets/weather/`) — Feb 2027. Open-Meteo API (free, no key), 10-day forecast + normals.
4. **Events calendar** (`/ennis/events/`) — Oct 2026. Static JSON → `Event` schema.
5. **Photo pack** (`/bluebonnets/photo-spots/`) — shoot April 2027, publish May.

## Migration notes for the rebuild
- Keep the current design system, hero video (replace the file), booking flow.
- Server-render or prerender every page (the current CSR shell is invisible to AI crawlers — see the Sep 4 audit).
- Add SPA fallback, sitemap generation, canonical tags, per-route meta, and the JSON-LD above (drafts already in `seo/research/../ennisslingshot-audit/findings/schema.md` from the audit).
- Fix the vehicle spec (2.0L ProStar four-cylinder; 180/204 hp by trim) everywhere before launch.

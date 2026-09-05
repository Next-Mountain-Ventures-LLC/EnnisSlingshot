# Ennis Bluebonnets — Semantic Cluster Plan

**Seed:** "Ennis bluebonnets" | **Business:** Ennis Slingshot Experience (ennisslingshot.com) | **Generated:** 2026-09-04
**Strategic goal (owner's words):** own everything Ennis + bluebonnets — festival, trails, maps, season/bloom timing, photos, visitor logistics, the town, and adjacent April/May events.

**Data sources:** `seo/research/keyword-research-summary.md` and `seo/research/serp-intelligence.md` (DataForSEO volumes/KD/SERP pulls, 2026-09-04) for keyword economics; fresh WebSearch SERP pulls (this session) for the overlap checks in Section 2. Full machine-readable output: [`cluster-plan.json`](./cluster-plan.json). Interactive map: [`cluster-map.html`](./cluster-map.html) (open in a browser).

---

## 1. Keyword universe (44 candidates expanded → 16 primaries after SERP-driven merges)

Expansion pulled from the existing keyword research doc + PAA questions in `serp-intelligence.md` + fresh WebSearch related-searches. Buckets: festival/trail core, trail map/logistics, Welcome Center/visitor logistics, bloom timing/season, photography, legal/etiquette, other-TX-bluebonnet comparisons, and adjacent April/May events. Navigational keywords (brand names — `bluebonnettrail.org`, `visitennistexas.com`, specific hotel/restaurant brand names) were excluded from clustering per the skill's intent rules.

Of the ~44 expanded variants, several collapsed into a single target page after SERP-overlap testing (see §2), leaving **16 primary pages** (1 pillar + 15 spokes) with 20+ secondary keywords folded in as sections/subheads rather than standalone URLs. This keeps every cluster inside the 2–4-posts-per-cluster constraint and the total near the middle of the 5–21-post range.

## 2. SERP overlap findings (methodology: shared top-10 organic URLs, WebSearch-sourced this session; thresholds 7-10=merge, 4-6=same cluster, 2-3=interlink, 0-1=separate)

| Pair | Shared URLs (top 10) | Score | Action taken |
|---|---|---|---|
| ennis bluebonnet festival ↔ ennis bluebonnet trail | bluebonnettrail.org, visitennistexas.com ×2, elliscountytx.gov, facebook.com, tripadvisor.com | ~6 | **Merged into one pillar** (borderline 4-6/7-10; treated as a hub-level merge since both are the same real-world event/place) |
| when do bluebonnets bloom ↔ bluebonnet season texas | wildflower.org, mickeyshannon.com, shebuystravel.com, thetexaswildflower.com | ~6 | **Merged into one spoke** ("When Do Bluebonnets Bloom") |
| ennis bluebonnet trail map ↔ ennis welcome center | ennistx.gov (domain-level only, different pages) | ~1 | Separate posts, same cluster (physical/topical adjacency — maps are handed out at the Welcome Center) |
| hotels in ennis tx ↔ restaurants in ennis tx | tripadvisor.com, yelp.com (different listing pages) | ~1 | Separate posts, same cluster |
| bluebonnet photos ↔ bluebonnet photoshoot tips | none (stock-photo sites vs. photography-tip blogs) | 0 | Separate posts, same cluster |
| is it illegal to pick a bluebonnet ↔ bluebonnet photoshoot tips | none | 0 | Separate posts, same cluster (etiquette pairs with the photo-taking activity) |
| things to do in ennis tx ↔ ennis bluebonnet trail map | visitennistexas.com, tripadvisor.com, facebook.com | ~3 | **Interlink** across clusters (Town Guide ↔ Trail Map) |
| ennis welcome center ↔ things to do in ennis tx | ennistx.gov, visitennistexas.com | ~2 | Interlink |
| best bluebonnet trails in texas ↔ burnet bluebonnet festival | minimal (Burnet SERP is a fully separate domain set: bluebonnetfestival.org, burnetchamber.org, highlandlakesofburnetcounty.com) | ~1 | Separate target, unified into one **comparison** post rather than left uncaptured |
| when do bluebonnets bloom ↔ best bluebonnet trails in texas (comparison) | wildflower.org-adjacent | ~2 | Interlink |
| is it illegal to pick ↔ when do bluebonnets bloom | wildflower.org-adjacent | ~2 | Interlink |
| scarborough renaissance festival ↔ texas motorplex | wikipedia.org, tripadvisor.com (different pages) | ~1 | Separate topics, **bundled into one roundup post** by business rationale (same-weekend, same-drive audience), not a SERP-driven merge |
| national polka festival ↔ texas motorplex / scarborough | none | 0 | Confirmed standalone post |

Full 16×16 score matrix (pillar + all 15 primary spoke keywords, diagonal = 10) is in `cluster-plan.json` → `serp_matrix`.

## 3. Intent classification

All 16 primary keywords classified **Informational** (broad, how-to, FAQ, or local) except the comparison spoke (**Commercial — compare**: "best bluebonnet trails in texas"). No Transactional or Navigational keywords made it into the cluster (rental/booking transactional keywords — "slingshot rental," etc. — live in a separate cluster plan; navigational brand searches were excluded per the skill's rules).

## 4. Architecture

**Pillar:** *Ennis Bluebonnet Trails & Festival 2027 Guide* — `/bluebonnets/` — `pillar-page` — 3,500 words — target volume 14,800 (Apr, TX)

5 clusters × 3 spokes = 15 spokes. Total: 16 posts, ~25,400 words, 70 internal links (link density 4.4/post).

### Cluster 1 — Trail Map & Getting There (`/bluebonnets/`)
| Post | Keyword (vol) | Template | Words |
|---|---|---|---|
| Interactive Ennis Bluebonnet Trail Map | ennis bluebonnet trail map (1,000) | data-research | 1,400 |
| Ennis Welcome Center: Hours, Parking & What to Expect | ennis welcome center (3,600) | faq-knowledge | 1,300 |
| Festival Parking & Directions Guide | ennis bluebonnet festival parking (30) | tutorial | 1,200 |

### Cluster 2 — Ennis Town Guide (`/bluebonnets/`)
| Post | Keyword (vol) | Template | Words |
|---|---|---|---|
| Things to Do in Ennis, TX | things to do in ennis tx (390) | listicle | 1,800 |
| Where to Stay: Hotels Near the Trail | hotels in ennis tx (1,900 US) | roundup | 1,400 |
| Where to Eat: Best Restaurants in Ennis | restaurants in ennis tx (2,900 US) | roundup | 1,500 |

### Cluster 3 — Bloom Timing & Season Tracker (`/bluebonnets/`)
| Post | Keyword (vol) | Template | Words |
|---|---|---|---|
| When Do Bluebonnets Bloom in Texas? | when do bluebonnets bloom (1,300) | faq-knowledge | 1,500 |
| Bluebonnet Bloom Tracker (live 2027 updates) | bluebonnet report texas (20) | data-research **[linkable asset]** | 1,200 |
| Festival Weekend Weather Guide | ennis bluebonnet festival weather (10) | data-research **[linkable asset]** | 1,200 |

### Cluster 4 — Bluebonnet Photography & Etiquette (`/bluebonnets/`)
| Post | Keyword (vol) | Template | Words |
|---|---|---|---|
| Best Spots for Bluebonnet Photos in Ennis | bluebonnet photos (4,400) | listicle | 1,600 |
| Bluebonnet Photoshoot Tips | bluebonnet photoshoot (720) | how-to-guide | 1,500 |
| Is It Illegal to Pick Bluebonnets in Texas? | is it illegal to pick a bluebonnet in texas (12,100 US) | faq-knowledge | 1,400 |

### Cluster 5 — Beyond Ennis: Comparisons & Nearby Events (`/blog/`)
| Post | Keyword (vol) | Template | Words |
|---|---|---|---|
| Ennis vs. Other Texas Bluebonnet Trails | best bluebonnet trails in texas (590) | comparison | 1,800 |
| What Else Is Happening Near Ennis in April | scarborough renaissance festival (27,100) | roundup | 1,600 |
| National Polka Festival: Ennis's Memorial Day Encore | ennis polka festival (480) | thought-leadership | 1,500 |

**URL convention:** evergreen reference/tool/logistics pages → site pages under `/bluebonnets/` (permanent, non-year-dated slugs so they compound authority year over year — only the pillar itself carries a year in its *title*, not its URL). Comparison and same-weekend-event roundups, which read as timely editorial rather than reference tools, → `/blog/` posts, consistent with the git-committed markdown blog migrated in this repo.

## 5. Template × intent justification

- **pillar-page** (hub): only template built for full-topic coverage + linking to every spoke.
- **data-research** (trail map, bloom tracker, festival weather): these are the three linkable assets the owner asked for — interactive tools, not articles — so `data-research` fits better than a static guide template. Two `data-research` posts share Cluster 3; justified because both are live-data utility pages, not duplicate topics.
- **faq-knowledge** (Welcome Center, bloom timing, bluebonnet-picking legality): all three are direct-answer, PAA-driven queries currently won by AI Overviews/FAQ-style content per `serp-intelligence.md` (e.g., the AI Overview on "bluebonnet season texas" already names Ennis via a third-party blog — a template match matters for citation odds).
- **listicle** (things to do, photo spots): SERP for both is listicle-dominated (Tripadvisor "Top 15," D Magazine features, stock-photo galleries) — matches proven winning format per `serp-intelligence.md` §4.
- **roundup** (hotels, restaurants, nearby-events): curated recommendation format, distinct from numbered "Top N" listicles.
- **how-to-guide / tutorial** (photoshoot tips, parking/directions): step-by-step intent.
- **comparison** (Ennis vs. other trails): matches Commercial-compare intent and the zero-overlap-but-must-capture-the-searcher finding for Burnet/Willow City Loop.
- **thought-leadership** (Polka Festival): a positioning/narrative piece (Ennis's "second festival," Czech heritage, off-season demand test) rather than a straight utility page.

## 6. Internal link matrix (70 links total)

- **Mandatory (30 links):** every spoke ↔ pillar, bidirectional, anchor text = target keyword.
- **Recommended (30 links):** full mesh within each 3-post cluster (each spoke links to and receives links from both siblings — 2 in, 2 out per spoke).
- **Optional/cross-cluster (10 links):** curated topical bridges only —
  - Trail Map ↔ Bloom Tracker
  - Welcome Center ↔ Things to Do in Ennis
  - Photo Spots → Trail Map
  - Bluebonnet Etiquette → When Do Bluebonnets Bloom
  - Ennis-vs-Other-Trails ↔ When Do Bluebonnets Bloom
  - Ennis-vs-Other-Trails → Trail Map
  - What's Happening Near Ennis → Things to Do in Ennis
  - National Polka Festival → Things to Do in Ennis

Full adjacency list with anchors: `cluster-plan.json` → `links`.

**Commercial overlay (not part of the SEO link matrix, but required on every page):** every `/bluebonnets/` and `/blog/` page in this cluster should carry a CTA link back to the Slingshot booking page — the entire cluster exists to convert bluebonnet-intent traffic into April bookings.

## 7. Pre-delivery validation

| Check | Result |
|---|---|
| No two posts share a primary keyword | Pass (0 duplicates) |
| Every spoke has ≥3 incoming internal links | Pass (0 orphans; min incoming = 3, from pillar + 2 cluster siblings) |
| Every spoke links to pillar / pillar links to every spoke | Pass (30/30 mandatory links present) |
| No orphan pages | Pass |
| Template matches intent | Pass (see §5) |
| Word counts in spec (pillar 2,500-4,000; spokes 1,200-1,800) | Pass (pillar 3,500; spokes 1,200-1,800) |
| Cluster size in spec (2-5 clusters, 2-4 posts each) | Pass (5 clusters × 3 posts) |
| SERP overlap supports groupings | Pass — see §2; two low-overlap groupings (Welcome Center/Trail Map, Scarborough/Motorplex bundle) are explicitly flagged as business-rationale decisions rather than SERP-threshold merges |

## 8. Top 5 opportunities (ranked)

1. **Bluebonnet-picking legality page** — 12,100 US searches (Mar), KD ~0, zero rental-business presence, and the query already produces AI Overviews citing thin sources (Yahoo, local TV). Fastest, highest-ceiling win in the entire cluster.
2. **Ennis Welcome Center page** — 3,600 TX searches in April for the exact location the Slingshot deploys from, with zero commercial content on page 1 today (mindtrip.ai, glasstire.com, ennistx.gov).
3. **Interactive trail map (linkable asset)** — 1,000 TX searches, but the real value is backlink/PR bait + the most natural on-page booking CTA ("drive this exact route in a Slingshot").
4. **Pillar hub itself** — 14,800 + 12,100 combined TX volume in April with zero rental/experience competitors anywhere on page 1; owning it before the 2027 festival dates are announced positions the site to absorb the "ennis bluebonnet festival 2027" search spike early.
5. **Bluebonnet photos spot-guide** — 4,400 TX searches (Mar) in a SERP currently 100% stock-photo sites with no first-party, location-specific content — an open lane with strong Instagram/UGC amplification potential.

---
*Machine-readable plan: `cluster-plan.json`. Interactive visualization: `cluster-map.html`.*

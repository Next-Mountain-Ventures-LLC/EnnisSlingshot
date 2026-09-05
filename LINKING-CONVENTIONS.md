# LINKING-CONVENTIONS.md — URL & internal-linking rules for ennisslingshot.com

_Applies to the rebuilt site and every blog post/brief. Hub-and-spoke rules follow the claude-blog `internal-linking.md` reference; page map in `seo/strategy/SITE-STRUCTURE.md`._

## URLs
- Canonical host: `https://ennisslingshot.com` (no www). All pages end with a trailing slash except files.
- Lowercase, hyphen-separated, no dates, no stop-word stuffing. Max 5 words in a slug where possible.
- Site pages live under their hub: `/slingshot-rental/…`, `/bluebonnets/…`, `/ennis/…`. Blog posts are flat: `/blog/[slug]/`. Categories: `/blog/category/[slug]/`.
- Year-specific pages keep a **stable slug** and put the year in the title/H1 (`/bluebonnets/festival/` → "Ennis Bluebonnet Trails Festival 2027"). Never create `/…-2027/` URLs; update the page each year so links and authority accumulate.
- Area pages use `near-[city]` (`/slingshot-rental/near-dallas/`) — we are *near*, not *in*.
- One canonical per page; paginated blog indexes self-canonical; category pages indexable with intro copy.

## Anchor text
- Distribution target per page's inbound links: ~40% descriptive/partial-match, ~25% branded or page-name, ~20% exact-match, ~15% natural/long phrase. Never repeat the same exact-match anchor to a page from more than 2 posts in a row.
- Banned anchors: "click here," "read more," "this post," bare URLs.
- Anchor to the booking hub from informational posts as a benefit phrase ("book a 2-hour Slingshot ride on the trails"), not "book now."

## Required links per page type
| Page type | Must link to | Min / max internal links |
|---|---|---|
| Hub (pillar) | Every one of its spokes; the other two hubs; `/book/` | 8–12 |
| Spoke (site page) | Its hub in the first 300 words; 2+ sibling spokes; one commercial page | 5–10 |
| Blog pillar post | Its category page; 6+ spokes; one hub; one package | 8–12 |
| Blog spoke (1,000–2,000 words) | Its pillar post; 1–2 related posts; one commercial page (package/hub); its hub if bluebonnet/Ennis | 3–7 (hard minimum 3) |
| Package page | `/slingshot-rental/` hub; `/requirements/`; `/pricing/`; `/book/`; one bluebonnet page | 5–8 |

## Bridges between clusters (use at least one per post)
- Bluebonnet content → `/slingshot-rental/bluebonnet-trail-experience/` ("see the trails from an open cockpit").
- Ennis/DFW tourism content → `/slingshot-rental/near-dallas/` or `/ennis/day-trip-from-dallas/`.
- Slingshot 101 content → `/slingshot-rental/drive-and-go/` ("try one for an hour in Ennis").
- Date/occasion content → `/slingshot-rental/date-night/` and `/gift-cards/`.

## Bidirectional rule
Every new post's brief lists "Link FROM" pages; those pages get updated the same week the post publishes (pace: ≤5 existing pages edited per week). No orphans: every published URL is linked from ≥1 page other than the blog index.

## External links
- 3–8 per post to tier 1–3 sources (state statutes, Polaris, ennistx.gov, bluebonnettrail.org, Texas Highways, wildflower.org, newspapers). `rel="nofollow"` only for sponsored/affiliate. Never link competitor rental sites.

## Navigation
- Header: Experiences · Bluebonnets · Ennis · Blog · FAQ · Book (CTA).
- Footer: NAP + hours, hubs, 6 most important spokes (Trail Map, Bloom Tracker, Festival, Date Night, Gift Cards, Texas Slingshot Laws), socials, sitemap.
- Breadcrumbs on every page (`BreadcrumbList` schema): Home › Hub › Page.

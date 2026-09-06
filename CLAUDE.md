# CLAUDE.md — Ennis Slingshot Experience (ennisslingshot.com)

> Tech/setup conventions: see [`AGENTS.md`](./AGENTS.md) (React 18 + React Router 6 SPA + Vite + Tailwind, Express `/api`, Netlify, pnpm).

## SEO & content docs (where everything lives)
| What | Path |
|---|---|
| Running strategy record + decision log + publishing pipeline | [`seo-onpage-strategy.md`](./seo-onpage-strategy.md) |
| Tracked keywords → target URLs | [`keywords.md`](./keywords.md) |
| URL + internal-linking rules | [`LINKING-CONVENTIONS.md`](./LINKING-CONVENTIONS.md) |
| SEO strategy, site structure, offerings memo, cluster plans, rebuild plan | `seo/strategy/` |
| Research (keyword DB, SERP, competitors, audience, backlinks, business facts) | `seo/research/` — **`business-context.md` is the fact source of truth** |
| Content calendar + briefs | `calendars/CONTENT-CALENDAR.md`, `calendars/YYYY-MM-briefs/DD-<slug>.md` (generator + topic inventories in `seo/content-calendar/`) |

## Blog publishing pipeline (do not bypass)
- Posts are authored and scheduled in WordPress — **NXTMT Blog, https://blog.nxtmt.ventures (blog_id 249186184)** — with exactly two categories: **`EnnisSlingshot.com` (ID 34, routing; hidden on site)** + one SEO category (`Ennis Bluebonnets`, `Ennis & DFW Things to Do`, `Dallas Date Ideas`, `Polaris Slingshot 101`, `Ennis Slingshot News`) plus tags. Schedule as `future` at 08:00 America/Chicago on the calendar date.
- The sync plugin commits markdown into `client/content/blog/<slug>.md` with the frontmatter `client/lib/blog.ts` expects (title, description, excerpt, slug, pubDate, updatedDate, draft, status, heroImage, tags, tagSlugs, categories [SEO category only], categorySlugs, author, authorEmail, authorUrl, authorId, postId, permalink, guid, commentCount, wordCount, readingTime). **Never hand-write files into `client/content/blog/`.**
- Every post starts from a brief; the writer updates the brief's Status line to `WRITTEN AND SCHEDULED — WordPress post <id>, <date> 08:00 America/Chicago`.
- Standing cannibalization rule: before writing, check existing posts (calendar + `client/content/blog/` + WordPress category 34) for the same primary keyword/intent; if covered, say so instead of writing a near-duplicate.

## Facts that must never drift
Prices $69.99 / $79 / $149 (+ proposed $169 Date Night); insurance included, no deposit; no motorcycle license (Tex. Transp. Code §521.085(b)); helmets follow §661.0015/§661.003; meeting point Ennis Welcome Center, 201 NW Main St; season April (trails Apr 1–30; 2027 festival dates unannounced); fleet 2 Slingshots → groups ≤ 4; vehicle Polaris Slingshot, ProStar 2.0L 4-cyl, 180/204 hp by trim. Full list: `seo/research/business-context.md`.

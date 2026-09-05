# Morning report — Sat Sep 5, 2026

## What got done overnight
1. **Content program — complete.** 239-day calendar (Sep 5 → May 1) with one full brief per day (239/239, ~321k words of briefs), each with keyword data, guardrails, structure, sourced facts, visuals, internal links, meta. 14 spare topics benched. `calendars/CONTENT-CALENDAR.md`.
2. **Writer — running.** Weeks 1–2 written and scheduled on blog.nxtmt.ventures (posts 907–929); post 907 auto-published this morning, proving the WordPress → plugin → repo pipeline. Week 3 (Sep 19–25) released to it. You took the writer over from here.
3. **Site rebuild — complete and green** on branch `seo-rebuild` (14 commits). Same design; new structure; every route static-prerendered with real HTML + JSON-LD; sitemap/robots/llms.txt/RSS; real 404; security headers; blog system; Consent Mode v2; the five interactive builds (trail map, bloom tracker, weather, events, drive times).
4. **QA passed:** typecheck, prerender gate (50 routes), JSON-LD on all 49 pages, 0 orphans, 0 broken links, 0 console errors; brief link paths validated against the built routes.

## What needs you (in priority order)
1. **Push + open the PR** (blocked for me by the permission classifier):
   `git push -u origin seo-rebuild` then `gh pr create --base main --head seo-rebuild --title "SEO rebuild" --body-file seo/strategy/PR-BODY.md`
2. **Phone + address** → `shared/business.ts` (NAP, contact page, LocalBusiness schema; GBP needs these too).
3. **Hero video file** — current file shows unrelated stock footage text; drop a clean MP4/WebM at `public/videos/` (poster already in place; see `client/lib/media.ts`).
4. **Review `Needs Attention` posts** on the engine before their dates: 907 (Sep 5 — orientation passage), 917 (Sep 12 — helmet add-on price), 926 (Sep 16 — hotel distances), 927 (Sep 17 — adventurous dates).
5. **Decisions still open:** late-March soft open; Date Night $169 / Two-Up $149 vs $159; Chamber ($250), Garden Club sponsorship, Polaris Adventures application; Acuity gift certificates (several Nov–Feb posts are conditional on this).
6. **When announced:** 2027 festival dates → `client/content/pages/bluebonnets/festival.md`, `client/content/data/events.json`, and the two reactive briefs (Jan 5, Jan 28).

## Things I changed that you should know about
- Swapped 8 core Slingshot-101 spokes (top speed 1,300/mo, how to drive, AutoDrive, safety, rain, vs Ryker, cost, what to wear) into Oct 5/14/19/24 and Nov 8/16/24/25 in place of eight no-volume posts (now in `calendars/bench/`).
- Footer "Texas Slingshot Laws" points to `/faq/` until the Sep 15 post syncs (avoids a 404 for 10 days).
- Replaced "Wild rides available April 2026" with a 2027 season line and dropped the unconfirmed "SLR" trim from hero/booking/specs copy.
- Trail-map loops are reconstructed from the official map and labeled approximate on the page; a "confirm at the Welcome Center" note is shown.

## Where everything lives
`CLAUDE.md` (index) · `seo-onpage-strategy.md` (decision + build log) · `keywords.md` · `LINKING-CONVENTIONS.md` · `seo/strategy/*` · `seo/research/*` · `calendars/*` · screenshots of the build in `.claude/shots/`

# Owner to-do — after the Oct 2026 launch-readiness pass

Branch `site-polish-launch-readiness`. Everything below needs the owner (a setting, a decision,
or a fact only you know). Nothing here blocks the code from merging except section 1.

## 1. Before you deploy (blocking)

- [ ] **Sender groups** — create two groups: `Ennis Slingshot — Festival & Trail Updates` (email)
      and `Ennis Slingshot — SMS $10 off` (texts). Note each group's id.
- [ ] **Sender API token** — Sender → Settings → API access tokens → create one.
- [ ] **Netlify env vars** (Site configuration → Environment variables), then redeploy:
      `SENDER_API_TOKEN`, `SENDER_GROUP_ID` (email group), `SENDER_SMS_GROUP_ID` (SMS group).
      Optional: `SIGNUP_SECRET` (any long random string; otherwise the API token signs step-1 tokens).
      Without these, every signup shows "Something went wrong" and the lead is lost.
- [ ] **$10 code** — create the coupon in Acuity (e.g. `TEXT10`, $10 off, one per customer).
- [ ] **Sender SMS automation** — trigger: subscriber joins the SMS group → text from (833) 338-1781
      with the $10 code + "Reply STOP to opt out". (Claude can build this once the code exists.)
- [ ] **Toll-free/SMS registration** — use the program wording on `/terms/#sms-terms`.
- [ ] **Acuity** — confirm Solo (91042979), Driver + Rider (91043037) and Drive & Go (92391639) are
      public and open for April 1–30, 2027. Drive & Go was never bookable on the site before.
- [ ] **Acuity** — confirm both Slingshots can be booked in the same time slot (the groups page relies on it).
- [ ] **Test booking** on an iPhone and an Android phone through `/book/` (payment step included).
- [ ] Confirm `info@ennisslingshot.com` receives mail — it's now the only contact route.

### After deploy
- [ ] `curl -sI https://ennisslingshot.com/about/ | grep -i x-frame` → SAMEORIGIN;
      `curl -sI https://ennisslingshot.com/embed/trail-map/ | grep -ci x-frame` → 0;
      `curl -sI https://ennisslingshot.com/bloom-status.json | grep -i access-control` → `*`.
- [ ] GA4: accept cookies, reload, check DevTools for "Refused to connect" errors.
- [ ] Check the Netlify build log for `[blog-images]` 403s (hero images fall back to WordPress URLs).

## 2. Decisions

- [ ] **Packages not launched** (removed from the site; the old copy is in git history before this branch):
      Golden Hour Date Night ($169), Group Convoy ($139/vehicle), Festival Weekend Ride, $39 photo add-on,
      Acuity gift certificates. Launch any in Acuity and the pages can sell them again.
- [ ] **Gift cards by email** — pages say "email info@ennisslingshot.com to order, good for the 2027 season,
      same price as booking". Confirm you'll fulfil and redeem these by hand.
- [ ] **Helmets** — free standard helmet + $25 Bluetooth upgrade, or $25 rental only? Pages and posts disagree
      (faq, terms, about, requirements, posts 917, 1013, 1069).
- [ ] **Weather policy** — the forecast widget says 60%+ rain or gusts past 30 mph may trigger a reschedule;
      pages say "rain or shine unless storms, high wind or hail". Pick one.
- [ ] **Cancellation / no-show policy** — /terms/ only covers rescheduling and "we cancel".
      Several posts promise "free rescheduling up to 7 days before your date" (1072, 1075, 1082, 1093).
- [ ] **$10 text offer terms** on `/terms/#10-text-offer` — one code per person/number, one 2027 booking,
      not cash, not combinable. Confirm.
- [ ] **Driver + Rider "Save $9 / ~~$158~~"** on the booking widget — keep or drop (the $158 is two Solo rides).
- [ ] **Drive & Go** — does the hour include check-in/briefing? Driver only (post 1122 sold it as a date for two)?
- [ ] **Booking status** — are April 2027 bookings open now? (The old "bookings open this winter" line was removed.)
- [ ] **Legal entity name** for /privacy/ and /terms/.
- [ ] **Public phone number** (optional) — add to `shared/business.ts` and it appears in the footer + schema.
- [ ] Post 1134 ("after the festival") is scheduled for Apr 13, 2027 — before the expected Apr 17–19 festival.
      Move it to Apr 20 or later.

## 3. Facts to confirm

- [ ] Trail loops: which loop Sugar Ridge Rd / Sugar Ridge Winery and Lakeview Dr / Meadow View are on
      (copy was made non-committal; the map data says North and West).
- [ ] 2027 festival = 75th annual? When official dates are announced, update `shared/season.ts`
      (`confirmed: true`) and the "expected … subject to change" wording on the Bluebonnet pages.
- [ ] Blues on Main: /ennis/ says second Saturday in June; /ennis/events/ says early September.
- [ ] Welcome Center hours shown on /contact/ (Mon–Fri 8–6, Sat 9–5, Sun 11–4).
- [ ] Your per-seat weight limit (posts 949, 958 use the ~275 lb industry norm).
- [ ] Fleet trims (heated/cooled seats? Slingshade roof?) — posts 957, 1105.
- [ ] Orientation length (~15 min) and the 10-tip checklist vs your real script — posts 943, 940.
- [ ] Passenger minimum age policy — post 953, /requirements/.
- [ ] Manual vs AutoDrive — post 969 says manual exists on several trims; post 963 says every 2026 trim is AutoDrive.
- [ ] Post 1006 title says deposits range $150–$1,500; the body says $75–$1,500.
- [ ] 2026 occasions (a birthday and an anniversary) — posts 955, 1044; first-person story — posts 1017, 1047.
- [ ] Odd event URLs in `client/content/data/events.json` (waxahachiecvb …`2222`) and post 970.

## 4. Time-sensitive content to refresh

- [ ] After Oct 18, 2026: posts 935, 908, 909 (State Fair / NHRA Fall Nationals 2026); post 939 "Updated Weekly"
      (refresh weekly or retitle).
- [ ] After December 2026: posts 970, 986 (2026 Christmas events).
- [ ] Before they publish: 1045 (2026 festival dates row), 1061 (Motorplex 2027 schedule), 1080 (festival gate fee),
      1100 (Scarborough "What's New"), 1114 (vendor lineup), 1136 (attendance).
- [ ] Home page "Download the Trail Map (PDF)" still points at the 2026 PDF — swap when the 2027 map is posted
      (`client/components/landing/Trails.tsx`).
- [ ] March–April: weekly bloom updates in `client/content/data/bloom-status.json` (each needs a deploy).

## 5. Content to add

- [ ] Google review link + real reviews → then remove `noindex` from `client/content/pages/reviews.md`.
- [ ] Author headshot + approved bio (`shared/author.ts`).
- [ ] A larger logo (512px+ or SVG) for sharper app icons.
- [ ] Photos for the Bluebonnet and Ennis pages (they have none), a featured image + alt text for post 195,
      and an orientation video for post 961.

## 6. WordPress housekeeping

- [ ] "Needs Attention" category still on posts 907, 917, 926, 927, 932, 939, 940, 943, 948, 949 and several
      scheduled posts — the visible notes were removed; clear the category as you verify each post.
- [ ] Media library: hero alt text ends with "Hero image for the Ennis Slingshot article …" (the site strips it).
- [ ] Sync plugin: stop writing `authorEmail` and the staging `authorUrl`; decode `&amp;` in category names;
      emit a modified date no earlier than the publish date.

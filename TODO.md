# TODO

## Cookie consent / Google Consent Mode v2

**Status:** DONE — 2026-09-05 (site rebuild T24). Kept below as the record of
what was built and the one open decision.
**Added:** 2026-08-17

### Implemented

- `index.html`: inline `gtag('consent','default', …)` block sits directly after
  `<meta charset>`/viewport and **above** the gtag.js `<script async>`. It reads
  the stored choice (localStorage `ennis-consent` = `granted` | `denied`) and
  defaults `ad_storage`, `ad_user_data`, `ad_personalization`,
  `analytics_storage` to that state (denied when nothing is stored, with
  `wait_for_update: 500`); `functionality_storage`/`security_storage` stay
  granted.
- Meta Pixel: `fbq('consent','revoke')` runs before `fbq('init')` unless the
  stored choice is `granted`; events queue until `fbq('consent','grant')`. The
  un-gateable `<noscript>` pixel `<img>` was removed.
- `client/components/shared/ConsentBanner.tsx` (mounted in `SiteLayout`):
  Accept / Reject → `gtag('consent','update', …)` **and**
  `fbq('consent','grant'|'revoke')`, persisted in localStorage, hidden once
  answered, keyboard-focusable, re-openable via `openConsentBanner()`.
- `client/lib/consent.ts`: `readConsent`, `applyConsent`, `trackPixel` —
  every `fbq('track', …)` call site (`Booking.tsx`, `PromotionalPopup.tsx`)
  goes through `trackPixel`, which is a no-op without consent.

### Still open

- **Scope decision (item 1 below):** the gate is currently global (every
  visitor sees the banner and tags default to denied until answered). To gate
  only EEA/UK traffic, add a `region: [...]` array to the `gtag('consent',
  'default', …)` call in `index.html` and only mount `ConsentBanner` for those
  regions (needs a geo signal — e.g. Netlify's `x-country` header via an edge
  function). The site-wide default is the safer choice until that exists.
- **Verify (item 5):** confirm with GA4 DebugView + Meta Pixel Helper on the
  deployed site that nothing fires before consent.
- Link the banner from `/privacy/` ("Cookie settings" → `openConsentBanner()`).

The GA4 tag (`G-MN5MEYR77J`) and the Meta Pixel (`1547801854018398`) are both
live in `index.html` and currently fire unconditionally on page load, with no
consent gate in front of either one.

Google flags this during tag setup: if the site has visitors in the EEA/UK,
Consent Mode v2 is required to keep ads personalization and measurement
working. There is no banner on the site today.

### What needs to happen

1. **Decide the scope.** Ennis Slingshot is a Texas tour operator, so EEA
   traffic is likely negligible — but Google Ads remarketing audiences and
   Meta ad delivery are the things that actually degrade without this, so it
   may be worth doing regardless. Confirm before building.
2. **Set consent defaults before the tags load.** A `gtag('consent', 'default', …)`
   call has to run *above* the gtag.js script tag in `index.html`, otherwise the
   tag fires before defaults are registered and the gate does nothing.
   Region-scope it if we only want to gate EEA traffic.
3. **Add a banner** and call `gtag('consent', 'update', …)` on accept/reject.
   Persist the choice (localStorage or a first-party cookie) so it is not
   re-prompted every visit.
4. **Gate the Meta Pixel too.** Consent Mode only governs Google tags — the
   Pixel needs its own gate (`fbq('consent', 'revoke')` / `'grant'`), and it is
   easy to miss because the two live side by side in the same `<head>`.
5. **Verify** with GA4 DebugView and the Meta Pixel Helper that no tracking
   requests fire before consent is granted.

### Notes / gotchas

- Ordering in `<head>` matters more than anything else here. The consent
  default block must precede the gtag.js `<script async>` tag.
- The existing gtag snippet sits after `<meta charset>` and viewport on
  purpose — keeps the charset declaration inside the first 1024 bytes. Keep it
  that way when inserting the consent block.
- A banner component belongs in `client/components/`, but the consent default
  call cannot live in React — the bundle loads far too late. It has to be
  inline in `index.html`.
- No consent/cookie library is installed yet. Either hand-roll it or pick one.

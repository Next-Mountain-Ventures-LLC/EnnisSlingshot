# Ennis Slingshot Experience — Business Context (source of truth for all content work)

_Compiled 2026-09-04 from the live site source (`client/components/landing/*.tsx`) and the owner's brief. Every brief and article must stay consistent with this file. Where a fact is marked **VERIFY**, do not state it as fact in published content until confirmed._

## What the business is
- **Name:** Ennis Slingshot Experience (site: https://ennisslingshot.com). Brand shorthand: "Ennis Slingshot".
- **What it is:** An *experience* rental — customers show up in Ennis, TX, get a short orientation and safety briefing, and self-drive a Polaris Slingshot through the Ennis Bluebonnet Trails. Positioned as the easy, quick, affordable way to experience a Slingshot without buying one or dealing with intimidating traditional rentals (pickup logistics, learning to drive it, deposits, insurance hassle, approval friction).
- **Thesis (owner's words, paraphrased):** Lots of people want to experience a Polaris Slingshot; they're expensive to buy, so the rental industry is huge — but many people are still underserved because renting feels intimidating. Ennis Slingshot exists to make it easy, quick and affordable.
- **Why Ennis:** Ennis is the official Bluebonnet Capital of Texas (Texas Legislature designation, 1997) and home of the Ennis Bluebonnet Trails (roughly 40 miles of mapped driving routes) and the Ennis Bluebonnet Festival. The owner is a motorcyclist who discovered the roads while riding. The roads + April wildflowers are the product.
- **Location:** Ennis, Ellis County, TX — ~35–45 min south of downtown Dallas on I-45. Customers can come from anywhere; the DFW metro is the natural catchment, and Texas-wide bluebonnet tourists are the second audience.
- **Season (current):** April 1–30 only, ending with the Ennis Bluebonnet Festival (third weekend of April, typically). Goal for 2027: book out every available day in April. Off-season expansion (summer demand peak, sunset rides, etc.) is an open business decision — content may *test* demand for it but must not promise availability outside April unless the owner confirms.
- **Proof so far:** Built the site, took real bookings in the 2026 season. Known customer occasions: at least one birthday, one anniversary.

## Offerings (as published on the site)
| Offer | Price | Details |
|---|---|---|
| Solo Experience | **$79** | 1 driver, 2 hours total (includes orientation + safety briefing + ride), all fuel, comprehensive insurance, 2026 Bluebonnet Trail Map in the glove box |
| Driver + Rider Experience | **$149** | 1 driver + 1 passenger, same inclusions; only the driver needs insurance approval |
| 1-Hour "Drive & Go" (from the disabled promo pop-up) | **$69.99** | Shorter on-demand quick drive. Copy used: "Fully automatic — drives like a car", "Insurance included — just give it a try", "No experience needed — anyone can do it", tagline "Easy. Fun. Unforgettable. See Texas like never before!" Owner wants this to become a standing offering. |
| Bluetooth communication helmet add-on | **$25/helmet** | Helmets not legally required in TX for autocycles but strongly recommended; Bluetooth lets driver and passenger talk |

Ideas the owner is open to if demand is proven: couples tour, sunset ride, group/corporate bookings, gift cards, other packages.

## Policies & trust facts (from FAQ.tsx — accurate, quotable)
- **License:** No special/motorcycle license required — a valid driver's license is enough. (Texas classifies the Slingshot as an *autocycle*; helmet not required by state law for autocycles — **VERIFY** exact statute citation before publishing legal explainers.)
- **Driver approval:** After booking, a verification link is emailed; the insurance approval process usually clears within 24 hours. If not approved, full refund.
- **Insurance:** Comprehensive coverage included with every rental; $500 max out-of-pocket for vehicle damage or theft.
- **Rescheduling:** Free rescheduling up to 7 days before the date, subject to availability.
- **Cancellation:** Weather or mechanical issues → no refund, but a full reschedule at no cost. Operates rain or shine unless conditions are unsafe.
- **Duration:** 2 hours total including orientation and safety briefing; arrive 15 minutes early.
- **Two-person setup:** One driver + one rider; passenger doesn't need approval.
- **Trail map:** Curated scenic routes through Ennis and surroundings with varying difficulty and wildflower viewing spots; comes in the glove box.
- **Booking:** Acuity Scheduling (owner ID 13113355). Solo appointment type 91042979; two-person 91043037; Drive & Go 92391639.

## Vehicle
- Site copy says "Polaris Slingshot SLR" with "1.5L Twin-Cylinder, 203 HP, 144 lb-ft, Automatic CVT, 0–60 ~5.2s, 2 seats". **VERIFY:** Polaris publishes the Slingshot with a ProStar 2.0L 4-cylinder (178 HP standard / 203 HP on higher trims) and an AutoDrive automated manual, not a CVT. Until the owner confirms the actual fleet spec, content should say "Polaris Slingshot" and "automatic — drives like a car, no clutch" and avoid quoting displacement/cylinder counts.
- Seating: 2 (side-by-side), open cockpit, 3 wheels (2 front, 1 rear), steering wheel + pedals.

## Voice & positioning
- Tone on site: energetic, direct, reassuring ("Buckle up", "Easy. Fun. Unforgettable."). Blog voice should be the same person who rides these roads: practical, first-hand, generous with specifics (routes, timing, what to wear), never hype-only.
- Brand color: "ennis-orange" on dark. Logo: orange Slingshot silhouette over bluebonnets.
- **Do not claim:** reviews/ratings that don't exist yet; availability outside April; exact 2027 festival dates until announced; vehicle specs marked VERIFY.

## Analytics/tracking in place
GA4 `G-MN5MEYR77J`, Meta Pixel `1547801854018398` (events: PageView, ViewContent, InitiateCheckout, Schedule). GSC property `sc-domain:ennisslingshot.com`.

## Current site (to be rebuilt to the new structure, same look)
Single landing page (hero video, "Your Ride" specs, Trails, Booking w/ Acuity embed, FAQ accordion, Contact/footer) + an empty `/blog` route. No blog posts exist yet.

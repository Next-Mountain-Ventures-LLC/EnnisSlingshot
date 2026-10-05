/**
 * Copy-paste embed code for the two third-party widgets (bloom tracker, trail
 * map) and the URLs the /embed/* pages link back to. Pure functions so the
 * snippets are identical in the prerendered HTML, after hydration and in the
 * tests (client/pages/embed/embed.spec.ts).
 *
 * The iframe snippets each carry a credit <p> OUTSIDE the iframe: links inside
 * an iframe don't count for the host page, the credit line is the backlink.
 */
import { absoluteUrl } from "@shared/business";
import { BLOOM_STATUSES, BLOOM_STATUS_JSON_PATH, bloomStatusLabel } from "./bloomData";

export const BLOOM_EMBED_PATH = "/embed/bloom-tracker/";
export const TRAIL_MAP_EMBED_PATH = "/embed/trail-map/";
export const BLOOM_TRACKER_PATH = "/bluebonnets/bloom-tracker/";
export const TRAIL_MAP_PATH = "/bluebonnets/trail-map/";
/** Official source of the Ennis Bluebonnet Trail routes (Ennis Garden Club). */
export const OFFICIAL_TRAILS_URL = "https://www.bluebonnettrail.org/";

/** Suggested iframe heights (px) — the widget layouts are built to fit these from 300px wide up. */
export const BLOOM_EMBED_HEIGHT = 260;
export const TRAIL_MAP_EMBED_HEIGHT = 560;

/**
 * Link from inside an embed back to the site, tagged so embed reach shows up
 * in GA (the embed pages themselves never load analytics).
 */
export function embedBacklink(path: string, medium: "bloom-widget" | "trail-map-widget"): string {
  const url = new URL(absoluteUrl(path));
  url.searchParams.set("utm_source", "embed");
  url.searchParams.set("utm_medium", medium);
  return url.toString();
}

export function bloomIframeSnippet(): string {
  return [
    `<iframe src="${absoluteUrl(BLOOM_EMBED_PATH)}" title="Ennis bluebonnet bloom status" width="100%" height="${BLOOM_EMBED_HEIGHT}" style="border:0;max-width:600px;border-radius:8px" loading="lazy"></iframe>`,
    `<p style="font-size:12px;margin:4px 0 0">Live <a href="${absoluteUrl(BLOOM_TRACKER_PATH)}">Ennis bluebonnet bloom tracker</a> by Ennis Slingshot Experience</p>`,
  ].join("\n");
}

/**
 * Script-based alternative for developers. Starts as a plain link (so it still
 * credits and links back if the script is stripped or the fetch fails) and
 * swaps in the live status with the same labels the site uses.
 */
export function bloomJsonSnippet(): string {
  const page = absoluteUrl(BLOOM_TRACKER_PATH);
  const labels = Object.fromEntries(BLOOM_STATUSES.map((s) => [s, bloomStatusLabel(s)]));
  return `<!-- Ennis bluebonnet bloom status (updates weekly in season) -->
<span id="ennis-bloom"><a href="${page}">Ennis bluebonnet bloom tracker</a></span>
<script>
fetch("${absoluteUrl(BLOOM_STATUS_JSON_PATH)}")
  .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
  .then(function (d) {
    var labels = ${JSON.stringify(labels)};
    var status = labels[d.status] || String(d.status).replace(/-/g, " ");
    var updated = new Date(d.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "America/Chicago" });
    var a = document.createElement("a");
    a.href = "${page}";
    a.textContent = "Ennis bluebonnets " + d.season + ": " + status;
    var el = document.getElementById("ennis-bloom");
    el.innerHTML = "";
    el.appendChild(a);
    el.appendChild(document.createTextNode((d.statusLabel ? " · " + d.statusLabel : "") + " · updated " + updated));
  })
  .catch(function () { /* keep the plain link */ });
</script>`;
}

export function trailMapIframeSnippet(): string {
  return [
    `<iframe src="${absoluteUrl(TRAIL_MAP_EMBED_PATH)}" title="Ennis Bluebonnet Trail map" width="100%" height="${TRAIL_MAP_EMBED_HEIGHT}" style="border:0;max-width:900px;border-radius:8px" loading="lazy"></iframe>`,
    `<p style="font-size:12px;margin:4px 0 0">Map: <a href="${absoluteUrl(TRAIL_MAP_PATH)}">Ennis Bluebonnet Trail Map</a> by Ennis Slingshot Experience · official trail routes: <a href="${OFFICIAL_TRAILS_URL}">bluebonnettrail.org</a></p>`,
  ].join("\n");
}

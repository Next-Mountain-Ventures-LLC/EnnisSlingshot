import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import { HelmetProvider } from "react-helmet-async";
import fs from "node:fs";
import path from "node:path";
import { buildRouteManifest, EMBED_PATHS, isEmbedPath } from "@shared/content/site-routes";
import {
  BLOOM_EMBED_PATH,
  TRAIL_MAP_EMBED_PATH,
  bloomIframeSnippet,
  bloomJsonSnippet,
  embedBacklink,
  trailMapIframeSnippet,
} from "@/components/islands/embedSnippets";
import { bloomStatus, loopStatus, type BloomStatusFile } from "@/components/islands/bloomData";
import { EVENTS, jsonLdEvents, eventsJsonLd, type EnnisEvent } from "@/components/islands/eventsData";
import { BloomTrackerEmbed } from "./BloomTrackerEmbed";
import { TrailMapEmbed } from "./TrailMapEmbed";

function render(el: JSX.Element): string {
  return renderToString(
    <HelmetProvider context={{}}>{el}</HelmetProvider>,
  );
}

describe("embed routes", () => {
  it("are in the prerender manifest, flagged noindex (so sitemap.xml skips them)", () => {
    const { routes } = buildRouteManifest({ pages: [], posts: [] });
    for (const p of EMBED_PATHS) {
      const r = routes.find((x) => x.path === p);
      expect(r).toMatchObject({ kind: "embed", noindex: true });
    }
    expect(EMBED_PATHS).toContain(BLOOM_EMBED_PATH);
    expect(EMBED_PATHS).toContain(TRAIL_MAP_EMBED_PATH);
    expect(isEmbedPath("/embed/trail-map/")).toBe(true);
    expect(isEmbedPath("/bluebonnets/trail-map/")).toBe(false);
  });

  it("render an <h1>, a utm-tagged backlink, and only new-tab links", () => {
    for (const html of [render(<BloomTrackerEmbed />), render(<TrailMapEmbed />)]) {
      expect(html).toMatch(/<h1[\s>]/);
      expect(html).toContain("by Ennis Slingshot Experience ↗");
      expect(html).toContain("utm_source=embed");
      const anchors = html.match(/<a\s[^>]*>/g) ?? [];
      expect(anchors.length).toBeGreaterThan(0);
      for (const a of anchors) expect(a).toContain('target="_blank"');
      // No site chrome in an embed.
      expect(html).not.toMatch(/Book Your Experience|id="mobile-nav"/);
    }
  });

  it("bloom card shows overall + per-loop status and the updated date", () => {
    const html = render(<BloomTrackerEmbed />);
    expect(html).toContain(String(bloomStatus.season));
    expect(html).toContain("North");
    expect(html).toContain("South");
    expect(html).toContain("West");
    expect(html).not.toContain("No report yet");
    expect(html).toContain("Updated");
  });
});

describe("embed snippets", () => {
  it("iframe snippets point at the /embed/ pages and carry a credit link outside the iframe", () => {
    const bloom = bloomIframeSnippet();
    expect(bloom).toContain('src="https://ennisslingshot.com/embed/bloom-tracker/"');
    expect(bloom).toMatch(/<\/iframe>\n<p[^>]*>.*href="https:\/\/ennisslingshot\.com\/bluebonnets\/bloom-tracker\/"/);
    expect(bloom).toContain('loading="lazy"');
    const map = trailMapIframeSnippet();
    expect(map).toContain('src="https://ennisslingshot.com/embed/trail-map/"');
    expect(map).toContain('href="https://ennisslingshot.com/bluebonnets/trail-map/"');
    expect(map).toContain('href="https://www.bluebonnettrail.org/"');
  });

  it("backlinks are tagged utm_source=embed", () => {
    expect(embedBacklink("/bluebonnets/bloom-tracker/", "bloom-widget")).toBe(
      "https://ennisslingshot.com/bluebonnets/bloom-tracker/?utm_source=embed&utm_medium=bloom-widget",
    );
  });

  async function runJsonSnippet(fetchImpl: () => Promise<unknown>) {
    const code = /<script>([\s\S]*?)<\/script>/.exec(bloomJsonSnippet())![1];
    const children: { textContent: string; href?: string }[] = [];
    const el = {
      set innerHTML(_v: string) {
        children.length = 0;
      },
      appendChild(c: { textContent: string }) {
        children.push(c);
      },
    };
    const document = {
      getElementById: (id: string) => (id === "ennis-bloom" ? el : null),
      createElement: () => ({ textContent: "", href: "" }),
      createTextNode: (t: string) => ({ textContent: t }),
    };
    new Function("fetch", "document", code)(fetchImpl, document);
    await new Promise((r) => setTimeout(r, 10));
    return children;
  }

  it("JSON snippet degrades to a plain link and swaps in human labels when the fetch works", async () => {
    const snippet = bloomJsonSnippet();
    expect(snippet).toMatch(/<span id="ennis-bloom"><a href="https:\/\/ennisslingshot\.com\/bluebonnets\/bloom-tracker\/">/);
    expect(snippet).toContain(".catch(");
    expect(snippet).not.toContain('.replace("-", " ")');

    const data: BloomStatusFile = { ...bloomStatus, status: "not-started", season: 2027 };
    const ok = await runJsonSnippet(() => Promise.resolve({ ok: true, json: () => Promise.resolve(data) }));
    expect(ok[0].textContent).toBe("Ennis bluebonnets 2027: Not started");
    expect(ok[0].href).toBe("https://ennisslingshot.com/bluebonnets/bloom-tracker/");
    expect(ok[1].textContent).toContain("updated ");

    const failed = await runJsonSnippet(() => Promise.reject(new Error("CORS")));
    expect(failed).toEqual([]); // link left in place, no unhandled rejection
    const http = await runJsonSnippet(() => Promise.resolve({ ok: false, status: 500, json: () => Promise.resolve({}) }));
    expect(http).toEqual([]);
  });
});

describe("bloom data", () => {
  it("reads loops without a report as Not started while the season hasn't started", () => {
    const off: BloomStatusFile = { ...bloomStatus, status: "not-started", loops: { north: null, south: null, west: null } };
    expect(loopStatus("north", off)).toBe("not-started");
    const on: BloomStatusFile = { ...bloomStatus, status: "early", loops: { north: "peak", south: null, west: null } };
    expect(loopStatus("north", on)).toBe("peak");
    expect(loopStatus("south", on)).toBeNull();
  });
});

describe("events", () => {
  const base: EnnisEvent = { id: "x", name: "X", startDate: "2027-04-17", location: "Downtown Ennis, TX", description: "d" };

  it("Event JSON-LD skips expected and past events", () => {
    const list: EnnisEvent[] = [
      { ...base, id: "confirmed" },
      { ...base, id: "expected", expected: true },
      { ...base, id: "past", startDate: "2026-09-05", endDate: "2026-09-06" },
    ];
    expect(jsonLdEvents(list, "2026-10-03").map((e) => e.id)).toEqual(["confirmed"]);
    expect(eventsJsonLd("/ennis/events/", list, "2026-10-03")).toHaveLength(1);
  });

  it("the 2027 festival is April 17–19, presented as expected", () => {
    const fest = EVENTS.find((e) => e.id === "ennis-bluebonnet-trails-festival-2027")!;
    expect(fest).toMatchObject({ startDate: "2027-04-17", endDate: "2027-04-19", expected: true });
    expect(fest.description).toMatch(/expected April 17–19, 2027 \(dates subject to change/);
  });

  it("public descriptions carry no research or editor notes", () => {
    const banned = /as of this research|automated verification|unconfirmed|not yet (officially )?(posted|published)|Note:|Dates TBD|\bTBD\b/i;
    for (const e of EVENTS) expect(e.description).not.toMatch(banned);
  });
});

describe("trail map data", () => {
  it("rendered notes and pin popups are visitor copy (provenance only in sourceNote)", () => {
    const file = path.resolve(__dirname, "../../content/data/trail-map.geojson");
    const geo = JSON.parse(fs.readFileSync(file, "utf8")) as {
      features: { properties: Record<string, unknown> }[];
    };
    const banned = /OSRM|travellatte|interpreted from the map graphic|Nominatim|guaranteed|road-proxy|Task-provided/i;
    for (const f of geo.features) {
      const { note, description, source } = f.properties as { note?: string; description?: string; source?: string };
      expect(source).toBeUndefined();
      if (note) expect(note).not.toMatch(banned);
      if (description) expect(description).not.toMatch(banned);
    }
  });
});

/**
 * /embed/trail-map/ — the interactive Ennis Bluebonnet Trail map for other
 * sites to iframe (snippet: TrailMapIsland → "Embed this map"). Fills the
 * frame: a one-line title bar with the backlink, the map, then a compact
 * legend. Prerenders the static fallback; Leaflet loads client-side.
 */
import { Seo } from "@/components/seo/Seo";
import { TrailMapIsland } from "@/components/islands/TrailMapIsland";
import { TRAIL_MAP_PATH, embedBacklink } from "@/components/islands/embedSnippets";

export function TrailMapEmbed() {
  return (
    <main className="flex h-screen min-h-[300px] flex-col gap-2 p-2 sm:p-3">
      <Seo
        title="Ennis Bluebonnet Trail Map — Ennis Slingshot Experience"
        description="Interactive map of the North, South and West Ennis Bluebonnet Trail loops plus the Slingshot Scenic Loop."
        canonicalPath={TRAIL_MAP_PATH}
        noindex
      />
      <header className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
        <h1 className="text-sm font-black leading-tight tracking-tight text-white sm:text-base">
          Ennis Bluebonnet Trail Map
        </h1>
        <a
          href={embedBacklink(TRAIL_MAP_PATH, "trail-map-widget")}
          target="_blank"
          rel="noopener"
          className="whitespace-nowrap text-xs text-gray-400 hover:text-ennis-orange"
        >
          by Ennis Slingshot Experience ↗
        </a>
      </header>
      <TrailMapIsland embed className="min-h-0 flex-1" />
    </main>
  );
}

export default TrailMapEmbed;

/**
 * TrailMapIsland (SITE-REBUILD-PLAN.md §5, T13).
 *
 * Server/prerender: <TrailMapFallback> — a crawlable list of the four loops
 * with distances, the "approximate" caveat and a placeholder box.
 * Client: <ClientOnly> swaps in the React.lazy Leaflet map
 * (TrailMapLeaflet.tsx → its own chunk with leaflet + CSS + GeoJSON).
 *
 * On the site page a collapsed "Embed this map" box (iframe code for
 * /embed/trail-map/) sits under the map. `embed` is used by that /embed/
 * page itself: the map fills the frame with a compact legend and no embed box.
 */
import { lazy, Suspense } from "react";
import { ClientOnly } from "vite-react-ssg";
import { cn } from "@/lib/utils";
import { EmbedCodeBox } from "./EmbedCodeBox";
import { OFFICIAL_TRAILS_URL, TRAIL_MAP_EMBED_HEIGHT, trailMapIframeSnippet } from "./embedSnippets";
import { APPROXIMATE_NOTE, START_POINT, TRAIL_LOOPS } from "./trailMapData";

const TrailMapLeaflet = lazy(() => import("./TrailMapLeaflet"));

export interface TrailMapIslandProps {
  /** Chrome-less layout for /embed/trail-map/ (fills its container; give it a height). */
  embed?: boolean;
  className?: string;
  /** Show the "Embed this map" code box under the map. Default: on the site page, off in the embed. */
  showEmbedCode?: boolean;
}

export function TrailMapIsland({ embed = false, className, showEmbedCode = !embed }: TrailMapIslandProps) {
  return (
    <section className={cn(embed && "flex flex-col", className)} aria-labelledby="trail-map-heading">
      <h2 id="trail-map-heading" className="sr-only">
        Interactive trail map
      </h2>
      <div className={embed ? "flex min-h-0 flex-1 flex-col" : undefined}>
        <ClientOnly fallback={<TrailMapFallback embed={embed} />}>
          {() => (
            <Suspense fallback={<TrailMapFallback embed={embed} loading />}>
              <TrailMapLeaflet embed={embed} />
            </Suspense>
          )}
        </ClientOnly>
      </div>
      {showEmbedCode && <TrailMapEmbedCode className="mt-6" />}
    </section>
  );
}

/** Collapsed iframe snippet for /embed/trail-map/ with the credit line. */
export function TrailMapEmbedCode({ className }: { className?: string }) {
  return (
    <EmbedCodeBox
      className={className}
      title="Embed this map"
      intro={
        <p>
          Covering the Ennis Bluebonnet Trails? You&apos;re welcome to embed this interactive map on your site or
          blog for free. Please keep the credit line under the map — it links back to this page and to{" "}
          <a
            href={OFFICIAL_TRAILS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-ennis-orange hover:text-ennis-orange-bright"
          >
            bluebonnettrail.org
          </a>
          , the official source of the trail routes.
        </p>
      }
      snippets={[
        {
          label: "Embed code",
          hint: `The map fills a ${TRAIL_MAP_EMBED_HEIGHT}px-tall frame and works in columns from 300px to 900px wide.`,
          code: trailMapIframeSnippet(),
        },
      ]}
    />
  );
}

/**
 * Static, crawlable rendering used for the prerendered HTML, while the
 * Leaflet chunk loads, and for any client without JS.
 */
export function TrailMapFallback({ embed = false, loading = false }: { embed?: boolean; loading?: boolean }) {
  const box = (
    <div
      className={cn(
        "relative isolate z-0 flex items-center justify-center border border-dashed border-gray-600 bg-gray-900/60 p-6 text-center",
        embed ? "min-h-[200px] flex-1 rounded-md" : "rounded-lg",
      )}
      style={embed ? undefined : { height: "min(520px, 60vh)", minHeight: 300 }}
      role="img"
      aria-label="Map of the Ennis Bluebonnet Trail loops"
    >
      <div>
        <p className="text-white font-semibold">
          {loading ? "Loading the interactive map…" : "Interactive Ennis Bluebonnet Trail map"}
        </p>
        <p className="text-gray-400 text-sm mt-2 max-w-md mx-auto">
          The North, South and West Bluebonnet Trail loops plus our Slingshot Scenic Loop, drawn on
          OpenStreetMap tiles with photo-spot, parking and Welcome Center pins.
        </p>
      </div>
    </div>
  );

  if (embed) {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-2">
        {box}
        <ul className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] leading-tight text-gray-300">
          {TRAIL_LOOPS.map((meta) => (
            <li key={meta.loop} className="flex items-center gap-1.5 whitespace-nowrap">
              <LoopSwatch color={meta.color} official={meta.official} small />
              <span className="font-semibold text-white">{meta.name.replace(" Bluebonnet Trail", "")}</span>{" "}
              {meta.distanceMiles} mi
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      {box}

      <aside className="bg-gray-900/60 border border-gray-700 rounded-lg p-4 text-sm text-gray-300 self-start">
        <p className="text-gray-400 uppercase tracking-widest text-xs mb-3">Loops</p>
        <ul className="space-y-3">
          {TRAIL_LOOPS.map((meta) => (
            <li key={meta.loop} className="flex items-start gap-3">
              <LoopSwatch color={meta.color} official={meta.official} />
              <span>
                <span className="block font-semibold text-white">{meta.name}</span>
                <span className="block text-gray-400">
                  {meta.distanceMiles} miles · {meta.official ? "official loop" : "our curated route"}
                </span>
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-gray-400 leading-relaxed">
          <span className="text-ennis-orange font-semibold">Approximate.</span> {APPROXIMATE_NOTE}
        </p>
        <p className="mt-3 text-xs text-gray-400">
          <span className="text-white font-semibold">Start: {START_POINT.name}</span>, {START_POINT.address}.
        </p>
      </aside>
    </div>
  );
}

function LoopSwatch({ color, official, small = false }: { color: string; official: boolean; small?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn("inline-block shrink-0 rounded-sm", small ? "h-2 w-4" : "mt-1 h-3 w-6")}
      style={{
        background: official ? color : "transparent",
        border: official ? undefined : `2px dashed ${color}`,
      }}
    />
  );
}

export default TrailMapIsland;

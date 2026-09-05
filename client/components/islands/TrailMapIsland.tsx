/**
 * TrailMapIsland (SITE-REBUILD-PLAN.md §5, T13).
 *
 * Server/prerender: <TrailMapFallback> — a crawlable list of the four loops
 * with distances, the "approximate" caveat and a placeholder box.
 * Client: <ClientOnly> swaps in the React.lazy Leaflet map
 * (TrailMapLeaflet.tsx → its own chunk with leaflet + CSS + GeoJSON).
 *
 * `embed` (from `?embed=1` on /bluebonnets/trail-map/) makes the map taller
 * and drops the sidebar layout; the page hides site chrome separately.
 */
import { lazy, Suspense } from "react";
import { ClientOnly } from "vite-react-ssg";
import { APPROXIMATE_NOTE, START_POINT, TRAIL_LOOPS } from "./trailMapData";

const TrailMapLeaflet = lazy(() => import("./TrailMapLeaflet"));

export interface TrailMapIslandProps {
  embed?: boolean;
  className?: string;
}

export function TrailMapIsland({ embed = false, className }: TrailMapIslandProps) {
  return (
    <section className={className} aria-labelledby="trail-map-heading">
      <h2 id="trail-map-heading" className="sr-only">
        Interactive trail map
      </h2>
      <ClientOnly fallback={<TrailMapFallback embed={embed} />}>
        {() => (
          <Suspense fallback={<TrailMapFallback embed={embed} loading />}>
            <TrailMapLeaflet embed={embed} />
          </Suspense>
        )}
      </ClientOnly>
    </section>
  );
}

/**
 * Static, crawlable rendering used for the prerendered HTML, while the
 * Leaflet chunk loads, and for any client without JS.
 */
export function TrailMapFallback({ embed = false, loading = false }: { embed?: boolean; loading?: boolean }) {
  return (
    <div className={embed ? "grid gap-4" : "grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]"}>
      <div
        className="flex items-center justify-center rounded-lg border border-dashed border-gray-600 bg-gray-900/60 text-center p-6"
        style={{ height: embed ? "70vh" : 520, minHeight: 360 }}
        role="img"
        aria-label="Map of the Ennis Bluebonnet Trail loops"
      >
        <div>
          <p className="text-white font-semibold">
            {loading ? "Loading the interactive map…" : "Interactive map loads here"}
          </p>
          <p className="text-gray-400 text-sm mt-2 max-w-md mx-auto">
            The North, South and West Bluebonnet Trail loops plus our Slingshot Scenic Loop, drawn on
            OpenStreetMap tiles with photo-spot, parking and Welcome Center pins.
          </p>
        </div>
      </div>

      <aside className="bg-gray-900/60 border border-gray-700 rounded-lg p-4 text-sm text-gray-300 self-start">
        <p className="text-gray-500 uppercase tracking-widest text-xs mb-3">Loops</p>
        <ul className="space-y-3">
          {TRAIL_LOOPS.map((meta) => (
            <li key={meta.loop} className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className="mt-1 inline-block h-3 w-6 rounded-sm shrink-0"
                style={{
                  background: meta.official ? meta.color : "transparent",
                  border: meta.official ? undefined : `2px dashed ${meta.color}`,
                }}
              />
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

export default TrailMapIsland;

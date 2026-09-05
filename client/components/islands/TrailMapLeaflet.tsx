/**
 * The Leaflet half of the trail map — loaded with React.lazy from
 * TrailMapIsland.tsx so leaflet/react-leaflet, the Leaflet CSS and the
 * ~300 KB GeoJSON live in their own chunk and never run during SSG.
 * Only ever rendered inside <ClientOnly>, so `window`/`document` are safe.
 */
import { useEffect, useMemo, useState } from "react";
import L from "leaflet";
import { CircleMarker, MapContainer, Marker, Polyline, Popup, TileLayer, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import trailMapRaw from "@/content/data/trail-map.geojson?raw";
import {
  APPROXIMATE_NOTE,
  START_POINT,
  TRAIL_LOOPS,
  googleMapsDirectionsUrl,
  isLoopFeature,
  isPointFeature,
  pointKindColor,
  pointKindLabel,
  type LoopFeature,
  type LoopId,
  type PointFeature,
  type Position,
  type TrailMapCollection,
} from "./trailMapData";

const collection = JSON.parse(trailMapRaw) as TrailMapCollection;
const loopFeatures = collection.features.filter(isLoopFeature);
const pointFeatures = collection.features.filter(isPointFeature);

if (import.meta.env.DEV) {
  for (const meta of TRAIL_LOOPS) {
    const f = loopFeatures.find((x) => x.properties.loop === meta.loop);
    if (!f) console.warn(`[trail-map] loop "${meta.loop}" missing from trail-map.geojson`);
    else if (
      f.properties.name !== meta.name ||
      f.properties.color !== meta.color ||
      f.properties.distanceMiles !== meta.distanceMiles
    ) {
      console.warn(`[trail-map] TRAIL_LOOPS metadata for "${meta.loop}" drifted from trail-map.geojson`, f.properties);
    }
  }
}

/** GeoJSON [lng, lat] → Leaflet [lat, lng]. */
const toLatLng = (p: Position): [number, number] => [p[1], p[0]];

const allBounds = L.latLngBounds(loopFeatures.flatMap((f) => f.geometry.coordinates.map(toLatLng)));

function FitBounds({ bounds }: { bounds: L.LatLngBounds }) {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(bounds, { padding: [24, 24] });
  }, [map, bounds]);
  return null;
}

const startIcon = L.divIcon({
  className: "trail-map-start-icon",
  html: '<span style="display:block;width:22px;height:22px;border-radius:50% 50% 50% 0;background:#e85c2e;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.5);transform:rotate(-45deg)"></span>',
  iconSize: [22, 22],
  iconAnchor: [11, 22],
  popupAnchor: [0, -20],
});

export interface TrailMapLeafletProps {
  embed?: boolean;
}

export default function TrailMapLeaflet({ embed = false }: TrailMapLeafletProps) {
  const [visible, setVisible] = useState<Record<LoopId, boolean>>({
    north: true,
    south: true,
    west: true,
    "slingshot-route": true,
  });
  const [openNote, setOpenNote] = useState<LoopId | null>(null);

  const byLoop = useMemo(() => {
    const m = new Map<LoopId, LoopFeature>();
    for (const f of loopFeatures) m.set(f.properties.loop, f);
    return m;
  }, []);

  const toggle = (loop: LoopId) => setVisible((v) => ({ ...v, [loop]: !v[loop] }));

  return (
    <div className={embed ? "grid gap-4" : "grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]"}>
      <div
        className="relative rounded-lg overflow-hidden border border-gray-700 bg-gray-900"
        style={{ height: embed ? "70vh" : 520, minHeight: 360 }}
      >
        <MapContainer
          bounds={allBounds}
          scrollWheelZoom={!embed}
          style={{ height: "100%", width: "100%", background: "#111" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitBounds bounds={allBounds} />

          {TRAIL_LOOPS.map((meta) => {
            const f = byLoop.get(meta.loop);
            if (!f || !visible[meta.loop]) return null;
            return (
              <Polyline
                key={meta.loop}
                positions={f.geometry.coordinates.map(toLatLng)}
                pathOptions={{
                  color: f.properties.color,
                  weight: meta.official ? 4 : 5,
                  opacity: 0.9,
                  dashArray: meta.official ? undefined : "10 8",
                }}
              >
                <Popup>
                  <strong>{f.properties.name}</strong>
                  <br />
                  {f.properties.distanceMiles} miles
                  {f.properties.approximate ? " · approximate route" : ""}
                </Popup>
              </Polyline>
            );
          })}

          {pointFeatures.map((p) => (
            <PointMarker key={p.properties.name} point={p} />
          ))}
        </MapContainer>
      </div>

      <aside className="bg-gray-900/60 border border-gray-700 rounded-lg p-4 text-sm text-gray-300 self-start">
        <p className="text-gray-500 uppercase tracking-widest text-xs mb-3">Loops</p>
        <ul className="space-y-3">
          {TRAIL_LOOPS.map((meta) => {
            const f = byLoop.get(meta.loop);
            const coords = f?.geometry.coordinates ?? [];
            return (
              <li key={meta.loop} className="border-b border-gray-800 pb-3 last:border-0 last:pb-0">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-1 accent-ennis-orange"
                    checked={visible[meta.loop]}
                    onChange={() => toggle(meta.loop)}
                    aria-label={`Show ${meta.name}`}
                  />
                  <span
                    aria-hidden="true"
                    className="mt-1 inline-block h-3 w-6 rounded-sm shrink-0"
                    style={{
                      background: meta.official ? meta.color : "transparent",
                      border: meta.official ? undefined : `2px dashed ${meta.color}`,
                    }}
                  />
                  <span className="flex-1">
                    <span className="block font-semibold text-white">{meta.name}</span>
                    <span className="block text-gray-400">
                      {meta.distanceMiles} mi · {meta.official ? "official loop" : "our curated route"}
                    </span>
                  </span>
                </label>
                <div className="mt-2 ml-9 flex flex-wrap gap-x-3 gap-y-1 text-xs">
                  {coords.length > 0 && (
                    <a
                      href={googleMapsDirectionsUrl(coords)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-ennis-orange hover:text-ennis-orange-bright"
                    >
                      Open in Google Maps ↗
                    </a>
                  )}
                  {f?.properties.note && (
                    <button
                      type="button"
                      onClick={() => setOpenNote((n) => (n === meta.loop ? null : meta.loop))}
                      className="text-gray-400 hover:text-white underline-offset-2 hover:underline"
                      aria-expanded={openNote === meta.loop}
                    >
                      {openNote === meta.loop ? "Hide source note" : "About this route"}
                    </button>
                  )}
                </div>
                {openNote === meta.loop && f?.properties.note && (
                  <p className="mt-2 ml-9 text-xs text-gray-400 leading-relaxed">{f.properties.note}</p>
                )}
              </li>
            );
          })}
        </ul>

        <p className="mt-4 text-xs text-gray-400 leading-relaxed">
          <span className="text-ennis-orange font-semibold">Approximate.</span> {APPROXIMATE_NOTE}
        </p>

        <p className="text-gray-500 uppercase tracking-widest text-xs mt-5 mb-2">Pins</p>
        <ul className="space-y-1 text-xs">
          <li className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-full" style={{ background: pointKindColor("welcome-center") }} />
            Start: {START_POINT.name} — {START_POINT.address}
          </li>
          {Array.from(new Set(pointFeatures.map((p) => p.properties.type)))
            .filter((k) => k !== "welcome-center")
            .map((kind) => (
              <li key={kind} className="flex items-center gap-2">
                <span className="inline-block h-3 w-3 rounded-full" style={{ background: pointKindColor(kind) }} />
                {pointKindLabel(kind)}
              </li>
            ))}
        </ul>
      </aside>
    </div>
  );
}

function PointMarker({ point }: { point: PointFeature }) {
  const { type, name, description } = point.properties;
  const pos = toLatLng(point.geometry.coordinates);
  if (type === "welcome-center") {
    return (
      <Marker position={pos} icon={startIcon} zIndexOffset={1000}>
        <Tooltip permanent direction="right" offset={[6, -12]} className="trail-map-start-tooltip">
          Start: {name}
        </Tooltip>
        <Popup>
          <strong>Start: {name}</strong>
          <br />
          {START_POINT.address}
          {description ? (
            <>
              <br />
              {description}
            </>
          ) : null}
        </Popup>
      </Marker>
    );
  }
  return (
    <CircleMarker
      center={pos}
      radius={7}
      pathOptions={{ color: "#0a0f0f", weight: 2, fillColor: pointKindColor(type), fillOpacity: 0.95 }}
    >
      <Popup>
        <strong>{name}</strong>
        <br />
        <em>{pointKindLabel(type)}</em>
        {description ? (
          <>
            <br />
            {description}
          </>
        ) : null}
      </Popup>
    </CircleMarker>
  );
}

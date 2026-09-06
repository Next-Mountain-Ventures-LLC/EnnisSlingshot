/**
 * Trail-map data contract + the small, static metadata the SSR fallback and
 * legend need without pulling the ~300 KB GeoJSON into the main bundle.
 *
 * The full geometry (client/content/data/trail-map.geojson) is only imported
 * inside the lazily-loaded Leaflet chunk (TrailMapLeaflet.tsx), which also
 * warns in dev if these constants drift from the file's properties.
 */

export const LOOP_IDS = ["north", "south", "west", "slingshot-route"] as const;
export type LoopId = (typeof LOOP_IDS)[number];

export interface LoopMeta {
  loop: LoopId;
  name: string;
  color: string;
  distanceMiles: number;
  /** True for the official Ennis Garden Club loops; false for our curated route. */
  official: boolean;
}

/** Mirrors the LineString `properties` in trail-map.geojson (checked in dev). */
export const TRAIL_LOOPS: readonly LoopMeta[] = [
  { loop: "north", name: "North Bluebonnet Trail", color: "#1B5E20", distanceMiles: 37.2, official: true },
  { loop: "south", name: "South Bluebonnet Trail", color: "#388E3C", distanceMiles: 44.1, official: true },
  { loop: "west", name: "West Bluebonnet Trail", color: "#2E7D32", distanceMiles: 17.1, official: true },
  { loop: "slingshot-route", name: "Slingshot Scenic Loop", color: "#F5751F", distanceMiles: 37.2, official: false },
];

export const APPROXIMATE_NOTE =
  "Routes are approximate — reconstructed from the official Ennis Garden Club map and connected with real roads. Confirm the current-year loops at the Ennis Welcome Center, 201 NW Main St.";

export const START_POINT = {
  name: "Ennis Welcome Center",
  address: "201 NW Main St, Ennis, TX 75119",
  lat: 32.3293,
  lng: -96.6255,
} as const;

/* ---------- GeoJSON types (subset we use) ---------- */

export type Position = [number, number] | [number, number, number];

export interface LoopFeature {
  type: "Feature";
  geometry: { type: "LineString"; coordinates: Position[] };
  properties: {
    loop: LoopId;
    name: string;
    color: string;
    distanceMiles: number;
    approximate?: boolean;
    note?: string;
  };
}

export type PointKind =
  | "welcome-center"
  | "photo-spot"
  | "restroom"
  | "parking"
  | "park"
  | "winery"
  | string;

export interface PointFeature {
  type: "Feature";
  geometry: { type: "Point"; coordinates: Position };
  properties: { type: PointKind; name: string; description?: string; source?: string };
}

export interface TrailMapCollection {
  type: "FeatureCollection";
  features: (LoopFeature | PointFeature)[];
}

export function isLoopFeature(f: LoopFeature | PointFeature): f is LoopFeature {
  return f.geometry.type === "LineString";
}

export function isPointFeature(f: LoopFeature | PointFeature): f is PointFeature {
  return f.geometry.type === "Point";
}

/** Human label for a point `type`. */
export function pointKindLabel(kind: PointKind): string {
  switch (kind) {
    case "welcome-center":
      return "Start / Welcome Center";
    case "photo-spot":
      return "Photo spot";
    case "restroom":
      return "Restroom";
    case "parking":
      return "Parking";
    case "park":
      return "Park";
    case "winery":
      return "Winery";
    default:
      return kind.replace(/-/g, " ");
  }
}

/** Marker fill per point kind (used by the Leaflet chunk + the legend). */
export function pointKindColor(kind: PointKind): string {
  switch (kind) {
    case "welcome-center":
      return "#e85c2e";
    case "photo-spot":
      return "#a8d5e8";
    case "restroom":
      return "#4a7ba7";
    case "parking":
      return "#9e9e9e";
    case "park":
      return "#66bb6a";
    case "winery":
      return "#ab47bc";
    default:
      return "#ffffff";
  }
}

/**
 * Google Maps directions deep link for a loop: origin = first coordinate,
 * destination = last, plus up to `maxWaypoints` evenly-spaced interior
 * waypoints (Google's URL API accepts at most 9). GeoJSON is [lng, lat].
 */
export function googleMapsDirectionsUrl(coords: Position[], maxWaypoints = 8): string {
  if (!coords.length) return "https://www.google.com/maps/dir/?api=1";
  const fmt = (p: Position) => `${p[1].toFixed(5)},${p[0].toFixed(5)}`;
  const origin = fmt(coords[0]);
  const destination = fmt(coords[coords.length - 1]);
  const interior = coords.slice(1, -1);
  const step = Math.max(1, Math.floor(interior.length / (maxWaypoints + 1)));
  const waypoints: string[] = [];
  for (let i = step; i < interior.length && waypoints.length < maxWaypoints; i += step) {
    waypoints.push(fmt(interior[i]));
  }
  const params = new URLSearchParams({
    api: "1",
    origin,
    destination,
    travelmode: "driving",
  });
  if (waypoints.length) params.set("waypoints", waypoints.join("|"));
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

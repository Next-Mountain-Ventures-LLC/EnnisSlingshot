/**
 * Drive times to the Ennis Welcome Center (201 NW Main St) from DFW and
 * Texas origin cities. Source of truth: client/content/data/drive-times.json
 * (typical drive-time estimates; the figures for cities the page copy names
 * match that copy). The file ships in the public bundle, so it holds only
 * visitor-facing fields — keep research provenance out of it. The `note` field
 * is the visitor-facing caveat the DriveTimes widget prints ("Drive times are
 * typical estimates").
 */
import driveTimesJson from "@/content/data/drive-times.json";

export interface DriveTime {
  originCity: string;
  state: string;
  miles: number;
  minutes: number;
  route: string;
}

interface DriveTimesFile {
  note: string;
  destinations: DriveTime[];
}

const file = driveTimesJson as DriveTimesFile;

/** Visitor-facing caveat from the data file ("Drive times are typical estimates"). */
export const DRIVE_TIMES_NOTE = file.note;

/** All origins, in the order they appear in the data file. */
export const DRIVE_TIMES: readonly DriveTime[] = file.destinations;

/** Origins sorted nearest → farthest. */
export const DRIVE_TIMES_BY_DISTANCE: readonly DriveTime[] = [...DRIVE_TIMES].sort(
  (a, b) => a.miles - b.miles,
);

export function slugifyCity(city: string): string {
  return city
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Look up by city name or slug ("Fort Worth" / "fort-worth"), case-insensitive. */
export function getDriveTime(originCityOrSlug: string): DriveTime | undefined {
  const key = slugifyCity(originCityOrSlug);
  return DRIVE_TIMES.find((d) => slugifyCity(d.originCity) === key);
}

/** "1 hr 10 min" / "40 min". */
export function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} hr`;
  return `${h} hr ${m} min`;
}

/** Whole-mile display ("35 miles"). */
export function formatMiles(miles: number): string {
  return `${Math.round(miles)} miles`;
}

/**
 * Sensible default origin for a page: "/slingshot-rental/near-fort-worth/" →
 * "Fort Worth"; anything else → Dallas (the primary market).
 */
export function defaultOriginForPath(path: string): DriveTime {
  const m = /\/near-([a-z0-9-]+)\/?$/.exec(path);
  return (m && getDriveTime(m[1])) || getDriveTime("dallas") || DRIVE_TIMES[0];
}

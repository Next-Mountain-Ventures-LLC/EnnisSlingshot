/**
 * Bloom-status data contract. Source: client/content/data/bloom-status.json —
 * a checked-in file edited weekly in season (imported at build time, so the
 * status is plain prerendered HTML). The same file is copied to
 * dist/spa/bloom-status.json by scripts/generate-seo-files.ts as a public
 * JSON endpoint for newsrooms / partner sites.
 */
import bloomJson from "@/content/data/bloom-status.json";

export const BLOOM_STATUSES = ["not-started", "early", "peak", "fading", "past"] as const;
export type BloomStatus = (typeof BLOOM_STATUSES)[number];

export type LoopKey = "north" | "south" | "west";

export interface BloomWeeklyEntry {
  /** ISO date (YYYY-MM-DD) of the report. */
  date: string;
  status: BloomStatus;
  note?: string;
  photoUrl?: string;
  photoAlt?: string;
  /** Optional per-loop statuses for that week. */
  loops?: Partial<Record<LoopKey, BloomStatus | null>>;
}

export interface BloomStatusFile {
  updatedAt: string;
  season: number;
  status: BloomStatus;
  /** Short human label shown next to the badge. */
  statusLabel?: string;
  weeklyEntries: BloomWeeklyEntry[];
  loops: Record<LoopKey, BloomStatus | null>;
  sources?: string[];
}

export const bloomStatus = bloomJson as BloomStatusFile;

/** Public URL of the JSON endpoint (copied to dist/spa at build). */
export const BLOOM_STATUS_JSON_PATH = "/bloom-status.json";

export const LOOP_LABELS: Record<LoopKey, string> = {
  north: "North Loop",
  south: "South Loop",
  west: "West Loop",
};

export function bloomStatusLabel(status: BloomStatus | null | undefined): string {
  switch (status) {
    case "not-started":
      return "Not started";
    case "early":
      return "Early bloom";
    case "peak":
      return "Peak bloom";
    case "fading":
      return "Fading";
    case "past":
      return "Season over";
    default:
      return "No report yet";
  }
}

/** Tailwind classes for the status pill (bg / text / ring). */
export function bloomStatusClasses(status: BloomStatus | null | undefined): string {
  switch (status) {
    case "early":
      return "bg-sky-500/15 text-sky-200 ring-sky-400/40";
    case "peak":
      return "bg-blue-500/20 text-blue-100 ring-blue-400/60";
    case "fading":
      return "bg-amber-500/15 text-amber-200 ring-amber-400/40";
    case "past":
      return "bg-gray-500/15 text-gray-300 ring-gray-500/40";
    case "not-started":
    default:
      return "bg-gray-700/40 text-gray-300 ring-gray-600/60";
  }
}

/** Solid dot color for the badge (hex, for inline style / SVG). */
export function bloomStatusColor(status: BloomStatus | null | undefined): string {
  switch (status) {
    case "early":
      return "#7dd3fc";
    case "peak":
      return "#3b82f6";
    case "fading":
      return "#f59e0b";
    case "past":
      return "#6b7280";
    case "not-started":
    default:
      return "#9ca3af";
  }
}

/** Weekly entries newest first. */
export function weeklyEntriesNewestFirst(entries: BloomWeeklyEntry[] = bloomStatus.weeklyEntries): BloomWeeklyEntry[] {
  return [...entries].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

/**
 * "Sep 5, 2026" — deterministic so SSR and client agree: date-only strings
 * are read as UTC calendar dates, full timestamps in America/Chicago.
 */
export function formatBloomDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: dateOnly ? "UTC" : "America/Chicago",
  });
}

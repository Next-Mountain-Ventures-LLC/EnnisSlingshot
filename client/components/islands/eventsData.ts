/**
 * Events data contract + helpers. Source: client/content/data/events.json
 * (imported at build time → the list prerenders and the Event JSON-LD is
 * emitted from the same array).
 */
import eventsJson from "@/content/data/events.json";
import { event as eventJsonLd, type JsonLd } from "@/lib/schema";

export interface EnnisEvent {
  id: string;
  name: string;
  /** YYYY-MM-DD */
  startDate: string;
  /** YYYY-MM-DD */
  endDate?: string;
  location: string;
  city?: string;
  description: string;
  url?: string;
  source?: string;
  category?: string;
  /** Dates are historical/estimated, not yet confirmed by the organizer. */
  tbd?: boolean;
}

export const EVENTS: readonly EnnisEvent[] = (eventsJson as EnnisEvent[])
  .filter((e) => typeof e.startDate === "string" && /^\d{4}-\d{2}-\d{2}/.test(e.startDate))
  .slice()
  .sort((a, b) => (a.startDate < b.startDate ? -1 : a.startDate > b.startDate ? 1 : a.name.localeCompare(b.name)));

export const EVENT_CATEGORY_LABELS: Record<string, string> = {
  bluebonnets: "Bluebonnets",
  festival: "Festivals",
  music: "Music",
  motorsports: "Motorsports",
  market: "Markets",
  holiday: "Holiday",
};

export function categoryLabel(cat: string | undefined): string {
  if (!cat) return "Other";
  return EVENT_CATEGORY_LABELS[cat] ?? cat.charAt(0).toUpperCase() + cat.slice(1);
}

/** Distinct categories in data order of first appearance. */
export function eventCategories(events: readonly EnnisEvent[] = EVENTS): string[] {
  const seen: string[] = [];
  for (const e of events) {
    const c = e.category ?? "other";
    if (!seen.includes(c)) seen.push(c);
  }
  return seen;
}

/** "2027-04" month key. */
export function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

/** "April 2027" — deterministic (UTC) so SSR and client agree. */
export function monthLabel(key: string): string {
  const d = new Date(`${key}-01T00:00:00Z`);
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
}

/** "Apr 16–18, 2027", "Oct 9 – Nov 1, 2026", "Dec 12, 2026". */
export function formatEventDates(e: EnnisEvent): string {
  const fmt = (iso: string, opts: Intl.DateTimeFormatOptions) =>
    new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { ...opts, timeZone: "UTC" });
  const start = e.startDate;
  const end = e.endDate && e.endDate !== e.startDate ? e.endDate : undefined;
  if (!end) return fmt(start, { month: "short", day: "numeric", year: "numeric" });
  const sameMonth = monthKey(start) === monthKey(end);
  const sameYear = start.slice(0, 4) === end.slice(0, 4);
  if (sameMonth) {
    return `${fmt(start, { month: "short", day: "numeric" })}–${fmt(end, { day: "numeric" })}, ${start.slice(0, 4)}`;
  }
  if (sameYear) {
    return `${fmt(start, { month: "short", day: "numeric" })} – ${fmt(end, { month: "short", day: "numeric", year: "numeric" })}`;
  }
  return `${fmt(start, { month: "short", day: "numeric", year: "numeric" })} – ${fmt(end, { month: "short", day: "numeric", year: "numeric" })}`;
}

/** Today's date as YYYY-MM-DD in America/Chicago. */
export function todayChicago(now: Date = new Date()): string {
  return now.toLocaleDateString("en-CA", { timeZone: "America/Chicago" });
}

/** An event is past once its end (or start) date is before `today`. */
export function isPastEvent(e: EnnisEvent, today: string): boolean {
  return (e.endDate ?? e.startDate) < today;
}

/** Group (already sorted) events by month key, preserving order. */
export function groupByMonth(events: readonly EnnisEvent[]): { key: string; label: string; events: EnnisEvent[] }[] {
  const groups: { key: string; label: string; events: EnnisEvent[] }[] = [];
  for (const e of events) {
    const key = monthKey(e.startDate);
    let g = groups[groups.length - 1];
    if (!g || g.key !== key) {
      g = { key, label: monthLabel(key), events: [] };
      groups.push(g);
    }
    g.events.push(e);
  }
  return groups;
}

/** Split "Texas Motorplex, Ennis, TX" → { name: "Texas Motorplex", locality: "Ennis" }. */
function parseLocation(e: EnnisEvent): { name: string; locality?: string; streetAddress?: string } {
  const parts = e.location.split(",").map((s) => s.trim());
  const name = parts[0] || e.location;
  const streetAddress = /^\d+\s/.test(name) ? name : undefined;
  return { name: streetAddress ? e.location : name, locality: e.city, streetAddress };
}

/** schema.org Event for every event that has a startDate (all of them, by construction). */
export function eventsJsonLd(pagePath: string, events: readonly EnnisEvent[] = EVENTS): JsonLd[] {
  return events.map((e) => {
    const loc = parseLocation(e);
    return eventJsonLd({
      name: e.name,
      description: e.tbd ? `${e.description} (Dates shown are expected and not yet confirmed by the organizer.)` : e.description,
      startDate: e.startDate,
      endDate: e.endDate,
      location: {
        name: loc.name,
        streetAddress: loc.streetAddress,
        addressLocality: loc.locality ?? "Ennis",
        addressRegion: "TX",
      },
      url: e.url ?? pagePath,
    });
  });
}

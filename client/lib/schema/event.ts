import { absoluteUrl, compact, isoDate, withContext, type JsonLd } from "./common";

export interface EventInput {
  name: string;
  description?: string;
  /** Required by Google — do not emit an Event without a real start date. */
  startDate: Date | string;
  endDate?: Date | string;
  location: {
    name: string;
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
  };
  /** Page describing the event (site path or absolute URL). */
  url?: string;
  image?: string;
  organizer?: { name: string; url?: string };
  isFree?: boolean;
  eventStatus?: "EventScheduled" | "EventCancelled" | "EventPostponed" | "EventRescheduled";
}

/**
 * Event dates: keep all-day "YYYY-MM-DD" strings verbatim (schema.org allows
 * a bare Date, and it avoids shifting a Chicago date via a UTC midnight
 * timestamp); anything else goes through isoDate().
 */
function eventDate(d?: Date | string): string | undefined {
  if (typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  return isoDate(d);
}

export function event(input: EventInput): JsonLd {
  return withContext(
    compact({
      "@type": "Event",
      name: input.name,
      description: input.description,
      startDate: eventDate(input.startDate),
      endDate: eventDate(input.endDate),
      eventStatus: `https://schema.org/${input.eventStatus ?? "EventScheduled"}`,
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      location: compact({
        "@type": "Place",
        name: input.location.name,
        address: compact({
          "@type": "PostalAddress",
          streetAddress: input.location.streetAddress,
          addressLocality: input.location.addressLocality ?? "Ennis",
          addressRegion: input.location.addressRegion ?? "TX",
          postalCode: input.location.postalCode,
          addressCountry: "US",
        }),
      }),
      url: input.url ? absoluteUrl(input.url) : undefined,
      image: input.image,
      isAccessibleForFree: input.isFree,
      organizer: input.organizer
        ? compact({ "@type": "Organization", name: input.organizer.name, url: input.organizer.url })
        : undefined,
    }),
  );
}

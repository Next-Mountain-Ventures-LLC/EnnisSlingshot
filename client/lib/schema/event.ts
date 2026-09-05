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

export function event(input: EventInput): JsonLd {
  return withContext(
    compact({
      "@type": "Event",
      name: input.name,
      description: input.description,
      startDate: isoDate(input.startDate),
      endDate: isoDate(input.endDate),
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

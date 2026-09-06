/**
 * Shared helpers for the JSON-LD builders. Every builder returns a plain
 * object (with "@context") that <Seo jsonLd={[...]}> serialises into its own
 * <script type="application/ld+json"> tag.
 */
import { business, absoluteUrl, isTodo } from "@shared/business";

export type JsonLd = Record<string, unknown> & { "@context"?: string; "@type": string | string[] };

export const SCHEMA_CONTEXT = "https://schema.org";

/** Stable @id anchors so pages can reference the same entities. */
export const IDS = {
  business: `${business.url}/#business`,
  organization: `${business.url}/#organization`,
  website: `${business.url}/#website`,
  logo: `${business.url}/#logo`,
} as const;

export function withContext<T extends Record<string, unknown>>(obj: T): T & { "@context": string } {
  return { "@context": SCHEMA_CONTEXT, ...obj };
}

/** Drop undefined / null / empty-string / empty-array values (recursively, shallow objects). */
export function compact<T extends Record<string, unknown>>(obj: T): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null || v === "") continue;
    if (Array.isArray(v) && v.length === 0) continue;
    out[k] = v;
  }
  return out as T;
}

export function isoDate(d?: Date | string): string | undefined {
  if (!d) return undefined;
  const date = typeof d === "string" ? new Date(d) : d;
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

export function isoDay(d?: Date | string): string | undefined {
  const s = isoDate(d);
  return s ? s.slice(0, 10) : undefined;
}

/** PostalAddress for the registered business (street hidden while TODO). */
export function businessAddress() {
  return compact({
    "@type": "PostalAddress",
    streetAddress: isTodo(business.address.streetAddress)
      ? undefined
      : business.address.streetAddress,
    addressLocality: business.address.addressLocality,
    addressRegion: business.address.addressRegion,
    postalCode: business.address.postalCode,
    addressCountry: business.address.addressCountry,
  });
}

/** The Ennis Welcome Center meeting point as a schema.org Place. */
export function meetingPointPlace() {
  const mp = business.meetingPoint;
  return {
    "@type": "Place",
    name: mp.name,
    address: {
      "@type": "PostalAddress",
      streetAddress: mp.streetAddress,
      addressLocality: mp.addressLocality,
      addressRegion: mp.addressRegion,
      postalCode: mp.postalCode,
      addressCountry: mp.addressCountry,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: business.geo.latitude,
      longitude: business.geo.longitude,
    },
  };
}

/** Compact reference to the business entity for `provider` / `publisher`. */
export function businessRef() {
  return { "@id": IDS.business };
}

export function organizationRef() {
  return { "@id": IDS.organization };
}

export { absoluteUrl, isTodo };

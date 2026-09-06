/**
 * Single source of truth for NAP (name / address / phone) and business facts.
 *
 * Used by: the Contact footer NAP block, `/contact/`, LocalBusiness /
 * Organization JSON-LD builders (client/lib/schema), sitemap/robots/llms.txt
 * generation (scripts/generate-seo-files.ts).
 *
 * Values that the owner has not supplied yet are marked with the `TODO-`
 * prefix. UI and schema code must call `isTodo()` and HIDE those values —
 * never print a placeholder to a visitor or into JSON-LD. Never fabricate a
 * phone number or street address.
 */

export const SITE_URL = "https://ennisslingshot.com";

/** True when a value is still an owner-supplied-later placeholder. */
export function isTodo(value: string | undefined | null): boolean {
  return !value || value.startsWith("TODO");
}

/** Absolutize a site path (e.g. "/blog/") against the canonical host. */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export interface PostalAddress {
  streetAddress: string;
  addressLocality: string;
  addressRegion: string;
  postalCode: string;
  addressCountry: string;
}

export const business = {
  name: "Ennis Slingshot Experience",
  shortName: "Ennis Slingshot",
  url: SITE_URL,
  description:
    "Self-drive Polaris Slingshot experiences through the Ennis Bluebonnet Trails — 35 miles south of Dallas in the Bluebonnet Capital of Texas. Insurance included, no motorcycle license needed.",
  logo:
    "https://cdn.builder.io/api/v1/image/assets%2F5193f7a05d654f0c98a0a70f48ef2387%2F700b36c4a653482c8265f6619a61ea23?format=webp&width=512",
  image:
    "https://cdn.builder.io/api/v1/image/assets%2F5193f7a05d654f0c98a0a70f48ef2387%2Fd0be1f7aba0e42088bdc56539f2ad7ba?format=webp&width=1024&height=1024",

  /** TODO: owner to supply. Hidden in UI/schema while it starts with "TODO". */
  phone: "TODO-PHONE",
  /** TODO: owner to supply. Hidden in UI/schema while it starts with "TODO". */
  email: "TODO-EMAIL",

  /**
   * Registered business address. Street is a TODO placeholder until the owner
   * confirms; city/state/zip are public facts (Ennis, Ellis County, TX).
   */
  address: {
    streetAddress: "TODO-STREET-ADDRESS",
    addressLocality: "Ennis",
    addressRegion: "TX",
    postalCode: "75119",
    addressCountry: "US",
  } satisfies PostalAddress,

  /** Where every experience starts. Public, verified (city Welcome Center). */
  meetingPoint: {
    name: "Ennis Welcome Center",
    streetAddress: "201 NW Main St",
    addressLocality: "Ennis",
    addressRegion: "TX",
    postalCode: "75119",
    addressCountry: "US",
    /** One-line form for copy: "Ennis Welcome Center, 201 NW Main St, Ennis, TX 75119" */
    formatted: "Ennis Welcome Center, 201 NW Main St, Ennis, TX 75119",
  },

  /**
   * Operating season. The business runs in April only (trails Apr 1–30).
   * Daily opening/closing times are TODO until the owner confirms them;
   * openingHoursSpecification is only emitted once both are real values.
   */
  hours: {
    season: "April",
    note: "April season — open daily while the Ennis Bluebonnet Trails are open (April 1–30).",
    days: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    opens: "TODO-OPENS",
    closes: "TODO-CLOSES",
    validFrom: "2027-04-01",
    validThrough: "2027-04-30",
  },

  geo: { latitude: 32.3293, longitude: -96.6255 },

  sameAs: ["https://www.facebook.com/EnnisSlingshot"],

  /** Facebook page used by the footer "Share on Facebook" button. */
  facebookUrl: "https://www.facebook.com/EnnisSlingshot",

  priceRange: "$",

  areaServed: [
    "Ennis, TX",
    "Dallas, TX",
    "Fort Worth, TX",
    "Arlington, TX",
    "Waxahachie, TX",
    "Ellis County, TX",
    "Dallas–Fort Worth Metroplex",
  ],

  /** Acuity Scheduling owner id + appointment types (from Booking.tsx / PromotionalPopup.tsx). */
  booking: {
    acuityOwner: "13113355",
    soloAppointmentType: "91042979",
    twoUpAppointmentType: "91043037",
    driveAndGoAppointmentType: "92391639",
    acuityUrl: "https://ennissling.as.me/",
  },
} as const;

export type Business = typeof business;

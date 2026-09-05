import { business, isTodo } from "@shared/business";
import {
  IDS,
  businessAddress,
  compact,
  meetingPointPlace,
  withContext,
  type JsonLd,
} from "./common";

/**
 * LocalBusiness with additionalType TouristAttraction + AutoRental.
 * Reads everything from shared/business.ts; TODO placeholders are omitted.
 */
export function localBusiness(overrides: Record<string, unknown> = {}): JsonLd {
  const hoursKnown = !isTodo(business.hours.opens) && !isTodo(business.hours.closes);
  return withContext(
    compact({
      "@type": "LocalBusiness",
      "@id": IDS.business,
      additionalType: [
        "https://schema.org/TouristAttraction",
        "https://schema.org/AutoRental",
      ],
      name: business.name,
      alternateName: business.shortName,
      description: business.description,
      url: business.url,
      logo: business.logo,
      image: [business.image],
      telephone: isTodo(business.phone) ? undefined : business.phone,
      email: isTodo(business.email) ? undefined : business.email,
      priceRange: business.priceRange,
      address: businessAddress(),
      geo: {
        "@type": "GeoCoordinates",
        latitude: business.geo.latitude,
        longitude: business.geo.longitude,
      },
      location: meetingPointPlace(),
      areaServed: business.areaServed.map((name) => ({ "@type": "Place", name })),
      sameAs: [...business.sameAs],
      openingHoursSpecification: hoursKnown
        ? [
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: [...business.hours.days],
              opens: business.hours.opens,
              closes: business.hours.closes,
              validFrom: business.hours.validFrom,
              validThrough: business.hours.validThrough,
            },
          ]
        : undefined,
      parentOrganization: { "@id": IDS.organization },
      ...overrides,
    }),
  );
}

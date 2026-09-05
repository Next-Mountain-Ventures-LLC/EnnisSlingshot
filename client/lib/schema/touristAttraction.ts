import { business } from "@shared/business";
import { absoluteUrl, compact, withContext, type JsonLd } from "./common";

export interface TouristAttractionInput {
  name: string;
  description: string;
  /** Page describing the attraction. */
  path: string;
  image?: string;
  /** Defaults to Ennis, TX. */
  address?: { streetAddress?: string; addressLocality?: string; addressRegion?: string; postalCode?: string };
  geo?: { latitude: number; longitude: number };
  touristType?: string[];
  isFree?: boolean;
  /** Use "TouristDestination" for the /ennis/ hub. */
  type?: "TouristAttraction" | "TouristDestination";
}

export function touristAttraction(input: TouristAttractionInput): JsonLd {
  const geo = input.geo ?? business.geo;
  return withContext(
    compact({
      "@type": input.type ?? "TouristAttraction",
      name: input.name,
      description: input.description,
      url: absoluteUrl(input.path),
      image: input.image,
      address: compact({
        "@type": "PostalAddress",
        streetAddress: input.address?.streetAddress,
        addressLocality: input.address?.addressLocality ?? "Ennis",
        addressRegion: input.address?.addressRegion ?? "TX",
        postalCode: input.address?.postalCode,
        addressCountry: "US",
      }),
      geo: { "@type": "GeoCoordinates", latitude: geo.latitude, longitude: geo.longitude },
      touristType: input.touristType,
      isAccessibleForFree: input.isFree,
    }),
  );
}

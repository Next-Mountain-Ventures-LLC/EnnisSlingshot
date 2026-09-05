import { business, isTodo } from "@shared/business";
import { IDS, businessAddress, compact, withContext, type JsonLd } from "./common";

export function organization(overrides: Record<string, unknown> = {}): JsonLd {
  return withContext(
    compact({
      "@type": "Organization",
      "@id": IDS.organization,
      name: business.name,
      alternateName: business.shortName,
      url: business.url,
      logo: {
        "@type": "ImageObject",
        "@id": IDS.logo,
        url: business.logo,
      },
      image: business.image,
      description: business.description,
      email: isTodo(business.email) ? undefined : business.email,
      telephone: isTodo(business.phone) ? undefined : business.phone,
      address: businessAddress(),
      sameAs: [...business.sameAs],
      ...overrides,
    }),
  );
}

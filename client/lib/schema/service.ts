import { business } from "@shared/business";
import { numericPrice, type PackagePrice } from "@shared/content/page-schema";
import {
  IDS,
  absoluteUrl,
  compact,
  isoDay,
  meetingPointPlace,
  withContext,
  type JsonLd,
} from "./common";

export interface OfferInput {
  name: string;
  price: number | string;
  priceValidUntil?: Date | string;
  description?: string;
  url?: string;
}

/** A single schema.org Offer (no @context — nested inside OfferCatalog / Service). */
export function offer(input: OfferInput) {
  const amount = numericPrice(input.price);
  return compact({
    "@type": "Offer",
    name: input.name,
    description: input.description,
    price: amount !== undefined ? amount.toFixed(2) : undefined,
    priceCurrency: "USD",
    priceValidUntil: isoDay(input.priceValidUntil),
    availability: "https://schema.org/InStock",
    url: input.url ? absoluteUrl(input.url) : undefined,
    seller: { "@id": IDS.business },
    itemOffered: {
      "@type": "Service",
      name: input.name,
      provider: { "@id": IDS.business },
    },
  });
}

/** OfferCatalog listing the packages (used on "/", hub and package pages). */
export function offerCatalog(items: OfferInput[] | PackagePrice[], name = "Slingshot Experience Packages") {
  return compact({
    "@type": "OfferCatalog",
    name,
    itemListElement: (items as OfferInput[]).map((item) => offer(item)),
  });
}

export interface ServiceInput {
  name: string;
  description: string;
  /** Site path of the page describing the service. */
  path: string;
  serviceType?: string;
  packages?: OfferInput[] | PackagePrice[];
  image?: string;
}

/** Service + hasOfferCatalog, provided by the LocalBusiness. */
export function service(input: ServiceInput): JsonLd {
  return withContext(
    compact({
      "@type": "Service",
      "@id": `${absoluteUrl(input.path)}#service`,
      name: input.name,
      description: input.description,
      serviceType: input.serviceType ?? "Polaris Slingshot self-drive experience",
      url: absoluteUrl(input.path),
      image: input.image,
      provider: { "@id": IDS.business },
      areaServed: business.areaServed.map((n) => ({ "@type": "Place", name: n })),
      availableChannel: {
        "@type": "ServiceChannel",
        serviceUrl: absoluteUrl("/book/"),
        serviceLocation: meetingPointPlace(),
      },
      hasOfferCatalog:
        input.packages && input.packages.length
          ? offerCatalog(input.packages)
          : undefined,
    }),
  );
}

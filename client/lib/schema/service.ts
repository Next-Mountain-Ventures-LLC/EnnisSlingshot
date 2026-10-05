import { business } from "@shared/business";
import { PACKAGES, bookHref, packageFromQuery, type BookablePackage, type PackageId } from "@shared/booking";
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

function normalizeName(s: string): string {
  return s
    .toLowerCase()
    .replace(/[\u2010-\u2015\u2212-]/g, " ")
    .replace(/\band\b/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

/** Loose name fragments that identify each bookable package in page copy / frontmatter. */
const NAME_HINTS: Record<PackageId, string[]> = {
  solo: ["solo"],
  "two-up": ["driver + rider", "driver & rider", "two up", "two person", "for two"],
  "drive-and-go": ["drive & go"],
};

/**
 * The bookable package (shared/booking.ts) a price row / offer describes, or
 * null. A row only counts when BOTH its price and its name (or its
 * /book/?package= deep link) match a real package — so proposed products
 * ("Golden Hour Date Night", "Group Convoy", "Pricing TBD") never match.
 */
export function matchBookablePackage(input: {
  name?: string;
  price?: number | string;
  url?: string;
}): BookablePackage | null {
  if (!input.name || input.price === undefined || input.price === null) return null;
  const amount = numericPrice(input.price);
  if (amount === undefined) return null;
  const samePrice = PACKAGES.filter((p) => Math.abs(p.price - amount) < 0.005);
  if (!samePrice.length) return null;

  const linked = input.url?.match(/[?&]package=([^&#]+)/)?.[1];
  const linkedId = linked ? packageFromQuery(decodeURIComponent(linked)) : null;
  if (linkedId) return samePrice.find((p) => p.id === linkedId) ?? null;

  const name = normalizeName(input.name);
  return (
    samePrice.find(
      (p) =>
        name === normalizeName(p.name) ||
        name === normalizeName(p.shortName) ||
        NAME_HINTS[p.id].some((hint) => name.includes(hint)),
    ) ?? null
  );
}

/**
 * Offers for the rows that are real, bookable packages — one per package,
 * using the canonical public name/price and the /book/?package= deep link.
 * Everything else is dropped so it is never sent to Google as InStock.
 */
export function bookableOffers(items: readonly (OfferInput | PackagePrice)[]): OfferInput[] {
  const seen = new Set<PackageId>();
  const out: OfferInput[] = [];
  for (const item of items) {
    const pkg = matchBookablePackage(item);
    if (!pkg || seen.has(pkg.id)) continue;
    seen.add(pkg.id);
    out.push({
      name: pkg.name,
      price: pkg.price,
      description: item.description ?? pkg.description,
      priceValidUntil: item.priceValidUntil,
      url: bookHref(pkg.id),
    });
  }
  return out;
}

/**
 * OfferCatalog listing the bookable packages (used on "/", hub and package
 * pages). Returns undefined when none of the rows is a real package.
 */
export function offerCatalog(
  items: readonly (OfferInput | PackagePrice)[],
  name = "Slingshot Experience Packages",
): JsonLd | undefined {
  const offers = bookableOffers(items);
  if (!offers.length) return undefined;
  return compact({
    "@type": "OfferCatalog",
    name,
    itemListElement: offers.map((item) => offer(item)),
  });
}

export interface ServiceInput {
  name: string;
  description: string;
  /** Site path of the page describing the service. */
  path: string;
  serviceType?: string;
  packages?: readonly (OfferInput | PackagePrice)[];
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
      hasOfferCatalog: input.packages && input.packages.length ? offerCatalog(input.packages) : undefined,
    }),
  );
}

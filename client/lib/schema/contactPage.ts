import { IDS, absoluteUrl, compact, withContext, type JsonLd } from "./common";

export function contactPage(input: { path?: string; name?: string; description?: string } = {}): JsonLd {
  return withContext(
    compact({
      "@type": "ContactPage",
      "@id": `${absoluteUrl(input.path ?? "/contact/")}#contactpage`,
      url: absoluteUrl(input.path ?? "/contact/"),
      name: input.name ?? "Contact Ennis Slingshot Experience",
      description: input.description,
      about: { "@id": IDS.business },
      mainEntity: { "@id": IDS.business },
      isPartOf: { "@id": IDS.website },
    }),
  );
}

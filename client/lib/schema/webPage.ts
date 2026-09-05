import { IDS, absoluteUrl, compact, isoDate, withContext, type JsonLd } from "./common";

export interface WebPageInput {
  path: string;
  name: string;
  description?: string;
  /** "WebPage" (default), "Article", "AboutPage", "CollectionPage", "ImageGallery" … */
  type?: string;
  image?: string;
  datePublished?: Date | string;
  dateModified?: Date | string;
}

/** Generic page entity (Article / AboutPage / CollectionPage / WebPage …). */
export function webPage(input: WebPageInput): JsonLd {
  const url = absoluteUrl(input.path);
  const type = input.type ?? "WebPage";
  const isArticle = type === "Article";
  return withContext(
    compact({
      "@type": type,
      "@id": `${url}#${type.toLowerCase()}`,
      url,
      name: isArticle ? undefined : input.name,
      headline: isArticle ? input.name : undefined,
      mainEntityOfPage: isArticle ? { "@type": "WebPage", "@id": url } : undefined,
      description: input.description,
      image: input.image ? [input.image] : undefined,
      datePublished: isoDate(input.datePublished),
      dateModified: isoDate(input.dateModified ?? input.datePublished),
      inLanguage: "en-US",
      isPartOf: { "@id": IDS.website },
      publisher: { "@id": IDS.organization },
      author: isArticle ? { "@id": IDS.organization } : undefined,
    }),
  );
}

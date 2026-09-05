import { business } from "@shared/business";
import { IDS, compact, withContext, type JsonLd } from "./common";

export interface WebSiteOptions {
  /**
   * Emit a SearchAction (sitelinks search box). Only pass a template once the
   * site actually has a search results page — Google penalises dead targets.
   * Example: "https://ennisslingshot.com/search/?q={search_term_string}"
   */
  searchUrlTemplate?: string;
}

export function webSite(opts: WebSiteOptions = {}): JsonLd {
  return withContext(
    compact({
      "@type": "WebSite",
      "@id": IDS.website,
      name: business.name,
      alternateName: business.shortName,
      url: business.url,
      description: business.description,
      inLanguage: "en-US",
      publisher: { "@id": IDS.organization },
      potentialAction: opts.searchUrlTemplate
        ? {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: opts.searchUrlTemplate,
            },
            "query-input": "required name=search_term_string",
          }
        : undefined,
    }),
  );
}

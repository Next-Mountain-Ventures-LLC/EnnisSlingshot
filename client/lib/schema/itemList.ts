import { absoluteUrl, compact, withContext, type JsonLd } from "./common";

export interface ItemListEntry {
  name: string;
  /** Site path or absolute URL. */
  url?: string;
  description?: string;
  image?: string;
}

/** Ordered ItemList (listicle hubs like /ennis/, hub→spoke navigation). */
export function itemList(name: string, items: ItemListEntry[], opts: { description?: string; path?: string } = {}): JsonLd {
  return withContext(
    compact({
      "@type": "ItemList",
      name,
      description: opts.description,
      url: opts.path ? absoluteUrl(opts.path) : undefined,
      numberOfItems: items.length,
      itemListOrder: "https://schema.org/ItemListOrderAscending",
      itemListElement: items.map((item, i) =>
        compact({
          "@type": "ListItem",
          position: i + 1,
          name: item.name,
          url: item.url ? absoluteUrl(item.url) : undefined,
          description: item.description,
          image: item.image,
        }),
      ),
    }),
  );
}

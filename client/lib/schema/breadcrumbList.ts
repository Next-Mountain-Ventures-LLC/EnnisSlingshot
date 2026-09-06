import { absoluteUrl, withContext, type JsonLd } from "./common";

export interface BreadcrumbItem {
  label: string;
  /** Site path. Omit for the current page (last crumb). */
  path?: string;
}

export function breadcrumbList(items: BreadcrumbItem[]): JsonLd {
  return withContext({
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => {
      const li: Record<string, unknown> = {
        "@type": "ListItem",
        position: i + 1,
        name: item.label,
      };
      if (item.path) li.item = absoluteUrl(item.path);
      return li;
    }),
  });
}

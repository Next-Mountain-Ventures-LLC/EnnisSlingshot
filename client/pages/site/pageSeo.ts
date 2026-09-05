/**
 * Maps a site page's frontmatter (schemaType, faqs, packagePrice…) onto the
 * JSON-LD stack described in SITE-REBUILD-PLAN.md §3. Shared by ContentPage
 * and HubPage. BreadcrumbList, FAQPage and OfferCatalog are emitted by their
 * own components (Breadcrumbs, FaqAccordion, PackagePriceTable), so they are
 * intentionally not duplicated here.
 */
import type { SitePage } from "@/lib/pages";
import { getHubPage, getPageLabel, getPagesUnderHub } from "@/lib/pages";
import type { BreadcrumbItem } from "@/lib/schema/breadcrumbList";
import {
  contactPage,
  itemList,
  localBusiness,
  organization,
  service,
  touristAttraction,
  webPage,
  type JsonLd,
} from "@/lib/schema";
import { business } from "@shared/business";

export function pageJsonLd(page: SitePage): JsonLd[] {
  const { data } = page;
  const common = {
    path: page.path,
    name: data.h1,
    description: data.metaDescription,
    image: data.ogImage ?? business.image,
    datePublished: data.publishDate,
    dateModified: data.updatedDate,
  };

  switch (data.schemaType) {
    case "LocalBusiness":
      return [localBusiness(), organization()];
    case "Service":
      return [
        service({
          name: data.h1,
          description: data.metaDescription,
          path: page.path,
          packages: data.packagePrice,
          image: data.ogImage,
        }),
        localBusiness(),
      ];
    case "TouristAttraction":
    case "TouristDestination":
      return [
        touristAttraction({
          name: data.h1,
          description: data.metaDescription,
          path: page.path,
          image: data.ogImage,
          type: data.schemaType,
        }),
        webPage({ ...common, type: "Article" }),
      ];
    case "ItemList": {
      const spokes = page.hub ? getPagesUnderHub(page.hub) : [];
      return [
        itemList(
          data.h1,
          spokes.map((s) => ({
            name: getPageLabel(s),
            url: s.path,
            description: s.data.metaDescription,
          })),
          { description: data.metaDescription, path: page.path },
        ),
        page.hub === "ennis"
          ? touristAttraction({
              name: "Ennis, Texas",
              description: data.metaDescription,
              path: page.path,
              type: "TouristDestination",
            })
          : webPage(common),
      ];
    }
    case "ContactPage":
      return [
        contactPage({ path: page.path, name: data.h1, description: data.metaDescription }),
        localBusiness(),
      ];
    case "AboutPage":
      return [webPage({ ...common, type: "AboutPage" }), organization()];
    case "Event":
      // Event JSON-LD needs a real startDate (Google rejects Events without one).
      // Until the page schema carries dates, emit an Article for the page.
      return [webPage({ ...common, type: "Article" })];
    case "Article":
      return [webPage({ ...common, type: "Article" })];
    case "FAQPage":
      // FAQPage itself is emitted by <FaqAccordion withSchema>.
      return [webPage(common)];
    case "ImageGallery":
    case "CollectionPage":
      return [webPage({ ...common, type: data.schemaType })];
    case "WebPage":
    default:
      return [webPage(common)];
  }
}

/** Home › Hub › Page trail for a site page. */
export function pageBreadcrumbs(page: SitePage): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [{ label: "Home", path: "/" }];
  if (page.hub && !page.isHub) {
    const hub = getHubPage(page.hub);
    items.push({
      label: hub ? getPageLabel(hub) : page.hub,
      path: `/${page.hub}/`,
    });
  }
  items.push({ label: getPageLabel(page) });
  return items;
}

/**
 * JSON-LD builders (SITE-REBUILD-PLAN.md §3). Each returns a plain object;
 * pass arrays of them to <Seo jsonLd={[...]}> which emits one
 * <script type="application/ld+json"> per object into <head> (prerendered).
 */
export type { JsonLd } from "./common";
export { IDS, absoluteUrl } from "./common";
export { localBusiness } from "./localBusiness";
export { organization } from "./organization";
export { webSite } from "./webSite";
export { service, offer, offerCatalog } from "./service";
export { event } from "./event";
export { touristAttraction } from "./touristAttraction";
export { itemList } from "./itemList";
export { blogPosting, blogPostingStack, person } from "./blogPosting";
export { breadcrumbList } from "./breadcrumbList";
export { faqPage } from "./faqPage";
export { contactPage } from "./contactPage";
export { webPage } from "./webPage";

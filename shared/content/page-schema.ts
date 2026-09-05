/**
 * Frontmatter schema for site pages under client/content/pages/**\/*.md
 * (hubs, spokes, support pages, blog-category intros). Defined in
 * SITE-REBUILD-PLAN.md §2.2. Shared by client/lib/pages.ts (Vite glob) and
 * the Node build scripts (fs).
 *
 * File path is the routing source of truth: `<dir>/index.md` → `/<dir>/`,
 * `<dir>/<name>.md` → `/<dir>/<name>/`, `<name>.md` → `/<name>/`.
 * `canonicalPath` is what goes in <link rel="canonical"> and normally equals
 * the file-derived path.
 */
import { z } from "zod";

export const HUBS = ["slingshot-rental", "bluebonnets", "ennis"] as const;
export type HubSlug = (typeof HUBS)[number];

export const PAGE_SCHEMA_TYPES = [
  "LocalBusiness",
  "Service",
  "TouristAttraction",
  "TouristDestination",
  "Article",
  "ItemList",
  "ContactPage",
  "AboutPage",
  "FAQPage",
  "Event",
  "ImageGallery",
  "CollectionPage",
  "WebPage",
] as const;
export type PageSchemaType = (typeof PAGE_SCHEMA_TYPES)[number];

export const ISLANDS = [
  "TrailMap",
  "BloomTracker",
  "Weather",
  "EventsCalendar",
] as const;
export type IslandName = (typeof ISLANDS)[number];

/** Small static widgets a page can opt into (rendered after the body). */
export const WIDGETS = ["DriveTimes"] as const;
export type WidgetName = (typeof WIDGETS)[number];

const sitePath = z
  .string()
  .regex(/^\/([a-z0-9-]+\/)*$/, {
    message:
      'canonicalPath must be a lowercase, hyphenated site path with leading and trailing slashes, e.g. "/slingshot-rental/pricing/"',
  });

export const faqSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
});
export type Faq = z.infer<typeof faqSchema>;

export const packagePriceSchema = z.object({
  name: z.string().min(1),
  /** Display price. Number (79) or string ("$79", "$169 for two"). */
  price: z.union([z.number(), z.string()]),
  priceValidUntil: z.coerce.date().optional(),
  description: z.string().optional(),
  /** Deep link for the "Book" button (Acuity URL or /book/). */
  url: z.string().optional(),
});
export type PackagePrice = z.infer<typeof packagePriceSchema>;

export const pageFrontmatterSchema = z.object({
  title: z.string().min(1),
  metaDescription: z.string().min(1),
  canonicalPath: sitePath,
  h1: z.string().min(1),
  hub: z.enum(HUBS).nullable().default(null),
  schemaType: z.enum(PAGE_SCHEMA_TYPES).default("WebPage"),
  faqs: z.array(faqSchema).optional(),
  packagePrice: z.array(packagePriceSchema).optional(),
  island: z.enum(ISLANDS).optional(),
  widget: z.enum(WIDGETS).optional(),
  updatedDate: z.coerce.date().optional(),
  publishDate: z.coerce.date().optional(),
  ogImage: z.string().optional(),
  breadcrumbLabel: z.string().optional(),
  /** Set true to keep a page out of the sitemap and add <meta name="robots" content="noindex">. */
  noindex: z.coerce.boolean().default(false),
});

export type PageFrontmatter = z.infer<typeof pageFrontmatterSchema>;

/**
 * Derive the site path from a file path relative to client/content/pages.
 *   "slingshot-rental/index.md" → "/slingshot-rental/"
 *   "slingshot-rental/pricing.md" → "/slingshot-rental/pricing/"
 *   "about.md" → "/about/"
 *   "index.md" → "/"
 */
export function pagePathFromFile(relativeFile: string): string {
  const noExt = relativeFile.replace(/\\/g, "/").replace(/\.md$/, "");
  const segments = noExt.split("/").filter(Boolean);
  if (segments[segments.length - 1] === "index") segments.pop();
  return segments.length ? `/${segments.join("/")}/` : "/";
}

/** Parse a numeric amount out of a display price ("$169 for two" → 169). */
export function numericPrice(price: string | number): number | undefined {
  if (typeof price === "number") return price;
  const m = price.replace(/,/g, "").match(/(\d+(?:\.\d+)?)/);
  return m ? Number(m[1]) : undefined;
}

/**
 * Static route inventory for ennisslingshot.com — the URL tree from
 * seo/strategy/SITE-STRUCTURE.md — plus the pure route-manifest builder shared
 * by client/lib/routes.ts (Vite/SSG side) and scripts/generate-seo-files.ts
 * (Node side). Keep this file free of Vite-only APIs.
 */

/** Every site page URL in SITE-STRUCTURE.md (hubs, spokes, support pages). */
export const SITE_STRUCTURE_URLS = [
  "/",
  // HUB 1 — Rental & Experiences
  "/slingshot-rental/",
  "/slingshot-rental/drive-and-go/",
  "/slingshot-rental/bluebonnet-trail-experience/",
  "/slingshot-rental/date-night/",
  "/slingshot-rental/groups/",
  "/slingshot-rental/gift-cards/",
  "/slingshot-rental/pricing/",
  "/slingshot-rental/requirements/",
  "/slingshot-rental/near-dallas/",
  "/slingshot-rental/near-fort-worth/",
  "/slingshot-rental/near-arlington/",
  "/slingshot-rental/waxahachie-ellis-county/",
  "/slingshot-rental/texas/",
  // HUB 2 — Bluebonnets
  "/bluebonnets/",
  "/bluebonnets/festival/",
  "/bluebonnets/trail-map/",
  "/bluebonnets/bloom-tracker/",
  "/bluebonnets/weather/",
  "/bluebonnets/photo-spots/",
  "/bluebonnets/welcome-center/",
  "/bluebonnets/bluebonnet-capital-of-texas/",
  "/bluebonnets/where-to-see-bluebonnets-near-dallas/",
  "/bluebonnets/texas-bluebonnet-festivals/",
  "/bluebonnets/history/",
  // HUB 3 — Ennis
  "/ennis/",
  "/ennis/day-trip-from-dallas/",
  "/ennis/weekend-itinerary/",
  "/ennis/texas-motorplex/",
  "/ennis/national-polka-festival/",
  "/ennis/where-to-eat/",
  "/ennis/where-to-stay/",
  "/ennis/downtown/",
  "/ennis/events/",
  // Blog
  "/blog/",
  // Support
  "/about/",
  "/faq/",
  "/reviews/",
  "/gallery/",
  "/contact/",
  "/book/",
  "/privacy/",
  "/terms/",
] as const;

/** The five visible blog categories (routing category "EnnisSlingshot.com" is hidden). */
export const BLOG_CATEGORIES = [
  {
    slug: "bluebonnets",
    name: "Ennis Bluebonnets",
    description:
      "Seasonal bluebonnet articles, bloom updates, and festival news from the Bluebonnet Capital of Texas.",
    /** WordPress category slugs/names that map onto this site category. */
    aliases: ["ennis-bluebonnets", "bluebonnets"],
  },
  {
    slug: "ennis-dfw",
    name: "Ennis & DFW Things to Do",
    description:
      "Day trips, things to do, and local events in Ennis, Ellis County, and the Dallas–Fort Worth area.",
    aliases: ["ennis-dfw-things-to-do", "ennis-dfw", "ennis-and-dfw-things-to-do"],
  },
  {
    slug: "date-ideas",
    name: "Dallas Date Ideas",
    description: "Dallas date ideas, occasions, and experience gifts.",
    aliases: ["dallas-date-ideas", "date-ideas"],
  },
  {
    slug: "slingshot-101",
    name: "Polaris Slingshot 101",
    description:
      "Everything a first-timer wants to know about the Polaris Slingshot: what it is, how it drives, Texas laws, and what to expect.",
    aliases: ["polaris-slingshot-101", "slingshot-101", "about"],
  },
  {
    slug: "news",
    name: "Ennis Slingshot News",
    description:
      "Business updates, season announcements, and recaps from Ennis Slingshot Experience.",
    aliases: ["ennis-slingshot-news", "news"],
  },
] as const;

export type BlogCategorySlug = (typeof BLOG_CATEGORIES)[number]["slug"];

export function getBlogCategory(slug: string) {
  return BLOG_CATEGORIES.find((c) => c.slug === slug);
}

/** Resolve a WordPress category slug or name to a site category, if any. */
export function resolveBlogCategory(wpSlugOrName: string) {
  const key = wpSlugOrName.toLowerCase().trim();
  return BLOG_CATEGORIES.find(
    (c) =>
      c.slug === key ||
      c.name.toLowerCase() === key ||
      (c.aliases as readonly string[]).includes(key),
  );
}

export function blogCategoryPath(slug: string): string {
  return `/blog/category/${slug}/`;
}

export function blogPostPath(slug: string): string {
  return `/blog/${slug}/`;
}

export type RouteKind =
  | "home"
  | "hub"
  | "page"
  | "blog-index"
  | "blog-category"
  | "blog-post"
  | "not-found";

export interface RouteEntry {
  /** Site path with trailing slash (except "/" and "/404"). */
  path: string;
  kind: RouteKind;
  /** ISO date used for sitemap <lastmod>; undefined → omitted. */
  lastmod?: string;
  /** Sitemap priority hint (0–1). */
  priority?: number;
  /** Excluded from sitemap.xml (noindex pages, /404). */
  noindex?: boolean;
}

export interface ManifestInputs {
  /** Site pages discovered on disk (client/content/pages/**). */
  pages: Array<{
    path: string;
    isHub: boolean;
    updatedDate?: Date;
    publishDate?: Date;
    noindex?: boolean;
  }>;
  /** Published blog posts. */
  posts: Array<{ slug: string; updatedDate?: Date; pubDate: Date }>;
  /** Build date fallback for lastmod of component-backed routes. */
  now?: Date;
}

function iso(d?: Date): string | undefined {
  return d && !Number.isNaN(d.getTime()) ? d.toISOString().slice(0, 10) : undefined;
}

/**
 * Build the ordered, de-duplicated route manifest.
 *
 * Component-backed routes ("/", "/blog/", the 5 category pages, "/404") are
 * always present. Markdown pages are present when a file exists. URLs from
 * SITE_STRUCTURE_URLS with no content file yet are reported via `missing` so
 * the build can warn — they are NOT prerendered (that would ship a 404 page
 * at a real URL and put it in the sitemap).
 */
export function buildRouteManifest(input: ManifestInputs): {
  routes: RouteEntry[];
  missing: string[];
} {
  const now = input.now ?? new Date();
  const routes = new Map<string, RouteEntry>();
  const latestPost = input.posts.reduce<Date | undefined>((acc, p) => {
    const d = p.updatedDate ?? p.pubDate;
    return !acc || d > acc ? d : acc;
  }, undefined);

  routes.set("/", {
    path: "/",
    kind: "home",
    lastmod: iso(now),
    priority: 1,
  });

  for (const page of input.pages) {
    if (page.path === "/") continue; // home is client/pages/Index.tsx
    if (page.path.startsWith("/blog-categories/")) continue; // intro copy, not a route
    routes.set(page.path, {
      path: page.path,
      kind: page.isHub ? "hub" : "page",
      lastmod: iso(page.updatedDate ?? page.publishDate) ?? iso(now),
      priority: page.isHub ? 0.9 : 0.7,
      noindex: page.noindex,
    });
  }

  routes.set("/blog/", {
    path: "/blog/",
    kind: "blog-index",
    lastmod: iso(latestPost) ?? iso(now),
    priority: 0.8,
  });

  for (const cat of BLOG_CATEGORIES) {
    routes.set(blogCategoryPath(cat.slug), {
      path: blogCategoryPath(cat.slug),
      kind: "blog-category",
      lastmod: iso(latestPost) ?? iso(now),
      priority: 0.6,
    });
  }

  for (const post of input.posts) {
    routes.set(blogPostPath(post.slug), {
      path: blogPostPath(post.slug),
      kind: "blog-post",
      lastmod: iso(post.updatedDate ?? post.pubDate),
      priority: 0.6,
    });
  }

  routes.set("/404", { path: "/404", kind: "not-found", noindex: true });

  const missing = SITE_STRUCTURE_URLS.filter((url) => !routes.has(url));
  return { routes: [...routes.values()], missing };
}

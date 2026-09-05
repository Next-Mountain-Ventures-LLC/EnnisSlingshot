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

/**
 * The WordPress routing category (ID 34) that tells the sync plugin a post
 * belongs to this site. It must NEVER be displayed, linked, put in JSON-LD
 * `articleSection`, or emitted in the RSS feed. See CLAUDE.md.
 */
export const ROUTING_CATEGORY_NAME = "EnnisSlingshot.com";
export const ROUTING_CATEGORY_SLUG = "ennisslingshot-com";

/** True for the hidden routing category, matched by slug or (case-insensitive) name. */
export function isRoutingCategory(term: { name?: string; slug?: string }): boolean {
  const slug = term.slug?.toLowerCase().trim();
  const name = term.name?.toLowerCase().trim();
  return (
    slug === ROUTING_CATEGORY_SLUG ||
    slug === "ennisslingshot" ||
    slug === "ennisslingshotcom" ||
    name === ROUTING_CATEGORY_NAME.toLowerCase() ||
    name === "ennisslingshot"
  );
}

/** Posts per page on /blog/ and /blog/category/<slug>/ (SITE-REBUILD-PLAN.md §6). */
export const BLOG_PAGE_SIZE = 12;

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
    aliases: ["polaris-slingshot-101", "slingshot-101"],
  },
  {
    slug: "news",
    name: "Ennis Slingshot News",
    description:
      "Business updates, season announcements, and recaps from Ennis Slingshot Experience.",
    /** Legacy WordPress "About" category (pre-rebuild posts) is treated as news. */
    aliases: ["ennis-slingshot-news", "news", "about"],
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

/** /blog/ for page 1, /blog/page/<n>/ afterwards. */
export function blogIndexPath(page = 1): string {
  return page <= 1 ? "/blog/" : `/blog/page/${page}/`;
}

/** /blog/category/<slug>/ for page 1, /blog/category/<slug>/page/<n>/ afterwards. */
export function blogCategoryPagePath(slug: string, page = 1): string {
  return page <= 1 ? blogCategoryPath(slug) : `${blogCategoryPath(slug)}page/${page}/`;
}

/** Number of pages needed for `count` posts (always ≥ 1). */
export function blogPageCount(count: number, pageSize = BLOG_PAGE_SIZE): number {
  return Math.max(1, Math.ceil(count / pageSize));
}

export function blogPostPath(slug: string): string {
  return `/blog/${slug}/`;
}

export type RouteKind =
  | "home"
  | "hub"
  | "page"
  | "blog-index"
  | "blog-index-page"
  | "blog-category"
  | "blog-category-page"
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
  /** Page ≥ 2 of a paginated index: prerendered and indexable, but not listed in sitemap.xml. */
  paginated?: boolean;
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
  /**
   * Published blog posts. `categorySlugs`/`categories` (raw WordPress terms)
   * are used to size the per-category pagination; omit them and category
   * pages get only page 1.
   */
  posts: Array<{
    slug: string;
    updatedDate?: Date;
    pubDate: Date;
    categories?: readonly string[];
    categorySlugs?: readonly string[];
  }>;
  /** Build date fallback for lastmod of component-backed routes. */
  now?: Date;
}

/** Does a post (by its raw WP terms) belong to the given SITE category slug? Routing category ignored. */
export function postIsInCategory(
  post: { categories?: readonly string[]; categorySlugs?: readonly string[] },
  siteSlug: string,
): boolean {
  const names = post.categories ?? [];
  const slugs = post.categorySlugs ?? [];
  const n = Math.max(names.length, slugs.length);
  for (let i = 0; i < n; i++) {
    const term = { name: names[i], slug: slugs[i] };
    if (isRoutingCategory(term)) continue;
    const site =
      (term.slug ? resolveBlogCategory(term.slug) : undefined) ??
      (term.name ? resolveBlogCategory(term.name) : undefined);
    if (site?.slug === siteSlug) return true;
  }
  return false;
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
  // Paginated index pages (/blog/page/2/ …): prerendered + self-canonical,
  // but `paginated: true` keeps them out of sitemap.xml (only page 1 is listed).
  for (let page = 2; page <= blogPageCount(input.posts.length); page++) {
    routes.set(blogIndexPath(page), {
      path: blogIndexPath(page),
      kind: "blog-index-page",
      lastmod: iso(latestPost) ?? iso(now),
      priority: 0.3,
      paginated: true,
    });
  }

  for (const cat of BLOG_CATEGORIES) {
    routes.set(blogCategoryPath(cat.slug), {
      path: blogCategoryPath(cat.slug),
      kind: "blog-category",
      lastmod: iso(latestPost) ?? iso(now),
      priority: 0.6,
    });
    const inCategory = input.posts.filter((p) =>
      postIsInCategory(p, cat.slug),
    ).length;
    for (let page = 2; page <= blogPageCount(inCategory); page++) {
      routes.set(blogCategoryPagePath(cat.slug, page), {
        path: blogCategoryPagePath(cat.slug, page),
        kind: "blog-category-page",
        lastmod: iso(latestPost) ?? iso(now),
        priority: 0.3,
        paginated: true,
      });
    }
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

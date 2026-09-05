/**
 * Route manifest — the single list of URLs that get prerendered by
 * vite-react-ssg (`includedRoutes` in client/App.tsx), and the same list the
 * Node scripts reproduce for sitemap.xml / assert-prerendered.
 *
 * Sources: static site routes from SITE-STRUCTURE.md that have a content file
 * (client/content/pages/**), the blog index, the five category pages (plus
 * /blog/page/N/ and /blog/category/<slug>/page/N/ when there are more than
 * BLOG_PAGE_SIZE posts), every published post, and /404. See shared/content/site-routes.ts for the pure
 * builder and the SITE_STRUCTURE_URLS inventory.
 */
import {
  buildRouteManifest,
  type RouteEntry,
} from "@shared/content/site-routes";
import { getPublishedPosts, getPostSlug } from "./blog";
import { getAllPages } from "./pages";

let cached: { routes: RouteEntry[]; missing: string[] } | null = null;

export function getRouteManifest(): { routes: RouteEntry[]; missing: string[] } {
  if (cached) return cached;
  cached = buildRouteManifest({
    pages: getAllPages().map((p) => ({
      path: p.path,
      isHub: p.isHub,
      updatedDate: p.data.updatedDate,
      publishDate: p.data.publishDate,
      noindex: p.data.noindex,
    })),
    posts: getPublishedPosts().map((post) => ({
      slug: getPostSlug(post),
      updatedDate: post.data.updatedDate,
      pubDate: post.data.pubDate,
      categories: post.data.categories,
      categorySlugs: post.data.categorySlugs,
    })),
  });
  return cached;
}

/** Paths to prerender (leading slash; trailing slash except "/" and "/404"). */
export function getPrerenderPaths(): string[] {
  return getRouteManifest().routes.map((r) => r.path);
}

/**
 * vite-react-ssg `includedRoutes` hook. Ignores the auto-discovered React
 * Router paths (which have no trailing slashes and include dynamic segments)
 * and returns the explicit manifest instead. Warns about SITE-STRUCTURE URLs
 * that have no content file yet so they are visible in the build log.
 */
export function includedRoutes(_paths: string[]): string[] {
  const { routes, missing } = getRouteManifest();
  if (missing.length) {
    console.warn(
      `\n[routes] ${missing.length} SITE-STRUCTURE.md URL(s) have no content file under client/content/pages/ yet and will not be prerendered:\n  ${missing.join(
        "\n  ",
      )}\n`,
    );
  }
  return routes.map((r) => r.path);
}

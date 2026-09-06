/**
 * Site-page content collection.
 * Reads every markdown file under client/content/pages/** at build/dev time via
 * Vite's import.meta.glob, validates frontmatter with the shared Zod schema
 * (shared/content/page-schema.ts) and exposes lookup helpers. Any file added
 * under client/content/pages/ automatically becomes a route (see
 * client/lib/routes.ts and client/App.tsx).
 */
import {
  pageFrontmatterSchema,
  pagePathFromFile,
  HUBS,
  type HubSlug,
  type PageFrontmatter,
} from "@shared/content/page-schema";
import { parseFrontmatter } from "@shared/content/blog-schema";

export interface SitePage {
  /** Site path with leading + trailing slash, derived from the file path. */
  path: string;
  /** Path relative to client/content/pages (e.g. "slingshot-rental/pricing.md"). */
  file: string;
  data: PageFrontmatter;
  /** Raw markdown body (frontmatter stripped). */
  body: string;
  /** True for `<hub>/index.md` where <hub> is one of the three hubs. */
  isHub: boolean;
  /** Hub this page belongs to (its own slug for hub pages). */
  hub: HubSlug | null;
}

const rawPageModules = import.meta.glob("../content/pages/**/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

const PAGES_PREFIX = "../content/pages/";

function hubFromPath(path: string): HubSlug | null {
  const first = path.split("/").filter(Boolean)[0];
  return (HUBS as readonly string[]).includes(first) ? (first as HubSlug) : null;
}

const allPages: SitePage[] = Object.entries(rawPageModules)
  .map(([key, raw]) => {
    const file = key.slice(key.indexOf(PAGES_PREFIX) + PAGES_PREFIX.length);
    const path = pagePathFromFile(file);
    const { data, body } = parseFrontmatter(raw);
    const parsed = pageFrontmatterSchema.safeParse(data);
    if (!parsed.success) {
      console.warn(
        `[pages] Skipping "${file}" — invalid frontmatter:`,
        parsed.error.flatten().fieldErrors,
      );
      return null;
    }
    // blog-categories/<slug>.md is intro copy for /blog/category/<slug>/ — its
    // canonicalPath legitimately differs from the file-derived path.
    if (parsed.data.canonicalPath !== path && !path.startsWith("/blog-categories/")) {
      console.warn(
        `[pages] "${file}" canonicalPath ${parsed.data.canonicalPath} differs from file-derived route ${path}; routing uses the file path.`,
      );
    }
    const pathHub = hubFromPath(path);
    const isHub = pathHub !== null && path === `/${pathHub}/`;
    return {
      path,
      file,
      data: parsed.data,
      body: body.trim(),
      isHub,
      hub: parsed.data.hub ?? pathHub,
    } satisfies SitePage;
  })
  .filter((p): p is SitePage => p !== null)
  .sort((a, b) => a.path.localeCompare(b.path));

/** Normalize any incoming pathname to the "/a/b/" form used as page keys. */
export function normalizePagePath(pathname: string): string {
  let p = pathname.split(/[?#]/)[0] || "/";
  if (!p.startsWith("/")) p = `/${p}`;
  if (!p.endsWith("/")) p = `${p}/`;
  return p.replace(/\/{2,}/g, "/");
}

export function getAllPages(): SitePage[] {
  return allPages;
}

/** Look up a page by site path ("/slingshot-rental/pricing/" — slashes normalized). */
export function getPage(path: string): SitePage | undefined {
  const key = normalizePagePath(path);
  return allPages.find((p) => p.path === key);
}

/** Spoke pages under a hub (excludes the hub's own index page), sorted by path. */
export function getPagesUnderHub(hub: HubSlug): SitePage[] {
  return allPages.filter((p) => p.hub === hub && !p.isHub);
}

export function getHubPage(hub: HubSlug): SitePage | undefined {
  return allPages.find((p) => p.isHub && p.hub === hub);
}

/**
 * Every routable page path. Excludes "/" (owned by client/pages/Index.tsx) and
 * blog-category intro copy (rendered inside the category template).
 */
export function getAllPageRoutes(): string[] {
  return allPages
    .filter((p) => p.path !== "/" && !p.path.startsWith("/blog-categories/"))
    .map((p) => p.path);
}

/** Intro copy for /blog/category/<slug>/, if an author wrote one. */
export function getBlogCategoryIntro(slug: string): SitePage | undefined {
  return allPages.find((p) => p.path === `/blog-categories/${slug}/`);
}

/** Human label for breadcrumbs / hub nav. */
export function getPageLabel(page: SitePage): string {
  return page.data.breadcrumbLabel || page.data.h1 || page.data.title;
}

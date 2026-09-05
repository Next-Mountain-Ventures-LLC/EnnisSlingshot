/**
 * Post-build SEO files: writes sitemap.xml, robots.txt and llms.txt into
 * dist/spa, plus dist/route-manifest.json (outside the publish dir) for
 * scripts/assert-prerendered.mjs.
 *
 * Runs under `tsx` after `vite-react-ssg build` (see package.json
 * `build:client`). Uses plain fs — no Vite — and the shared parsers in
 * shared/content/*.ts so it enumerates exactly the routes the SSG rendered.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  blogFrontmatterSchema,
  isPublishedFrontmatter,
  parseFrontmatter,
} from "../shared/content/blog-schema";
import {
  pageFrontmatterSchema,
  pagePathFromFile,
  HUBS,
} from "../shared/content/page-schema";
import {
  buildRouteManifest,
  BLOG_CATEGORIES,
  type RouteEntry,
} from "../shared/content/site-routes";
import { business, SITE_URL, isTodo } from "../shared/business";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "dist", "spa");
const BLOG_DIR = path.join(ROOT, "client", "content", "blog");
const PAGES_DIR = path.join(ROOT, "client", "content", "pages");

function walk(dir: string, ext = ".md"): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full, ext));
    else if (entry.isFile() && entry.name.endsWith(ext)) out.push(full);
  }
  return out.sort();
}

function loadPosts() {
  return walk(BLOG_DIR)
    .map((file) => {
      const id = path.basename(file, ".md");
      const { data } = parseFrontmatter(fs.readFileSync(file, "utf8"));
      const parsed = blogFrontmatterSchema.safeParse(data);
      if (!parsed.success) {
        console.warn(`[seo-files] skipping blog post "${id}" (invalid frontmatter)`);
        return null;
      }
      if (!isPublishedFrontmatter(parsed.data)) return null;
      return {
        slug: parsed.data.slug || id,
        title: parsed.data.title,
        description: parsed.data.description ?? parsed.data.excerpt,
        pubDate: parsed.data.pubDate,
        updatedDate: parsed.data.updatedDate,
        categories: parsed.data.categories,
        categorySlugs: parsed.data.categorySlugs,
      };
    })
    .filter((p): p is NonNullable<typeof p> => p !== null)
    .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
}

function loadPages() {
  return walk(PAGES_DIR)
    .map((file) => {
      const rel = path.relative(PAGES_DIR, file);
      const sitePath = pagePathFromFile(rel);
      const { data } = parseFrontmatter(fs.readFileSync(file, "utf8"));
      const parsed = pageFrontmatterSchema.safeParse(data);
      if (!parsed.success) {
        console.warn(`[seo-files] skipping page "${rel}" (invalid frontmatter)`);
        return null;
      }
      const first = sitePath.split("/").filter(Boolean)[0];
      const isHub = (HUBS as readonly string[]).includes(first) && sitePath === `/${first}/`;
      return {
        path: sitePath,
        isHub,
        title: parsed.data.title,
        h1: parsed.data.h1,
        description: parsed.data.metaDescription,
        updatedDate: parsed.data.updatedDate,
        publishDate: parsed.data.publishDate,
        noindex: parsed.data.noindex,
      };
    })
    .filter((p): p is NonNullable<typeof p> => p !== null);
}

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function sitemapXml(routes: RouteEntry[]): string {
  const urls = routes
    // Only page 1 of each paginated index is listed (SITE-REBUILD-PLAN.md §6).
    .filter((r) => !r.noindex && !r.paginated && r.path !== "/404" && !/\/page\/\d+\/$/.test(r.path))
    .map((r) => {
      const lines = [`    <loc>${xmlEscape(SITE_URL + r.path)}</loc>`];
      if (r.lastmod) lines.push(`    <lastmod>${r.lastmod}</lastmod>`);
      if (r.priority !== undefined) lines.push(`    <priority>${r.priority.toFixed(1)}</priority>`);
      return `  <url>\n${lines.join("\n")}\n  </url>`;
    });
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
}

function robotsTxt(): string {
  // Allow every crawler, explicitly including the AI-search bots.
  const bots = [
    "Googlebot",
    "Bingbot",
    "GPTBot",
    "ChatGPT-User",
    "OAI-SearchBot",
    "ClaudeBot",
    "Claude-User",
    "Claude-SearchBot",
    "anthropic-ai",
    "PerplexityBot",
    "Perplexity-User",
    "Google-Extended",
    "Applebot",
    "Applebot-Extended",
    "Twitterbot",
    "facebookexternalhit",
  ];
  const blocks = bots.map((ua) => `User-agent: ${ua}\nAllow: /`).join("\n\n");
  return `${blocks}\n\nUser-agent: *\nAllow: /\nDisallow: /404\n\nSitemap: ${SITE_URL}/sitemap.xml\n`;
}

function llmsTxt(pages: ReturnType<typeof loadPages>, posts: ReturnType<typeof loadPosts>): string {
  const hubs = pages.filter((p) => p.isHub);
  const spokesByHub = (hub: string) =>
    pages.filter((p) => !p.isHub && p.path.startsWith(`/${hub}/`));
  const nap = [
    `- Name: ${business.name}`,
    `- Website: ${SITE_URL}`,
    `- Meeting point: ${business.meetingPoint.formatted}`,
    !isTodo(business.phone) ? `- Phone: ${business.phone}` : null,
    !isTodo(business.email) ? `- Email: ${business.email}` : null,
    `- Season: ${business.hours.note}`,
    `- Coordinates: ${business.geo.latitude}, ${business.geo.longitude}`,
    `- Facebook: ${business.sameAs[0]}`,
  ]
    .filter(Boolean)
    .join("\n");

  const lines: string[] = [
    `# ${business.name}`,
    "",
    `> ${business.description}`,
    "",
    "Self-drive Polaris Slingshot experiences from Ennis, TX (Bluebonnet Capital of Texas), 35 miles south of Dallas on I-45. Packages: 1-Hour Drive & Go $69.99; 2-Hour Bluebonnet Trail Experience $79 solo / $149 driver + rider. Insurance included, no deposit, no motorcycle license required (Texas autocycle — Tex. Transp. Code §521.085(b)). Season: April (Ennis Bluebonnet Trails open April 1–30).",
    "",
    "## Business facts (NAP)",
    nap,
    "",
  ];

  for (const hub of hubs) {
    lines.push(`## ${hub.h1}`, "", `- [${hub.title}](${SITE_URL}${hub.path}): ${hub.description}`);
    for (const s of spokesByHub(hub.path.replace(/\//g, ""))) {
      lines.push(`- [${s.title}](${SITE_URL}${s.path}): ${s.description}`);
    }
    lines.push("");
  }

  const support = pages.filter((p) => !p.isHub && !HUBS.some((h) => p.path.startsWith(`/${h}/`)) && !p.path.startsWith("/blog-categories/"));
  if (support.length) {
    lines.push("## Support pages", "");
    for (const s of support) lines.push(`- [${s.title}](${SITE_URL}${s.path}): ${s.description}`);
    lines.push("");
  }

  lines.push("## Blog", "", `- [Blog index](${SITE_URL}/blog/)`);
  for (const cat of BLOG_CATEGORIES) {
    lines.push(`- [${cat.name}](${SITE_URL}/blog/category/${cat.slug}/): ${cat.description}`);
  }
  lines.push("");
  if (posts.length) {
    lines.push("### Posts", "");
    for (const p of posts) {
      lines.push(`- [${p.title}](${SITE_URL}/blog/${p.slug}/)${p.description ? `: ${p.description}` : ""}`);
    }
    lines.push("");
  }
  lines.push("## Machine-readable", "", `- Sitemap: ${SITE_URL}/sitemap.xml`, `- Robots: ${SITE_URL}/robots.txt`, "");
  return lines.join("\n");
}

function main() {
  if (!fs.existsSync(OUT)) {
    console.error(`[seo-files] ${OUT} does not exist — run \`vite-react-ssg build\` first.`);
    process.exit(1);
  }
  const posts = loadPosts();
  const pages = loadPages();
  const { routes, missing } = buildRouteManifest({
    pages,
    posts,
  });

  fs.writeFileSync(path.join(OUT, "sitemap.xml"), sitemapXml(routes));
  fs.writeFileSync(path.join(OUT, "robots.txt"), robotsTxt());
  fs.writeFileSync(path.join(OUT, "llms.txt"), llmsTxt(pages, posts));
  // Public JSON endpoint for the bloom tracker (BloomTrackerIsland "Add this to your site").
  fs.copyFileSync(
    path.join(ROOT, "client", "content", "data", "bloom-status.json"),
    path.join(OUT, "bloom-status.json"),
  );
  fs.writeFileSync(
    path.join(ROOT, "dist", "route-manifest.json"),
    JSON.stringify({ generatedAt: new Date().toISOString(), routes, missing }, null, 2),
  );

  console.log(
    `[seo-files] wrote sitemap.xml (${routes.filter((r) => !r.noindex && !r.paginated && r.path !== "/404").length} urls), robots.txt, llms.txt, dist/route-manifest.json (${routes.length} routes)`,
  );
  if (missing.length) {
    console.warn(`[seo-files] ${missing.length} SITE-STRUCTURE URL(s) without a content file yet:\n  ${missing.join("\n  ")}`);
  }
}

main();

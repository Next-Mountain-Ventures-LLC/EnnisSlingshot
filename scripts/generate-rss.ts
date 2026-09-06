/**
 * RSS 2.0 feed → dist/spa/rss.xml, built from the published posts in
 * client/content/blog/*.md (same parser as the site). Runs under `tsx` in the
 * `build:client` chain after vite-react-ssg.
 *
 * - Newest 20 posts; <link>/<guid> use the canonical site URL, never the
 *   WordPress permalink.
 * - <category> lists only the visible site categories — the routing category
 *   ("EnnisSlingshot.com") is never emitted.
 * - <content:encoded> is the markdown body rendered with the same
 *   react-markdown + remark-gfm stack the site uses, HTML comments stripped,
 *   relative links/images absolutized.
 */
import fs from "node:fs";
import path from "node:path";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { loadPublishedPosts, ROOT, type LoadedPost } from "./lib/posts";
import { business, SITE_URL } from "../shared/business";
import { resolveAuthor } from "../shared/author";
import { blogPostPath, isRoutingCategory, resolveBlogCategory } from "../shared/content/site-routes";

const OUT = path.join(ROOT, "dist", "spa");
const FEED_PATH = "/rss.xml";
const MAX_ITEMS = 20;
const BLOG_IMAGES_DIR = path.join(ROOT, "public", "blog-images");

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function cdata(s: string): string {
  return `<![CDATA[${s.replace(/\]\]>/g, "]]]]><![CDATA[>")}]]>`;
}

function absolutize(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith("/")) return `${SITE_URL}${url}`;
  return url;
}

function bodyHtml(post: LoadedPost): string {
  const markdown = post.body.replace(/<!--[\s\S]*?-->/g, "");
  const html = renderToStaticMarkup(
    React.createElement(ReactMarkdown, { remarkPlugins: [remarkGfm] }, markdown),
  );
  return html
    .replace(/(href|src)="\/([^"]*)"/g, (_m, attr, rest) => `${attr}="${SITE_URL}/${rest}"`);
}

/** Visible site-category names for a post (routing category stripped, duplicates collapsed). */
function visibleCategories(post: LoadedPost): string[] {
  const out: string[] = [];
  post.data.categories.forEach((name, i) => {
    const slug = post.data.categorySlugs[i];
    if (isRoutingCategory({ name, slug })) return;
    const site = (slug ? resolveBlogCategory(slug) : undefined) ?? resolveBlogCategory(name);
    const label = site?.name ?? name;
    if (!out.includes(label)) out.push(label);
  });
  return out;
}

/** Local prebuilt hero (public/blog-images/<postId>.webp) → remote heroImage → none. */
function heroUrl(post: LoadedPost): string | undefined {
  const keys = [post.data.postId !== undefined ? String(post.data.postId) : undefined, post.slug, post.id];
  for (const key of keys) {
    if (!key) continue;
    for (const ext of ["webp", "jpg", "jpeg", "png", "avif"]) {
      if (fs.existsSync(path.join(BLOG_IMAGES_DIR, `${key}.${ext}`))) return `${SITE_URL}/blog-images/${key}.${ext}`;
    }
  }
  return post.data.heroImage;
}

function mimeFor(url: string): string {
  const ext = url.split("?")[0]!.split(".").pop()!.toLowerCase();
  return { webp: "image/webp", jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", avif: "image/avif", gif: "image/gif" }[ext] ?? "image/jpeg";
}

function item(post: LoadedPost): string {
  const url = `${SITE_URL}${blogPostPath(post.slug)}`;
  const author = resolveAuthor(post.data);
  const description = post.data.description ?? post.data.excerpt ?? "";
  const hero = heroUrl(post);
  const lines = [
    `      <title>${xmlEscape(post.data.title)}</title>`,
    `      <link>${xmlEscape(url)}</link>`,
    `      <guid isPermaLink="true">${xmlEscape(url)}</guid>`,
    `      <pubDate>${post.data.pubDate.toUTCString()}</pubDate>`,
    `      <dc:creator>${xmlEscape(author.name)}</dc:creator>`,
    ...visibleCategories(post).map((c) => `      <category>${xmlEscape(c)}</category>`),
    description ? `      <description>${xmlEscape(description)}</description>` : "",
    hero ? `      <enclosure url="${xmlEscape(absolutize(hero))}" type="${mimeFor(hero)}" length="0" />` : "",
    `      <content:encoded>${cdata(bodyHtml(post))}</content:encoded>`,
  ].filter(Boolean);
  return `    <item>\n${lines.join("\n")}\n    </item>`;
}

export function buildRss(posts: LoadedPost[]): string {
  const latest = posts[0]?.data.updatedDate ?? posts[0]?.data.pubDate ?? new Date();
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${xmlEscape(`${business.name} Blog`)}</title>
    <link>${SITE_URL}/blog/</link>
    <atom:link href="${SITE_URL}${FEED_PATH}" rel="self" type="application/rss+xml" />
    <description>${xmlEscape(business.description)}</description>
    <language>en-us</language>
    <lastBuildDate>${latest.toUTCString()}</lastBuildDate>
    <image>
      <url>${xmlEscape(business.logo)}</url>
      <title>${xmlEscape(`${business.name} Blog`)}</title>
      <link>${SITE_URL}/blog/</link>
    </image>
${posts.slice(0, MAX_ITEMS).map(item).join("\n")}
  </channel>
</rss>
`;
}

function main() {
  if (!fs.existsSync(OUT)) {
    console.error(`[rss] ${OUT} does not exist — run \`vite-react-ssg build\` first.`);
    process.exit(1);
  }
  const posts = loadPublishedPosts();
  fs.writeFileSync(path.join(OUT, "rss.xml"), buildRss(posts));
  console.log(`[rss] wrote rss.xml (${Math.min(posts.length, MAX_ITEMS)} of ${posts.length} posts)`);
}

main();

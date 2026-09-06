/**
 * Hero-image resolution for blog posts.
 *
 * `scripts/fetch-blog-images.mjs` (package.json `prebuild`) downloads every
 * post's remote `heroImage` into public/blog-images/<postId>.webp so the page
 * serves a same-origin, recompressed asset (no third-party image host in the
 * LCP path). This module maps a post to that local file when it exists at
 * build time, and falls back to the remote URL otherwise — a failed download
 * never breaks a post.
 */
import type { BlogPost } from "./blog";

// The prebuild script writes public/blog-images/manifest.json = { "<postId>": "/blog-images/<file>" }.
// A glob import (not a direct import) so a missing manifest (e.g. `pnpm dev`
// without prebuild) means "no local images" instead of a build error, and the
// SSR + client bundles read the same plain URLs (no hashed-asset rewriting).
const manifests = import.meta.glob("../../public/blog-images/manifest.json", {
  eager: true,
  import: "default",
}) as Record<string, Record<string, string>>;

const byId = new Map<string, string>();
for (const manifest of Object.values(manifests)) {
  for (const [id, url] of Object.entries(manifest)) byId.set(id, url);
}

/** Local (prebuilt) hero URL for a post, or undefined when none was fetched. */
export function getLocalHeroImage(post: Pick<BlogPost, "id" | "data">): string | undefined {
  const keys = [post.data.postId !== undefined ? String(post.data.postId) : undefined, post.data.slug, post.id];
  for (const key of keys) {
    if (key && byId.has(key)) return byId.get(key);
  }
  return undefined;
}

/** Best hero-image URL for a post: local prebuilt copy → remote `heroImage` → undefined. */
export function resolveHeroImage(post: Pick<BlogPost, "id" | "data">): string | undefined {
  return getLocalHeroImage(post) ?? post.data.heroImage;
}

/** Default social/OG image for posts without a hero (static asset in public/og/). */
export const BLOG_DEFAULT_OG_IMAGE = "/og/blog-default.png";

/** OG image for a post: hero (local or remote) else the blog default. */
export function resolveOgImage(post: Pick<BlogPost, "id" | "data">): string {
  return resolveHeroImage(post) ?? BLOG_DEFAULT_OG_IMAGE;
}

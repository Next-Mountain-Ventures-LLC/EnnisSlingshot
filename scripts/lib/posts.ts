/**
 * Node-side (fs) loader for published blog posts, sharing the exact parser +
 * schema the client bundle uses (shared/content/blog-schema.ts). Used by
 * scripts/generate-rss.ts; scripts/fetch-blog-images.mjs has its own
 * dependency-free frontmatter reader because it runs before tsx is needed.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  blogFrontmatterSchema,
  isPublishedFrontmatter,
  parseFrontmatter,
  type BlogFrontmatter,
} from "../../shared/content/blog-schema";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
export const BLOG_DIR = path.join(ROOT, "client", "content", "blog");

export interface LoadedPost {
  id: string;
  slug: string;
  data: BlogFrontmatter;
  body: string;
}

/** Published posts, newest first. */
export function loadPublishedPosts(): LoadedPost[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".md"))
    .sort()
    .map((file) => {
      const id = path.basename(file, ".md");
      const { data, body } = parseFrontmatter(fs.readFileSync(path.join(BLOG_DIR, file), "utf8"));
      const parsed = blogFrontmatterSchema.safeParse(data);
      if (!parsed.success) {
        console.warn(`[posts] skipping "${id}" (invalid frontmatter)`);
        return null;
      }
      if (!isPublishedFrontmatter(parsed.data)) return null;
      return { id, slug: parsed.data.slug || id, data: parsed.data, body: body.trim() };
    })
    .filter((p): p is LoadedPost => p !== null)
    .sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
}

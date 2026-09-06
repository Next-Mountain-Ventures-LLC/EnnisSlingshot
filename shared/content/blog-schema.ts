/**
 * Blog frontmatter schema + frontmatter parser, shared by the client bundle
 * (client/lib/blog.ts, via import.meta.glob) and the Node build scripts
 * (scripts/generate-seo-files.ts, via fs) so both sides parse posts identically.
 *
 * The field set mirrors what the WordPress sync plugin writes into
 * client/content/blog/<slug>.md. Do NOT rename or remove fields here — the
 * plugin is the producer. Only additive, optional fields are safe.
 */
import { z } from "zod";
import yaml from "js-yaml";

export const blogFrontmatterSchema = z.object({
  // Only these two are guaranteed on every post.
  title: z.string(),
  pubDate: z.coerce.date(),
  // Everything else may or may not be sent by the WordPress plugin —
  // keep all of it optional/coerced so a post missing a field doesn't
  // break the build.
  description: z.string().optional(),
  excerpt: z.string().optional(),
  slug: z.string().optional(),
  updatedDate: z.coerce.date().optional(),
  draft: z.coerce.boolean().default(false),
  status: z.string().optional(),
  heroImage: z.string().url().optional(),
  heroImageAlt: z.string().optional(),
  tags: z.array(z.string()).default([]),
  tagSlugs: z.array(z.string()).default([]),
  categories: z.array(z.string()).default([]),
  categorySlugs: z.array(z.string()).default([]),
  author: z.string().optional(),
  authorEmail: z.string().email().optional(),
  authorUrl: z.string().url().optional(),
  authorBio: z.string().optional(),
  /** Optional author avatar (absolute URL) for the AuthorBox. Not sent by WP today. */
  authorImage: z.string().url().optional(),
  authorId: z.coerce.number().optional(),
  postId: z.coerce.number().optional(),
  permalink: z.string().url().optional(),
  guid: z.string().optional(),
  commentCount: z.coerce.number().optional(),
  wordCount: z.coerce.number().optional(),
  readingTime: z.coerce.number().optional(),
});

export type BlogFrontmatter = z.infer<typeof blogFrontmatterSchema>;

/** Split a markdown file into its YAML frontmatter object and body. */
export function parseFrontmatter(raw: string): {
  data: Record<string, unknown>;
  body: string;
} {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(raw);
  if (!match) {
    return { data: {}, body: raw };
  }
  const [, yamlBlock, body] = match;
  const data = (yaml.load(yamlBlock) as Record<string, unknown>) ?? {};
  return { data, body };
}

/** Is this post publicly visible? (draft=false and status publish/published if set) */
export function isPublishedFrontmatter(data: BlogFrontmatter): boolean {
  if (data.draft) return false;
  if (
    data.status &&
    !["publish", "published"].includes(data.status.toLowerCase())
  ) {
    return false;
  }
  return true;
}

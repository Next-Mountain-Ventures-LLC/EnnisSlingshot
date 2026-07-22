/**
 * Blog content collection
 * Reads markdown posts (with frontmatter) from client/content/blog at build/dev
 * time via Vite's import.meta.glob. No network requests, no build-time
 * credentials — the WordPress export plugin commits markdown files directly
 * into this repo and that's the only input this module needs.
 */
import { z } from 'zod';
import yaml from 'js-yaml';

const blogFrontmatterSchema = z.object({
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
  authorId: z.coerce.number().optional(),
  postId: z.coerce.number().optional(),
  permalink: z.string().url().optional(),
  guid: z.string().optional(),
  commentCount: z.coerce.number().optional(),
  wordCount: z.coerce.number().optional(),
  readingTime: z.coerce.number().optional(),
});

export type BlogFrontmatter = z.infer<typeof blogFrontmatterSchema>;

export interface BlogPost {
  /** Filename-derived id, used as the URL slug fallback */
  id: string;
  data: BlogFrontmatter;
  /** Raw markdown body (frontmatter stripped) */
  body: string;
}

export interface Term {
  name: string;
  slug: string;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseFrontmatter(raw: string): { data: Record<string, unknown>; body: string } {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(raw);
  if (!match) {
    return { data: {}, body: raw };
  }
  const [, yamlBlock, body] = match;
  const data = (yaml.load(yamlBlock) as Record<string, unknown>) ?? {};
  return { data, body };
}

const rawPostModules = import.meta.glob('../content/blog/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

const allPosts: BlogPost[] = Object.entries(rawPostModules)
  .map(([path, raw]) => {
    const id = path.split('/').pop()!.replace(/\.md$/, '');
    const { data, body } = parseFrontmatter(raw);
    const parsed = blogFrontmatterSchema.safeParse(data);
    if (!parsed.success) {
      console.warn(`[blog] Skipping "${id}" — invalid frontmatter:`, parsed.error.flatten().fieldErrors);
      return null;
    }
    return { id, data: parsed.data, body: body.trim() };
  })
  .filter((post): post is BlogPost => post !== null);

/** All posts where draft is false (and status is publish/published, if set), newest first */
export function getPublishedPosts(): BlogPost[] {
  return allPosts
    .filter((post) => {
      if (post.data.draft) return false;
      if (post.data.status && !['publish', 'published'].includes(post.data.status.toLowerCase())) {
        return false;
      }
      return true;
    })
    .sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
}

/** Resolve the URL slug: prefer frontmatter `slug`, fall back to the filename id */
export function getPostSlug(post: BlogPost): string {
  return post.data.slug || post.id;
}

/** Full path for a post link (this site's convention: no trailing slash) */
export function getPostUrl(post: BlogPost): string {
  return `/blog/${getPostSlug(post)}`;
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return allPosts.find((post) => getPostSlug(post) === slug);
}

export function getCategoryTerms(post: BlogPost): Term[] {
  return post.data.categories.map((name, i) => ({
    name,
    slug: post.data.categorySlugs[i] || slugify(name),
  }));
}

export function getTagTerms(post: BlogPost): Term[] {
  return post.data.tags.map((name, i) => ({
    name,
    slug: post.data.tagSlugs[i] || slugify(name),
  }));
}

/** Unique category slugs across all published posts */
export function getAllCategorySlugs(): string[] {
  const slugs = new Set<string>();
  for (const post of getPublishedPosts()) {
    for (const term of getCategoryTerms(post)) slugs.add(term.slug);
  }
  return [...slugs];
}

/** slug -> display name map, built from the posts themselves */
export function getCategoriesWithNames(): Map<string, string> {
  const map = new Map<string, string>();
  for (const post of getPublishedPosts()) {
    for (const term of getCategoryTerms(post)) {
      if (!map.has(term.slug)) map.set(term.slug, term.name);
    }
  }
  return map;
}

export function getPostsByCategorySlug(slug: string): BlogPost[] {
  return getPublishedPosts().filter((post) => getCategoryTerms(post).some((term) => term.slug === slug));
}

/** Score by shared category (2pts) / shared tag (1pt), fill remaining slots with most-recent posts */
export function getRelatedPosts(post: BlogPost, count = 3): BlogPost[] {
  const categorySlugs = new Set(getCategoryTerms(post).map((t) => t.slug));
  const tagSlugs = new Set(getTagTerms(post).map((t) => t.slug));

  const scored = getPublishedPosts()
    .filter((candidate) => candidate.id !== post.id)
    .map((candidate) => {
      const score =
        getCategoryTerms(candidate).filter((t) => categorySlugs.has(t.slug)).length * 2 +
        getTagTerms(candidate).filter((t) => tagSlugs.has(t.slug)).length;
      return { post: candidate, score };
    })
    .sort((a, b) => b.score - a.score || b.post.data.pubDate.getTime() - a.post.data.pubDate.getTime());

  const related = scored.filter((s) => s.score > 0).map((s) => s.post).slice(0, count);

  if (related.length < count) {
    const usedIds = new Set([post.id, ...related.map((p) => p.id)]);
    const fillers = getPublishedPosts().filter((p) => !usedIds.has(p.id)).slice(0, count - related.length);
    related.push(...fillers);
  }

  return related;
}

/** description > excerpt > truncated body, for card/preview UI */
export function getPostExcerpt(post: BlogPost, maxLength = 160): string {
  if (post.data.description) return post.data.description;
  if (post.data.excerpt) return post.data.excerpt;

  const plainText = post.body
    .replace(/^#+\s+/gm, '')
    .replace(/[*_`>#-]/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();

  return plainText.length > maxLength ? `${plainText.slice(0, maxLength).trim()}…` : plainText;
}

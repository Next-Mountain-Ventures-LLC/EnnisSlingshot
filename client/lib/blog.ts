/**
 * Blog content collection
 * Reads markdown posts (with frontmatter) from client/content/blog at build/dev
 * time via Vite's import.meta.glob. The frontmatter schema + parser live in
 * shared/content/blog-schema.ts so the Node build scripts parse identically. No network requests, no build-time
 * credentials — the WordPress export plugin commits markdown files directly
 * into this repo and that's the only input this module needs.
 */
import {
  blogFrontmatterSchema,
  parseFrontmatter,
  isPublishedFrontmatter,
  type BlogFrontmatter,
} from '@shared/content/blog-schema';
import {
  blogPostPath,
  resolveBlogCategory,
  ROUTING_CATEGORY_NAME,
  ROUTING_CATEGORY_SLUG,
  isRoutingCategory,
  type BlogCategorySlug,
} from '@shared/content/site-routes';

export { ROUTING_CATEGORY_NAME, ROUTING_CATEGORY_SLUG, isRoutingCategory };

export type { BlogFrontmatter };

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
    .filter((post) => isPublishedFrontmatter(post.data))
    .sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
}

/** Resolve the URL slug: prefer frontmatter `slug`, fall back to the filename id */
export function getPostSlug(post: BlogPost): string {
  return post.data.slug || post.id;
}

/** Full path for a post link. Site convention (LINKING-CONVENTIONS.md): trailing slash. */
export function getPostUrl(post: BlogPost): string {
  return blogPostPath(getPostSlug(post));
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return allPosts.find((post) => getPostSlug(post) === slug);
}

/**
 * Raw WordPress category terms on a post — INCLUDING the hidden routing
 * category ("EnnisSlingshot.com"). Only use this for internal matching; every
 * rendered list must go through getVisibleCategoryTerms().
 */
export function getCategoryTerms(post: BlogPost): Term[] {
  return post.data.categories.map((name, i) => ({
    name,
    slug: post.data.categorySlugs[i] || slugify(name),
  }));
}

/** A category that is safe to render: one of the five site categories. */
export interface SiteCategoryTerm extends Term {
  slug: BlogCategorySlug;
  /** Site path: /blog/category/<slug>/ */
  path: string;
}

/**
 * Categories to DISPLAY for a post: the routing category is stripped, every
 * remaining WordPress term is mapped onto its site category (bluebonnets,
 * ennis-dfw, date-ideas, slingshot-101, news — the legacy "About" term maps to
 * news), and duplicates are collapsed. Unknown terms are dropped rather than
 * shown, so a typo in WordPress can never leak a stray label onto the site.
 */
export function getVisibleCategoryTerms(post: BlogPost): SiteCategoryTerm[] {
  const seen = new Set<string>();
  const out: SiteCategoryTerm[] = [];
  for (const term of getCategoryTerms(post)) {
    if (isRoutingCategory(term)) continue;
    const site = resolveBlogCategory(term.slug) ?? resolveBlogCategory(term.name);
    if (!site || seen.has(site.slug)) continue;
    seen.add(site.slug);
    out.push({ name: site.name, slug: site.slug, path: `/blog/category/${site.slug}/` });
  }
  return out;
}

/** The post's primary (first visible) site category, if any. */
export function getPrimaryCategory(post: BlogPost): SiteCategoryTerm | undefined {
  return getVisibleCategoryTerms(post)[0];
}

/** Strip the routing category from any list of category names/terms (for schema `articleSection`, feeds, etc.). */
export function stripRoutingCategory<T extends string | Term>(items: readonly T[]): T[] {
  return items.filter((item) =>
    typeof item === 'string' ? !isRoutingCategory({ name: item, slug: slugify(item) }) : !isRoutingCategory(item),
  );
}

export function getTagTerms(post: BlogPost): Term[] {
  return post.data.tags.map((name, i) => ({
    name,
    slug: post.data.tagSlugs[i] || slugify(name),
  }));
}

/** Unique visible (site) category slugs across all published posts */
export function getAllCategorySlugs(): string[] {
  const slugs = new Set<string>();
  for (const post of getPublishedPosts()) {
    for (const term of getVisibleCategoryTerms(post)) slugs.add(term.slug);
  }
  return [...slugs];
}

/** slug -> display name map of visible (site) categories that have at least one post */
export function getCategoriesWithNames(): Map<string, string> {
  const map = new Map<string, string>();
  for (const post of getPublishedPosts()) {
    for (const term of getVisibleCategoryTerms(post)) {
      if (!map.has(term.slug)) map.set(term.slug, term.name);
    }
  }
  return map;
}

/** Published posts in a SITE category (slug: bluebonnets | ennis-dfw | date-ideas | slingshot-101 | news), newest first. */
export function getPostsByCategorySlug(slug: string): BlogPost[] {
  const site = resolveBlogCategory(slug);
  if (!site) return [];
  return getPublishedPosts().filter((post) => getVisibleCategoryTerms(post).some((term) => term.slug === site.slug));
}

/**
 * Previous (older) and next (newer) published posts by pubDate, for the
 * PrevNextPost footer. Returns undefined at either end of the list.
 */
export function getAdjacentPosts(post: BlogPost): { prev?: BlogPost; next?: BlogPost } {
  const posts = getPublishedPosts(); // newest first
  const index = posts.findIndex((p) => p.id === post.id);
  if (index === -1) return {};
  return {
    next: index > 0 ? posts[index - 1] : undefined,
    prev: index < posts.length - 1 ? posts[index + 1] : undefined,
  };
}

/** Plain-text word count of the body (markdown syntax and HTML comments removed). */
export function getWordCount(post: BlogPost): number {
  if (post.data.wordCount && post.data.wordCount > 0) return post.data.wordCount;
  const text = post.body
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[#*_`>|~-]+/g, ' ');
  return text.split(/\s+/).filter(Boolean).length;
}

/** Reading time in whole minutes: frontmatter `readingTime` if present, else words / 200 wpm (min 1). */
export function getReadingTime(post: BlogPost): number {
  if (post.data.readingTime && post.data.readingTime > 0) return Math.max(1, Math.round(post.data.readingTime));
  return Math.max(1, Math.ceil(getWordCount(post) / 200));
}

/**
 * Related posts: same SITE category first (2pts per shared visible category —
 * the routing category is ignored so it can't make every post "related"),
 * then shared tags (1pt), then most-recent fillers.
 */
export function getRelatedPosts(post: BlogPost, count = 3): BlogPost[] {
  const categorySlugs = new Set(getVisibleCategoryTerms(post).map((t) => t.slug));
  const tagSlugs = new Set(getTagTerms(post).map((t) => t.slug));

  const scored = getPublishedPosts()
    .filter((candidate) => candidate.id !== post.id)
    .map((candidate) => {
      const score =
        getVisibleCategoryTerms(candidate).filter((t) => categorySlugs.has(t.slug)).length * 2 +
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
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/^#+\s+/gm, '')
    .replace(/[*_`>#-]/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();

  return plainText.length > maxLength ? `${plainText.slice(0, maxLength).trim()}…` : plainText;
}

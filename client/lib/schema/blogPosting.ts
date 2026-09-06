import { business, absoluteUrl as absolutize } from "@shared/business";
import { resolveAuthor, type Author } from "@shared/author";
import type { BlogFrontmatter } from "@shared/content/blog-schema";
import { isRoutingCategory, resolveBlogCategory } from "@shared/content/site-routes";
import { IDS, absoluteUrl, compact, isoDate, withContext, type JsonLd } from "./common";

export interface PersonInput {
  name: string;
  url?: string;
  image?: string;
  description?: string;
  email?: string;
}

/** Standalone Person entity (author). */
export function person(input: PersonInput): JsonLd {
  return withContext(
    compact({
      "@type": "Person",
      "@id": personId(input.name),
      name: input.name,
      url: input.url,
      image: input.image,
      description: input.description,
      email: input.email,
      worksFor: { "@id": IDS.organization },
    }),
  );
}

/** Site category names for articleSection — the routing category is never emitted. */
function visibleSections(data: BlogFrontmatter): string[] {
  const out: string[] = [];
  data.categories.forEach((name, i) => {
    const slug = data.categorySlugs[i];
    if (isRoutingCategory({ name, slug })) return;
    const site = (slug ? resolveBlogCategory(slug) : undefined) ?? resolveBlogCategory(name);
    const label = site?.name ?? name;
    if (!out.includes(label)) out.push(label);
  });
  return out;
}

function personId(name: string): string {
  return `${business.url}/#person-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

export interface BlogPostingInput {
  data: BlogFrontmatter;
  /** Site path of the post ("/blog/<slug>/"). */
  path: string;
  /** Plain-text body (markdown is fine — used for articleBody/wordCount only). */
  body?: string;
  /** Fallback OG image when the post has no heroImage. */
  fallbackImage?: string;
  /** Resolved hero image (e.g. the local prebuilt copy) — overrides data.heroImage. */
  image?: string;
  /** Resolved author (defaults to resolveAuthor(data) → DEFAULT_AUTHOR). */
  author?: Author;
  /** Reading time in minutes → timeRequired (ISO 8601 duration). */
  readingTimeMinutes?: number;
  /** Word count override (when frontmatter has none). */
  wordCount?: number;
}

/** BlogPosting referencing the Person author and the Organization publisher. */
export function blogPosting(input: BlogPostingInput): JsonLd {
  const { data } = input;
  const url = absoluteUrl(input.path);
  const image = absolutize(input.image ?? data.heroImage ?? input.fallbackImage ?? business.image);
  const author = input.author ?? resolveAuthor(data);
  const wordCount = data.wordCount || input.wordCount;
  return withContext(
    compact({
      "@type": "BlogPosting",
      "@id": `${url}#article`,
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      url,
      headline: data.title,
      description: data.description ?? data.excerpt,
      image: [image],
      datePublished: isoDate(data.pubDate),
      dateModified: isoDate(data.updatedDate ?? data.pubDate),
      author: { "@id": personId(author.name) },
      publisher: { "@id": IDS.organization },
      keywords: data.tags.length ? data.tags.join(", ") : undefined,
      articleSection: visibleSections(data),
      wordCount: wordCount && wordCount > 0 ? wordCount : undefined,
      timeRequired: input.readingTimeMinutes ? `PT${Math.max(1, Math.round(input.readingTimeMinutes))}M` : undefined,
      inLanguage: "en-US",
      isPartOf: { "@id": IDS.website },
    }),
  );
}

/** The full stack for a post page: BlogPosting + Person (the resolved author). Add organization() alongside. */
export function blogPostingStack(input: BlogPostingInput): JsonLd[] {
  const author = input.author ?? resolveAuthor(input.data);
  return [
    blogPosting({ ...input, author }),
    person({
      name: author.name,
      url: author.url,
      image: author.image,
      description: author.bio || undefined,
    }),
  ];
}

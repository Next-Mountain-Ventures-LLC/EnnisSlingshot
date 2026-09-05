import { business } from "@shared/business";
import type { BlogFrontmatter } from "@shared/content/blog-schema";
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
}

/** BlogPosting referencing the Person author and the Organization publisher. */
export function blogPosting(input: BlogPostingInput): JsonLd {
  const { data } = input;
  const url = absoluteUrl(input.path);
  const image = data.heroImage ?? input.fallbackImage ?? business.image;
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
      author: data.author ? { "@id": personId(data.author) } : { "@id": IDS.organization },
      publisher: { "@id": IDS.organization },
      keywords: data.tags.length ? data.tags.join(", ") : undefined,
      articleSection: data.categories,
      wordCount: data.wordCount,
      inLanguage: "en-US",
      isPartOf: { "@id": IDS.website },
    }),
  );
}

/** The full stack for a post page: BlogPosting + Person (if author) + Organization ref. */
export function blogPostingStack(input: BlogPostingInput): JsonLd[] {
  const out: JsonLd[] = [blogPosting(input)];
  if (input.data.author) {
    out.push(
      person({
        name: input.data.author,
        url: input.data.authorUrl,
        image: input.data.authorImage,
        description: input.data.authorBio,
      }),
    );
  }
  return out;
}

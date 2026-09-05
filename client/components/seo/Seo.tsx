/**
 * Per-route <head> management.
 *
 * Wraps react-helmet-async's <Helmet>. vite-react-ssg already mounts a
 * <HelmetProvider> around the router on both the client and the SSG renderer
 * (it collects `helmet.title/meta/link/script` and splices them into each
 * prerendered route's <head>), so this component must NOT add another
 * provider — a nested provider would swallow the tags on the server.
 * react-helmet-async is pinned to the exact version vite-react-ssg depends on
 * so both resolve to a single module instance.
 *
 * Usage: one <Seo> per page (later/nested instances override earlier ones);
 * JSON-LD objects accumulate — one <script type="application/ld+json"> each.
 */
import { Helmet } from "react-helmet-async";
import { business, absoluteUrl } from "@shared/business";
import type { JsonLd } from "@/lib/schema";

export const DEFAULT_OG_IMAGE = business.image;
export const SITE_NAME = business.name;

/** JSON that is safe inside a <script> element (no "</script>" / "<!--" breakouts). */
export function serializeJsonLd(obj: JsonLd): string {
  return JSON.stringify(obj)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

export interface SeoProps {
  title: string;
  description: string;
  /** Site path ("/blog/") — absolutized to https://ennisslingshot.com for the canonical + og:url. */
  canonicalPath: string;
  ogImage?: string;
  ogType?: "website" | "article" | "profile" | "product";
  noindex?: boolean;
  jsonLd?: JsonLd[];
  /** Article meta (published_time etc.) for ogType="article". */
  article?: { publishedTime?: string; modifiedTime?: string; author?: string; tags?: string[] };
}

export function Seo({
  title,
  description,
  canonicalPath,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = "website",
  noindex = false,
  jsonLd = [],
  article,
}: SeoProps) {
  const canonical = absoluteUrl(canonicalPath);
  const fullTitle = title;
  const image = absoluteUrl(ogImage);

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large" />
      )}

      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_US" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={image} />
      {article?.publishedTime && (
        <meta property="article:published_time" content={article.publishedTime} />
      )}
      {article?.modifiedTime && (
        <meta property="article:modified_time" content={article.modifiedTime} />
      )}
      {article?.author && <meta property="article:author" content={article.author} />}
      {article?.tags?.map((tag) => (
        <meta key={tag} property="article:tag" content={tag} />
      ))}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {jsonLd.map((obj, i) => (
        <script key={i} type="application/ld+json">
          {serializeJsonLd(obj)}
        </script>
      ))}
    </Helmet>
  );
}

/** Emit extra JSON-LD from a component that isn't the page's <Seo> (e.g. Breadcrumbs). */
export function JsonLdScript({ data }: { data: JsonLd | JsonLd[] }) {
  const list = Array.isArray(data) ? data : [data];
  return (
    <Helmet>
      {list.map((obj, i) => (
        <script key={i} type="application/ld+json">
          {serializeJsonLd(obj)}
        </script>
      ))}
    </Helmet>
  );
}

export default Seo;

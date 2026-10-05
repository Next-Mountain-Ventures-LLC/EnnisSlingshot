/**
 * Where the booking CTAs (BookingCta strip / banner / card) appear on markdown
 * site pages, and the copy they use. Shared by ContentPage, HubPage and
 * IslandPageShell so the three templates follow one rule:
 *
 *   - strip (under the page header) + sidebar card: SEO landing pages — every
 *     page in a hub, plus /faq/, /about/ and /gallery/
 *   - banner (after the body / islands, before the FAQ): every page except the
 *     ones below
 *   - nothing: /privacy/, /terms/ and /book/ (the scheduler is the CTA there)
 *
 * Copy comes from the page's frontmatter `cta` (shared/content/page-schema.ts);
 * missing fields fall back to the BookingCta defaults, href to "/book/".
 */
import type { PageCta } from "@shared/content/page-schema";
import type { BookingCtaProps } from "@/components/shared/BookingCta";

export interface PageCtaSlots {
  strip: boolean;
  banner: boolean;
  card: boolean;
}

const NO_CTA_PATHS = new Set(["/privacy/", "/terms/", "/book/"]);
const SEO_SUPPORT_PATHS = new Set(["/faq/", "/about/", "/gallery/"]);

export function pageCtaSlots(page: { path: string; hub: string | null }): PageCtaSlots {
  if (NO_CTA_PATHS.has(page.path)) return { strip: false, banner: false, card: false };
  const seo = page.hub !== null || SEO_SUPPORT_PATHS.has(page.path);
  return { strip: seo, banner: true, card: seo };
}

export type PageCtaCopy = Required<Pick<BookingCtaProps, "href">> &
  Pick<BookingCtaProps, "headline" | "body" | "buttonLabel">;

export function pageCtaCopy(cta: PageCta | undefined): PageCtaCopy {
  return {
    headline: cta?.headline,
    body: cta?.body,
    buttonLabel: cta?.buttonLabel,
    href: cta?.href || "/book/",
  };
}

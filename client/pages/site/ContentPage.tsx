/**
 * Generic template for every markdown site page that is not a hub
 * (spokes, support pages). Reads the page for the current pathname from
 * client/lib/pages.ts and renders: breadcrumbs, H1, booking CTA strip,
 * markdown body, widget, PackagePriceTable (Offer schema), CTA banner,
 * FaqAccordion (FAQPage schema) — plus a sticky aside (CTA card + "More in
 * <hub>" sibling nav) from lg; on phones the sibling nav sits at the bottom.
 * CTA placement rules: client/components/booking/pageCta.ts.
 */
import { Link, useLocation } from "react-router-dom";
import { getHubPage, getPage, getPageLabel, getPagesUnderHub, type SitePage } from "@/lib/pages";
import { Seo } from "@/components/seo/Seo";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { MarkdownBody } from "@/components/shared/MarkdownBody";
import { FaqAccordion } from "@/components/shared/FaqAccordion";
import { PackagePriceTable } from "@/components/shared/PackagePriceTable";
import { BookingCta } from "@/components/shared/BookingCta";
import { PhotoGallery } from "@/components/shared/PhotoGallery";
import { pageCtaCopy, pageCtaSlots } from "@/components/booking/pageCta";
import { DriveTimePicker } from "@/components/islands/DriveTimes";
import NotFound from "@/pages/NotFound";
import { cn } from "@/lib/utils";
import { pageBreadcrumbs, pageJsonLd } from "./pageSeo";
import { ISLAND_PAGES } from "./islandPages";

export function ContentPage() {
  const { pathname } = useLocation();
  const page = getPage(pathname);
  if (!page) return <NotFound />;

  // Pages hosting an interactive island (frontmatter `island:`) render through
  // their dedicated page component (client/pages/site/islandPages.ts).
  if (page.data.island) {
    const IslandPage = ISLAND_PAGES[page.data.island];
    return <IslandPage page={page} />;
  }

  const { data } = page;
  const hub = page.hub ? getHubPage(page.hub) : undefined;
  const siblings = page.hub ? getPagesUnderHub(page.hub).filter((p) => p.path !== page.path) : [];
  const slots = pageCtaSlots(page);
  const cta = pageCtaCopy(data.cta);
  const showSiblings = hub !== undefined && siblings.length > 0;
  const hasAside = slots.card || showSiblings;

  return (
    <article className="bg-ennis-dark">
      <Seo
        title={data.title}
        description={data.metaDescription}
        canonicalPath={data.canonicalPath}
        ogImage={data.ogImage}
        ogType={data.schemaType === "Article" ? "article" : "website"}
        noindex={data.noindex}
        jsonLd={pageJsonLd(page)}
      />

      <div className="container mx-auto max-w-6xl px-4 py-12">
        <Breadcrumbs items={pageBreadcrumbs(page)} className="mb-4" />

        <header className="mb-8 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-black text-white">{data.h1}</h1>
        </header>

        <div className={cn("grid gap-12", hasAside && "lg:grid-cols-[minmax(0,1fr)_300px]")}>
          <div className="min-w-0 max-w-3xl">
            {/* From lg the sidebar card is the above-the-fold CTA, so the strip is phone/tablet only there. */}
            {slots.strip && <BookingCta variant="strip" className={cn("mb-10", slots.card && "lg:hidden")} {...cta} />}

            <MarkdownBody>{page.body}</MarkdownBody>

            {data.widget === "DriveTimes" && <DriveTimePicker defaultOriginPath={page.path} className="my-12" />}
            {data.widget === "PhotoGallery" && <PhotoGallery className="my-12" />}

            {data.packagePrice && data.packagePrice.length > 0 && (
              // Service pages already carry the OfferCatalog in their Service JSON-LD (pageSeo.ts).
              <PackagePriceTable packages={data.packagePrice} withSchema={data.schemaType !== "Service"} />
            )}

            {slots.banner && <BookingCta variant="banner" className="my-12" {...cta} />}

            <PageFaq page={page} />
          </div>

          {hasAside && (
            // Sidebar from lg; below lg only the sibling nav shows (after the content).
            <div className={cn("min-w-0", !showSiblings && "hidden lg:block")}>
              <div className="space-y-8 lg:sticky lg:top-24">
                {slots.card && <BookingCta variant="card" className="hidden lg:block" {...cta} />}
                {showSiblings && hub && <SiblingNav hub={hub} siblings={siblings} />}
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

/** FAQ accordion (FAQPage schema) for pages with `faqs` frontmatter. */
export function PageFaq({ page }: { page: SitePage }) {
  const { faqs } = page.data;
  if (!faqs || faqs.length === 0) return null;
  return (
    <section className="my-12" aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="text-2xl md:text-3xl font-black text-white mb-6">
        Frequently Asked <span className="text-ennis-orange">Questions</span>
      </h2>
      <FaqAccordion faqs={faqs} withSchema />
    </section>
  );
}

/** Sidebar styling per breakpoint (Tailwind needs the full class names spelled out). */
const SIBLING_NAV_CLASSES = {
  lg: {
    nav: "lg:rounded-lg lg:border lg:bg-gray-900/60 lg:p-5",
    heading: "lg:text-xs lg:font-semibold lg:uppercase lg:tracking-widest lg:text-gray-400",
    list: "lg:grid-cols-1",
    link: "lg:py-1.5 lg:text-sm lg:font-semibold",
  },
  xl: {
    nav: "xl:rounded-lg xl:border xl:bg-gray-900/60 xl:p-5",
    heading: "xl:text-xs xl:font-semibold xl:uppercase xl:tracking-widest xl:text-gray-400",
    list: "xl:grid-cols-1",
    link: "xl:py-1.5 xl:text-sm xl:font-semibold",
  },
} as const;

/**
 * "More in <hub>" links. Two columns at the bottom of the page on phones and
 * tablets; a single compact column in the sidebar from `sidebarFrom` (lg).
 */
export function SiblingNav({
  hub,
  siblings,
  sidebarFrom = "lg",
}: {
  hub: SitePage;
  siblings: SitePage[];
  sidebarFrom?: "lg" | "xl";
}) {
  if (!siblings.length) return null;
  const label = getPageLabel(hub);
  const c = SIBLING_NAV_CLASSES[sidebarFrom];
  return (
    <nav aria-label={`More in ${label}`} className={cn("border-t border-gray-700 pt-8", c.nav)}>
      <h2 className={cn("text-xl font-bold text-white mb-3", c.heading)}>More in {label}</h2>
      <ul className={cn("grid sm:grid-cols-2", c.list)}>
        {siblings.map((s) => (
          <li key={s.path}>
            <Link
              to={s.path}
              className={cn("block py-2 text-gray-300 transition-colors hover:text-ennis-orange", c.link)}
            >
              {getPageLabel(s)}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default ContentPage;

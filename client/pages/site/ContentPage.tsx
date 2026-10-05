/**
 * Generic template for every markdown site page that is not a hub
 * (spokes, support pages). Reads the page for the current pathname from
 * client/lib/pages.ts and renders: breadcrumbs, H1, booking CTA strip,
 * markdown body, widget, PackagePriceTable (Offer schema), CTA banner,
 * FaqAccordion (FAQPage schema), "More in <hub>" sibling nav — plus a sticky
 * CTA card in a sidebar from lg. On /faq/ the questions come right after the
 * intro section. CTA placement rules: client/components/booking/pageCta.ts.
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
import { pageCtaCopy, pageCtaSlots, showBanner } from "@/components/booking/pageCta";
import { DriveTimePicker } from "@/components/islands/DriveTimes";
import NotFound from "@/pages/NotFound";
import { cn } from "@/lib/utils";
import { pageBreadcrumbs, pageJsonLd } from "./pageSeo";
import { ISLAND_PAGES } from "./islandPages";
import { splitAfterFirstSection } from "./IslandPageShell";

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
  const cta = pageCtaCopy(data.cta, page.path);
  const showSiblings = hub !== undefined && siblings.length > 0;
  // /faq/: the questions are the page — show them right after the intro section.
  const faqFirst = page.path === "/faq/";
  const [intro, rest] = faqFirst ? splitAfterFirstSection(page.body) : [page.body, ""];

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

      {/* Without a sidebar, narrow the frame so breadcrumbs, H1 and the reading column stay centred. */}
      <div className={cn("container mx-auto px-4 py-12", slots.card ? "max-w-6xl" : "max-w-[50rem]")}>
        <Breadcrumbs items={pageBreadcrumbs(page)} className="mb-4" />

        <header className="mb-8 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-black text-white">{data.h1}</h1>
        </header>

        <div className={cn("grid gap-12", slots.card && "lg:grid-cols-[minmax(0,1fr)_300px]")}>
          <div className="min-w-0 max-w-3xl">
            {/* From lg the sidebar card is the above-the-fold CTA, so the strip is phone/tablet only there. */}
            {slots.strip && <BookingCta variant="strip" className={cn("mb-10", slots.card && "lg:hidden")} {...cta} />}

            <MarkdownBody>{intro}</MarkdownBody>

            {faqFirst && <PageFaq page={page} heading="All questions" />}
            {rest && <MarkdownBody>{rest}</MarkdownBody>}

            {data.widget === "DriveTimes" && <DriveTimePicker defaultOriginPath={page.path} className="my-12" />}
            {data.widget === "PhotoGallery" && <PhotoGallery className="my-12" />}

            {data.packagePrice && data.packagePrice.length > 0 && (
              // Service pages already carry the OfferCatalog in their Service JSON-LD (pageSeo.ts).
              <PackagePriceTable packages={data.packagePrice} withSchema={data.schemaType !== "Service"} />
            )}

            {/* The sticky card is in view from lg, so the banner would repeat it there. */}
            {showBanner(slots, data) && (
              <BookingCta variant="banner" className={cn("my-12", slots.card && "lg:hidden")} {...cta} />
            )}

            {!faqFirst && <PageFaq page={page} />}

            {showSiblings && hub && <SiblingNav hub={hub} siblings={siblings} className="mt-12" />}
          </div>

          {slots.card && (
            <div className="hidden min-w-0 lg:block">
              <BookingCta variant="card" className="lg:sticky lg:top-24" {...cta} />
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

/** FAQ accordion (FAQPage schema) for pages with `faqs` frontmatter. */
export function PageFaq({ page, heading }: { page: SitePage; heading?: string }) {
  const { faqs } = page.data;
  if (!faqs || faqs.length === 0) return null;
  return (
    <section className="my-12" aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="text-2xl md:text-3xl font-black text-white mb-6">
        {heading ?? (
          <>
            Frequently Asked <span className="text-ennis-orange">Questions</span>
          </>
        )}
      </h2>
      <FaqAccordion faqs={faqs} withSchema />
    </section>
  );
}

/** "More in <hub>" links at the end of a page in the hub. */
export function SiblingNav({
  hub,
  siblings,
  className,
}: {
  hub: SitePage;
  siblings: SitePage[];
  className?: string;
}) {
  if (!siblings.length) return null;
  const label = getPageLabel(hub);
  return (
    <nav aria-label={`More in ${label}`} className={cn("border-t border-gray-700 pt-8", className)}>
      <h2 className="text-xl font-bold text-white mb-3">More in {label}</h2>
      <ul className="grid gap-x-6 sm:grid-cols-2">
        {siblings.map((s) => (
          <li key={s.path}>
            <Link to={s.path} className="block py-2 text-gray-300 transition-colors hover:text-ennis-orange">
              {getPageLabel(s)}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default ContentPage;

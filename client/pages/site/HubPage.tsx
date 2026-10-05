/**
 * Generic hub template for /slingshot-rental/, /bluebonnets/, /ennis/.
 * Renders the hub's markdown, an auto-generated spoke navigation from
 * getPagesUnderHub() (a horizontal chip rail under the header on phones and
 * tablets, a sidebar list from lg with a sticky booking card under it),
 * package table + FAQ when present, and the booking CTAs
 * (client/components/booking/pageCta.ts).
 */
import { Link, useLocation } from "react-router-dom";
import { getPage, getPageLabel, getPagesUnderHub } from "@/lib/pages";
import { Seo } from "@/components/seo/Seo";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { MarkdownBody } from "@/components/shared/MarkdownBody";
import { PackagePriceTable } from "@/components/shared/PackagePriceTable";
import { BookingCta } from "@/components/shared/BookingCta";
import { pageCtaCopy, pageCtaSlots } from "@/components/booking/pageCta";
import NotFound from "@/pages/NotFound";
import { BloomBadge } from "@/components/islands/BloomBadge";
import { PageFaq } from "./ContentPage";
import { pageBreadcrumbs, pageJsonLd } from "./pageSeo";

type Spokes = ReturnType<typeof getPagesUnderHub>;

export function HubPage() {
  const { pathname } = useLocation();
  const page = getPage(pathname);
  if (!page || !page.hub) return <NotFound />;

  const { data } = page;
  const spokes = getPagesUnderHub(page.hub);
  const title = getPageLabel(page);
  const slots = pageCtaSlots(page);
  const cta = pageCtaCopy(data.cta);

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
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4">{data.h1}</h1>
          <p className="text-gray-400 text-lg max-w-3xl">{data.metaDescription}</p>
          {page.hub === "bluebonnets" && <BloomBadge className="mt-4" />}
        </header>

        <HubSpokeChips title={title} spokes={spokes} />

        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="min-w-0 max-w-3xl">
            {slots.strip && <BookingCta variant="strip" className="mb-10" {...cta} />}

            <MarkdownBody>{page.body}</MarkdownBody>

            {data.packagePrice && data.packagePrice.length > 0 && (
              // Service hubs already carry the OfferCatalog in their Service JSON-LD (pageSeo.ts).
              <PackagePriceTable packages={data.packagePrice} withSchema={data.schemaType !== "Service"} />
            )}

            {slots.banner && <BookingCta variant="banner" className="my-12" {...cta} />}

            <PageFaq page={page} />
          </div>

          <div className="hidden min-w-0 lg:block">
            <HubSpokeNav title={title} spokes={spokes} />
            {slots.card && (
              <div className="mt-6 lg:sticky lg:top-24">
                <BookingCta variant="card" {...cta} />
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

/** Sidebar "In this guide" list (lg and up). */
export function HubSpokeNav({ title, spokes }: { title: string; spokes: Spokes }) {
  if (!spokes.length) return null;
  return (
    <nav aria-label={`${title} pages`} className="bg-gray-900/60 border border-gray-700 rounded-lg p-5">
      <p className="text-gray-400 uppercase tracking-widest text-xs font-semibold mb-2">In this guide</p>
      <ul className="space-y-0.5">
        {spokes.map((s) => (
          <li key={s.path}>
            <Link
              to={s.path}
              className="block py-1.5 text-gray-200 hover:text-ennis-orange transition-colors font-semibold"
            >
              {getPageLabel(s)}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Horizontally scrolling spoke links under the header on phones and tablets (below lg). */
export function HubSpokeChips({ title, spokes }: { title: string; spokes: Spokes }) {
  if (!spokes.length) return null;
  return (
    <nav aria-label={`${title} pages`} className="-mx-4 mb-8 overflow-x-auto px-4 pb-2 lg:hidden">
      <ul className="flex w-max gap-2">
        {spokes.map((s) => (
          <li key={s.path}>
            <Link
              to={s.path}
              className="inline-flex min-h-[44px] items-center whitespace-nowrap rounded-full border border-gray-700 bg-gray-900/60 px-4 text-sm font-semibold text-gray-200 transition-colors hover:border-ennis-orange hover:text-ennis-orange"
            >
              {getPageLabel(s)}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default HubPage;

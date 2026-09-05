/**
 * Generic hub (pillar) template for /slingshot-rental/, /bluebonnets/, /ennis/.
 * Renders the hub's markdown, an auto-generated spoke navigation from
 * getPagesUnderHub(), package table + FAQ when present, and the CTA.
 */
import { Link, useLocation } from "react-router-dom";
import { getPage, getPageLabel, getPagesUnderHub } from "@/lib/pages";
import { Seo } from "@/components/seo/Seo";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { MarkdownBody } from "@/components/shared/MarkdownBody";
import { FaqAccordion } from "@/components/shared/FaqAccordion";
import { PackagePriceTable } from "@/components/shared/PackagePriceTable";
import NotFound from "@/pages/NotFound";
import { CtaBanner } from "./ContentPage";
import { BloomBadge } from "@/components/islands/BloomBadge";
import { pageBreadcrumbs, pageJsonLd } from "./pageSeo";

export function HubPage() {
  const { pathname } = useLocation();
  const page = getPage(pathname);
  if (!page || !page.hub) return <NotFound />;

  const { data } = page;
  const spokes = getPagesUnderHub(page.hub);

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

      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <Breadcrumbs items={pageBreadcrumbs(page)} className="mb-6" />

        <header className="mb-10">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4">{data.h1}</h1>
          <p className="text-gray-400 text-lg max-w-3xl">{data.metaDescription}</p>
          {page.hub === "bluebonnets" && <BloomBadge className="mt-4" />}
        </header>

        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div>
            <MarkdownBody>{page.body}</MarkdownBody>

            {data.packagePrice && data.packagePrice.length > 0 && (
              <PackagePriceTable packages={data.packagePrice} />
            )}

            {data.faqs && data.faqs.length > 0 && (
              <section className="my-12" aria-labelledby="hub-faq-heading">
                <h2 id="hub-faq-heading" className="text-2xl md:text-3xl font-black text-white mb-6">
                  Frequently Asked <span className="text-ennis-orange">Questions</span>
                </h2>
                <FaqAccordion faqs={data.faqs} withSchema />
              </section>
            )}

            <CtaBanner />
          </div>

          <HubSpokeNav title={getPageLabel(page)} spokes={spokes} />
        </div>
      </div>
    </article>
  );
}

export function HubSpokeNav({
  title,
  spokes,
}: {
  title: string;
  spokes: ReturnType<typeof getPagesUnderHub>;
}) {
  if (!spokes.length) return null;
  return (
    <aside className="lg:sticky lg:top-24 self-start">
      <nav aria-label={`${title} pages`} className="bg-gray-900/60 border border-gray-700 rounded-lg p-6">
        <p className="text-gray-500 uppercase tracking-widest text-xs mb-4">In this guide</p>
        <ul className="space-y-3">
          {spokes.map((s) => (
            <li key={s.path}>
              <Link to={s.path} className="text-gray-200 hover:text-ennis-orange transition-colors font-semibold">
                {getPageLabel(s)}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

export default HubPage;

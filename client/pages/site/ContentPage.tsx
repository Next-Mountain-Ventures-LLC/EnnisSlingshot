/**
 * Generic template for every markdown site page that is not a hub
 * (spokes, support pages). Reads the page for the current pathname from
 * client/lib/pages.ts and renders: breadcrumbs, H1, markdown body,
 * PackagePriceTable (Offer schema), FaqAccordion (FAQPage schema), CTA.
 */
import { Link, useLocation } from "react-router-dom";
import { getHubPage, getPage, getPageLabel, getPagesUnderHub } from "@/lib/pages";
import { Seo } from "@/components/seo/Seo";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { MarkdownBody } from "@/components/shared/MarkdownBody";
import { FaqAccordion } from "@/components/shared/FaqAccordion";
import { PackagePriceTable } from "@/components/shared/PackagePriceTable";
import NotFound from "@/pages/NotFound";
import { pageBreadcrumbs, pageJsonLd } from "./pageSeo";
import { ISLAND_PAGES } from "./islandPages";
import { DriveTimePicker } from "@/components/islands/DriveTimes";

export function ContentPage() {
  const { pathname } = useLocation();
  const page = getPage(pathname);
  if (!page) return <NotFound />;

  // Pages hosting an interactive island (frontmatter `island:`) render through
  // their dedicated page component (client/pages/site/islandPages.ts).
  if (page.data.island && ISLAND_PAGES[page.data.island]) {
    const IslandPage = ISLAND_PAGES[page.data.island];
    return <IslandPage page={page} />;
  }

  const { data } = page;
  const hub = page.hub ? getHubPage(page.hub) : undefined;
  const siblings = page.hub ? getPagesUnderHub(page.hub).filter((p) => p.path !== page.path) : [];

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

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Breadcrumbs items={pageBreadcrumbs(page)} className="mb-6" />

        <header className="mb-10">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">{data.h1}</h1>
          {hub && (
            <p className="text-gray-400">
              Part of{" "}
              <Link to={hub.path} className="text-ennis-orange hover:text-ennis-orange-bright">
                {getPageLabel(hub)}
              </Link>
            </p>
          )}
        </header>

        <MarkdownBody>{page.body}</MarkdownBody>

        {data.widget === "DriveTimes" && <DriveTimePicker defaultOriginPath={page.path} className="my-12" />}

        {data.packagePrice && data.packagePrice.length > 0 && (
          <PackagePriceTable packages={data.packagePrice} />
        )}

        {data.faqs && data.faqs.length > 0 && (
          <section className="my-12" aria-labelledby="faq-heading">
            <h2 id="faq-heading" className="text-2xl md:text-3xl font-black text-white mb-6">
              Frequently Asked <span className="text-ennis-orange">Questions</span>
            </h2>
            <FaqAccordion faqs={data.faqs} withSchema />
          </section>
        )}

        {siblings.length > 0 && hub && (
          <nav aria-label={`More in ${getPageLabel(hub)}`} className="my-12 border-t border-gray-700 pt-8">
            <h2 className="text-xl font-bold text-white mb-4">More in {getPageLabel(hub)}</h2>
            <ul className="grid gap-2 sm:grid-cols-2">
              {siblings.map((s) => (
                <li key={s.path}>
                  <Link to={s.path} className="text-gray-300 hover:text-ennis-orange transition-colors">
                    {getPageLabel(s)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <CtaBanner />
      </div>
    </article>
  );
}

export function CtaBanner() {
  return (
    <div className="mt-12 bg-gradient-to-r from-ennis-orange/10 to-ennis-red/10 border border-ennis-orange/30 rounded-lg p-8 text-center">
      <h2 className="text-2xl md:text-3xl font-black text-white mb-3">
        Ready to <span className="text-ennis-orange">Ride</span>?
      </h2>
      <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
        Every experience starts at the Ennis Welcome Center, 201 NW Main St. Insurance included, no
        motorcycle license needed.
      </p>
      <Link
        to="/book/"
        className="inline-block px-8 py-4 bg-ennis-orange hover:bg-ennis-orange-bright text-ennis-dark font-bold text-lg rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
      >
        Book Your Experience
      </Link>
    </div>
  );
}

export default ContentPage;

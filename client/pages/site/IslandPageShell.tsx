/**
 * Shared layout for the four island pages (trail map, bloom tracker, weather,
 * events). Mirrors ContentPage — Seo, breadcrumbs, H1, markdown body, FAQ,
 * sibling nav, CTA — and adds two slots: `beforeBody` (islands the copy
 * refers to as "above") and `afterBody` (islands the copy calls "below").
 *
 * `embed` renders only the island: no breadcrumbs/body/FAQ/CTA, plus a
 * Helmet <style> that hides the site chrome SiteLayout renders around
 * <main> (Header, Contact footer, StickyBookBar) and a noindex robots tag.
 */
import type { ReactNode } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { getHubPage, getPageLabel, getPagesUnderHub, type SitePage } from "@/lib/pages";
import type { JsonLd } from "@/lib/schema";
import { Seo } from "@/components/seo/Seo";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { MarkdownBody } from "@/components/shared/MarkdownBody";
import { FaqAccordion } from "@/components/shared/FaqAccordion";
import { PackagePriceTable } from "@/components/shared/PackagePriceTable";
import { CtaBanner } from "./ContentPage";
import { pageBreadcrumbs, pageJsonLd } from "./pageSeo";

export interface IslandPageShellProps {
  page: SitePage;
  beforeBody?: ReactNode;
  afterBody?: ReactNode;
  /** Extra JSON-LD appended to the page's default stack (e.g. Event entities). */
  extraJsonLd?: JsonLd[];
  /** Chrome-less mode for `?embed=1` — only the island renders. */
  embed?: boolean;
}

export function IslandPageShell({ page, beforeBody, afterBody, extraJsonLd = [], embed = false }: IslandPageShellProps) {
  const { data } = page;
  const hub = page.hub ? getHubPage(page.hub) : undefined;
  const siblings = page.hub ? getPagesUnderHub(page.hub).filter((p) => p.path !== page.path) : [];
  const jsonLd = [...pageJsonLd(page), ...extraJsonLd];

  if (embed) {
    return (
      <article className="bg-ennis-dark min-h-screen">
        <Seo
          title={data.title}
          description={data.metaDescription}
          canonicalPath={data.canonicalPath}
          ogImage={data.ogImage}
          noindex
          jsonLd={jsonLd}
        />
        <Helmet>
          <style>{`div:has(> #main) > :not(#main){display:none !important}div:has(> #main){padding-bottom:0 !important}`}</style>
        </Helmet>
        <div className="p-3">
          {beforeBody}
          {afterBody}
          <p className="mt-3 text-xs text-gray-500">
            Map by{" "}
            <a href={data.canonicalPath} target="_blank" rel="noopener noreferrer" className="text-ennis-orange">
              Ennis Slingshot Experience
            </a>
            {" · "}
            <span className="text-gray-500">{data.h1}</span>
          </p>
        </div>
      </article>
    );
  }

  return (
    <article className="bg-ennis-dark">
      <Seo
        title={data.title}
        description={data.metaDescription}
        canonicalPath={data.canonicalPath}
        ogImage={data.ogImage}
        ogType={data.schemaType === "Article" ? "article" : "website"}
        noindex={data.noindex}
        jsonLd={jsonLd}
      />

      <div className="container mx-auto px-4 py-12 max-w-5xl">
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

        {beforeBody && <div className="mb-12">{beforeBody}</div>}

        <div className="max-w-4xl">
          <MarkdownBody>{page.body}</MarkdownBody>
        </div>

        {afterBody && <div className="my-12">{afterBody}</div>}

        <div className="max-w-4xl">
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
      </div>
    </article>
  );
}

export default IslandPageShell;

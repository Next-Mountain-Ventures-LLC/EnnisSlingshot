/**
 * Shared layout for the island pages (trail map, bloom tracker, weather,
 * events, /book/). Same frame as ContentPage — Seo, breadcrumbs, H1, booking
 * CTA strip, markdown body, price table, CTA banner, FAQ, sibling nav, and a
 * sidebar with a sticky CTA card from lg (xl with `sidebarFrom="xl"`) — plus
 * three island slots that share the content column's width:
 *
 *   beforeBody  islands the copy calls "above" (bloom tracker, forecast, scheduler)
 *   afterIntro  after the body's first "## " section (trail map, events list)
 *   afterBody   after the whole body
 *
 * Third-party embeds live on dedicated /embed/* routes, not here.
 */
import type { ReactNode } from "react";
import { getHubPage, getPagesUnderHub, type SitePage } from "@/lib/pages";
import type { JsonLd } from "@/lib/schema";
import { Seo } from "@/components/seo/Seo";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { MarkdownBody } from "@/components/shared/MarkdownBody";
import { PackagePriceTable } from "@/components/shared/PackagePriceTable";
import { BookingCta } from "@/components/shared/BookingCta";
import { pageCtaCopy, pageCtaSlots, showBanner } from "@/components/booking/pageCta";
import { cn } from "@/lib/utils";
import { PageFaq, SiblingNav } from "./ContentPage";
import { pageBreadcrumbs, pageJsonLd } from "./pageSeo";

export interface IslandPageShellProps {
  page: SitePage;
  /** Islands the copy refers to as "above" — rendered before the body. */
  beforeBody?: ReactNode;
  /** Rendered right after the body's first "## " section (the intro). */
  afterIntro?: ReactNode;
  /** Rendered after the whole body. */
  afterBody?: ReactNode;
  /** Extra JSON-LD appended to the page's default stack (e.g. Event entities). */
  extraJsonLd?: JsonLd[];
  /** Replaces the default sidebar (the CTA card); shown from the sidebar breakpoint only. */
  aside?: ReactNode;
  /**
   * Breakpoint where the sidebar appears (default lg, like ContentPage). Use
   * "xl" for wide islands (the trail map + its legend) so 1024–1279px screens
   * give the island the full column instead of squeezing it next to the sidebar.
   */
  sidebarFrom?: "lg" | "xl";
}

const SIDEBAR_CLASSES = {
  lg: { grid: "lg:grid-cols-[minmax(0,1fr)_300px]", show: "hidden lg:block", hide: "lg:hidden", sticky: "lg:sticky lg:top-24" },
  xl: { grid: "xl:grid-cols-[minmax(0,1fr)_300px]", show: "hidden xl:block", hide: "xl:hidden", sticky: "xl:sticky xl:top-24" },
} as const;

/**
 * Split a markdown body after its first "## " section:
 * "## A\n…\n## B\n…" → ["## A\n…", "## B\n…"]. Bodies with fewer than two
 * H2s come back whole (second part empty).
 */
export function splitAfterFirstSection(body: string): [string, string] {
  const headings = [...body.matchAll(/^## /gm)];
  if (headings.length < 2 || headings[1].index === undefined) return [body, ""];
  const cut = headings[1].index;
  return [body.slice(0, cut).trimEnd(), body.slice(cut)];
}

export function IslandPageShell({
  page,
  beforeBody,
  afterIntro,
  afterBody,
  extraJsonLd = [],
  aside,
  sidebarFrom = "lg",
}: IslandPageShellProps) {
  const sb = SIDEBAR_CLASSES[sidebarFrom];
  const { data } = page;
  const hub = page.hub ? getHubPage(page.hub) : undefined;
  const siblings = page.hub ? getPagesUnderHub(page.hub).filter((p) => p.path !== page.path) : [];
  const jsonLd = [...pageJsonLd(page), ...extraJsonLd];
  const slots = pageCtaSlots(page);
  const cta = pageCtaCopy(data.cta, page.path);
  const showSiblings = hub !== undefined && siblings.length > 0;
  const hasAside = Boolean(aside) || slots.card;
  // Where the sidebar CTA card is in view, the strip and banner would repeat it.
  const cardShown = slots.card && !aside;
  const [intro, rest] = afterIntro ? splitAfterFirstSection(page.body) : [page.body, ""];

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

      {/* Without a sidebar, narrow the frame so breadcrumbs, H1 and the reading column stay centred. */}
      <div className={cn("container mx-auto px-4 py-12", hasAside ? "max-w-6xl" : "max-w-[50rem]")}>
        <Breadcrumbs items={pageBreadcrumbs(page)} className="mb-4" />

        <header className="mb-8 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-black text-white">{data.h1}</h1>
        </header>

        <div className={cn("grid gap-12", hasAside && sb.grid)}>
          <div className="min-w-0 max-w-3xl">
            {slots.strip && (
              <BookingCta variant="strip" className={cn("mb-10", cardShown && sb.hide)} {...cta} />
            )}

            {beforeBody && <div className="mb-12">{beforeBody}</div>}

            <MarkdownBody>{intro}</MarkdownBody>

            {afterIntro && <div className="my-12">{afterIntro}</div>}

            {rest && <MarkdownBody>{rest}</MarkdownBody>}

            {afterBody && <div className="my-12">{afterBody}</div>}

            {data.packagePrice && data.packagePrice.length > 0 && (
              <PackagePriceTable packages={data.packagePrice} withSchema={data.schemaType !== "Service"} />
            )}

            {showBanner(slots, data) && (
              <BookingCta variant="banner" className={cn("my-12", cardShown && sb.hide)} {...cta} />
            )}

            <PageFaq page={page} />

            {showSiblings && hub && <SiblingNav hub={hub} siblings={siblings} className="mt-12" />}
          </div>

          {hasAside && (
            <div className={cn("min-w-0", sb.show)}>
              <div className={sb.sticky}>{aside ?? <BookingCta variant="card" {...cta} />}</div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export default IslandPageShell;

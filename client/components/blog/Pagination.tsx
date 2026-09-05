/**
 * Numbered pagination for blog indexes (12/page). Every page is a real,
 * prerendered URL (`/blog/page/2/`, `/blog/category/<slug>/page/2/`); the
 * `hrefFor` callback maps a page number to its path so page 1 stays at the
 * un-numbered canonical URL.
 */
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { absoluteUrl } from "@shared/business";

export interface PaginationProps {
  page: number;
  pageCount: number;
  hrefFor: (page: number) => string;
  className?: string;
}

function pageWindow(page: number, pageCount: number): Array<number | "…"> {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);
  const pages = new Set<number>([1, pageCount, page - 1, page, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= pageCount).sort((a, b) => a - b);
  const out: Array<number | "…"> = [];
  let prev = 0;
  for (const p of sorted) {
    if (p - prev > 1) out.push("…");
    out.push(p);
    prev = p;
  }
  return out;
}

export function Pagination({ page, pageCount, hrefFor, className = "" }: PaginationProps) {
  if (pageCount <= 1) return null;
  const prev = page > 1 ? hrefFor(page - 1) : undefined;
  const next = page < pageCount ? hrefFor(page + 1) : undefined;
  const linkBase = "inline-flex items-center justify-center min-w-10 h-10 px-3 rounded-lg border text-sm font-semibold transition-colors";

  return (
    <>
      {/* rel=prev/next hints for crawlers (harmless for Google, still used by Bing). */}
      <Helmet>
        {prev && <link rel="prev" href={absoluteUrl(prev)} />}
        {next && <link rel="next" href={absoluteUrl(next)} />}
      </Helmet>
      <nav aria-label="Pagination" className={`flex flex-wrap items-center justify-center gap-2 ${className}`}>
        {prev ? (
          <Link to={prev} rel="prev" className={`${linkBase} border-gray-700 text-gray-200 hover:border-ennis-orange hover:text-ennis-orange`}>
            ← Newer
          </Link>
        ) : (
          <span aria-disabled="true" className={`${linkBase} border-gray-800 text-gray-600`}>← Newer</span>
        )}
        {pageWindow(page, pageCount).map((p, i) =>
          p === "…" ? (
            <span key={`gap-${i}`} aria-hidden="true" className="px-1 text-gray-500">…</span>
          ) : p === page ? (
            <span key={p} aria-current="page" className={`${linkBase} border-ennis-orange bg-ennis-orange text-ennis-dark`}>
              {p}
            </span>
          ) : (
            <Link key={p} to={hrefFor(p)} className={`${linkBase} border-gray-700 text-gray-200 hover:border-ennis-orange hover:text-ennis-orange`} aria-label={`Page ${p}`}>
              {p}
            </Link>
          ),
        )}
        {next ? (
          <Link to={next} rel="next" className={`${linkBase} border-gray-700 text-gray-200 hover:border-ennis-orange hover:text-ennis-orange`}>
            Older →
          </Link>
        ) : (
          <span aria-disabled="true" className={`${linkBase} border-gray-800 text-gray-600`}>Older →</span>
        )}
      </nav>
    </>
  );
}

export default Pagination;

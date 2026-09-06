/**
 * Visible breadcrumb trail (Home › Hub › Page) + BreadcrumbList JSON-LD in one
 * component, so the two can never drift apart.
 */
import { Link } from "react-router-dom";
import { JsonLdScript } from "@/components/seo/Seo";
import { breadcrumbList, type BreadcrumbItem } from "@/lib/schema/breadcrumbList";

export type { BreadcrumbItem };

/** Normalize a trail so it always starts at Home (for the visible nav and the JSON-LD alike). */
export function breadcrumbTrail(items: BreadcrumbItem[]): BreadcrumbItem[] {
  return items[0]?.path === "/" ? items : [{ label: "Home", path: "/" }, ...items];
}

export function Breadcrumbs({
  items,
  className = "",
  withSchema = true,
}: {
  items: BreadcrumbItem[];
  className?: string;
  /** Set false when the page emits BreadcrumbList itself via <Seo jsonLd> (avoids a duplicate). */
  withSchema?: boolean;
}) {
  if (!items.length) return null;
  const trail = breadcrumbTrail(items);

  return (
    <>
      {withSchema && <JsonLdScript data={breadcrumbList(trail)} />}
      <nav aria-label="Breadcrumb" className={`text-sm text-gray-400 ${className}`}>
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {trail.map((item, i) => {
            const last = i === trail.length - 1;
            return (
              <li key={`${item.path ?? item.label}-${i}`} className="flex items-center gap-x-2">
                {item.path && !last ? (
                  <Link to={item.path} className="hover:text-ennis-orange transition-colors">
                    {item.label}
                  </Link>
                ) : (
                  <span aria-current={last ? "page" : undefined} className={last ? "text-gray-200" : ""}>
                    {item.label}
                  </span>
                )}
                {!last && <span aria-hidden="true" className="text-gray-600">›</span>}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}

export default Breadcrumbs;

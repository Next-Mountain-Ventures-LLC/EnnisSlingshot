/**
 * Package / price table for pages with `packagePrice[]` frontmatter.
 * Stacked cards below `sm`, a table from `sm` up. Emits Offer JSON-LD (via
 * OfferCatalog) for the rows that are real, bookable packages
 * (shared/booking.ts) unless the page's Service schema already carries them.
 */
import { Link } from "react-router-dom";
import type { PackagePrice } from "@shared/content/page-schema";
import { bookHref } from "@shared/booking";
import { JsonLdScript } from "@/components/seo/Seo";
import { matchBookablePackage, offerCatalog } from "@/lib/schema/service";
import { withContext } from "@/lib/schema/common";
import { cn } from "@/lib/utils";

export interface PackagePriceTableProps {
  packages: PackagePrice[];
  /** Where the "Book" buttons go when a row has no `url` and isn't a known package. */
  bookPath?: string;
  title?: string;
  withSchema?: boolean;
  className?: string;
}

function formatPrice(price: PackagePrice["price"]): string {
  if (typeof price === "number") {
    return Number.isInteger(price) ? `$${price}` : `$${price.toFixed(2)}`;
  }
  return price;
}

const bookButtonClass =
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg bg-ennis-orange px-4 py-2 text-sm font-bold text-ennis-dark transition-colors hover:bg-ennis-orange-bright focus:outline-none focus-visible:ring-2 focus-visible:ring-white";

function BookLink({ href, name, className }: { href: string; name: string; className?: string }) {
  const cls = cn(bookButtonClass, className);
  const label = `Book ${name}`;
  return /^https?:\/\//i.test(href) ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls} aria-label={label}>
      Book
    </a>
  ) : (
    <Link to={href} className={cls} aria-label={label}>
      Book
    </Link>
  );
}

export function PackagePriceTable({
  packages,
  bookPath = "/book/",
  title = "Packages & Pricing",
  withSchema = true,
  className = "",
}: PackagePriceTableProps) {
  if (!packages?.length) return null;

  const catalog = withSchema ? offerCatalog(packages) : undefined;
  const rows = packages.map((pkg) => {
    const match = matchBookablePackage(pkg);
    return { pkg, href: pkg.url || (match ? bookHref(match.id) : bookPath) };
  });

  return (
    <section className={cn("my-12", className)} aria-labelledby="package-price-heading">
      {catalog && <JsonLdScript data={withContext(catalog)} />}
      <h2 id="package-price-heading" className="text-2xl md:text-3xl font-black text-white mb-6">
        {title}
      </h2>

      {/* Phones: one card per package */}
      <ul className="space-y-3 sm:hidden">
        {rows.map(({ pkg, href }, i) => (
          <li key={i} className="rounded-lg border border-gray-700 bg-gray-900/60 p-4">
            <div className="flex items-start justify-between gap-4">
              <p className="min-w-0 font-bold text-white">{pkg.name}</p>
              <p className="shrink-0 whitespace-nowrap font-bold text-ennis-orange">{formatPrice(pkg.price)}</p>
            </div>
            {pkg.description && <p className="mt-1 text-sm text-gray-400">{pkg.description}</p>}
            <BookLink href={href} name={pkg.name} className="mt-4 w-full py-3" />
          </li>
        ))}
      </ul>

      {/* sm and up: table */}
      <div className="hidden overflow-x-auto rounded-lg border border-gray-700 bg-gray-900/60 sm:block">
        <table className="w-full text-left text-gray-300">
          <thead className="bg-gray-900 text-xs uppercase tracking-widest text-gray-400">
            <tr>
              <th scope="col" className="whitespace-nowrap px-3 py-3 md:px-6">Package</th>
              <th scope="col" className="whitespace-nowrap px-3 py-3 md:px-6">Price</th>
              <th scope="col" className="whitespace-nowrap px-3 py-3 text-right md:px-6">
                <span className="sr-only">Book</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ pkg, href }, i) => (
              <tr key={i} className="border-t border-gray-700">
                <td className="min-w-[10rem] px-3 py-4 md:px-6">
                  <div className="font-bold text-white">{pkg.name}</div>
                  {pkg.description && <div className="text-sm text-gray-400 mt-1">{pkg.description}</div>}
                </td>
                <td className="whitespace-nowrap px-3 py-4 font-bold text-ennis-orange md:px-6">
                  {formatPrice(pkg.price)}
                </td>
                <td className="px-3 py-4 text-right md:px-6">
                  <BookLink href={href} name={pkg.name} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-400 mt-3">All prices include comprehensive insurance and fuel. No deposit.</p>
    </section>
  );
}

export default PackagePriceTable;

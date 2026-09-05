/**
 * Package / price table for pages with `packagePrice[]` frontmatter.
 * Emits Offer JSON-LD (via OfferCatalog) so prices can surface as rich results.
 */
import { Link } from "react-router-dom";
import type { PackagePrice } from "@shared/content/page-schema";
import { JsonLdScript } from "@/components/seo/Seo";
import { offerCatalog } from "@/lib/schema";
import { withContext } from "@/lib/schema/common";

export interface PackagePriceTableProps {
  packages: PackagePrice[];
  /** Where the "Book" buttons go when a package has no `url`. */
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

export function PackagePriceTable({
  packages,
  bookPath = "/book/",
  title = "Packages & Pricing",
  withSchema = true,
  className = "",
}: PackagePriceTableProps) {
  if (!packages?.length) return null;

  return (
    <section className={`my-12 ${className}`} aria-labelledby="package-price-heading">
      {withSchema && <JsonLdScript data={withContext(offerCatalog(packages))} />}
      <h2 id="package-price-heading" className="text-2xl md:text-3xl font-black text-white mb-6">
        {title}
      </h2>
      <div className="overflow-x-auto rounded-lg border border-gray-700 bg-gray-900/60">
        <table className="w-full text-left text-gray-300">
          <thead className="bg-gray-900 text-xs uppercase tracking-widest text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">Package</th>
              <th scope="col" className="px-6 py-3">Price</th>
              <th scope="col" className="px-6 py-3 text-right">
                <span className="sr-only">Book</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {packages.map((pkg, i) => {
              const href = pkg.url || bookPath;
              const external = /^https?:\/\//i.test(href);
              return (
                <tr key={i} className="border-t border-gray-700">
                  <td className="px-6 py-4">
                    <div className="font-bold text-white">{pkg.name}</div>
                    {pkg.description && (
                      <div className="text-sm text-gray-400 mt-1">{pkg.description}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-ennis-orange font-bold whitespace-nowrap">
                    {formatPrice(pkg.price)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {external ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-4 py-2 bg-ennis-orange hover:bg-ennis-orange-bright text-ennis-dark font-bold rounded-lg transition-all text-sm"
                      >
                        Book
                      </a>
                    ) : (
                      <Link
                        to={href}
                        className="inline-block px-4 py-2 bg-ennis-orange hover:bg-ennis-orange-bright text-ennis-dark font-bold rounded-lg transition-all text-sm"
                      >
                        Book
                      </Link>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-500 mt-3">
        All prices include comprehensive insurance and fuel. No deposit.
      </p>
    </section>
  );
}

export default PackagePriceTable;

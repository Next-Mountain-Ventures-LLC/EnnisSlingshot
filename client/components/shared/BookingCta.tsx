/**
 * Booking call-to-action used across templates.
 *
 *   variant="banner"  after the page body (before the FAQ), full width of the content column
 *   variant="strip"   compact bar right under the page header on SEO landing pages
 *   variant="card"    stacked card for sidebars (content/hub/island asides, blog posts)
 *
 * Copy defaults sell the core April experience; pages override headline /
 * body / buttonLabel / href via frontmatter `cta` (shared/content/page-schema.ts,
 * see client/components/booking/pageCta.ts). Prices come from the bookable
 * package list (shared/booking.ts) so they can't drift.
 */
import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { PACKAGES, getPackage, packageFromQuery } from "@shared/booking";
import { cn } from "@/lib/utils";

export interface BookingCtaProps {
  variant?: "banner" | "strip" | "card";
  headline?: string;
  body?: string;
  buttonLabel?: string;
  href?: string;
  /** Secondary text link (defaults to the pricing page). Pass null to hide. */
  secondary?: { label: string; href: string } | null;
  className?: string;
}

export const CTA_DEFAULTS = {
  headline: "Drive the Bluebonnet Trails in a Slingshot",
  body: "Self-drive a Polaris Slingshot through the Ennis Bluebonnet Trails in April 2027. Insurance included, no motorcycle license needed — just a valid driver's license.",
  buttonLabel: "Book your experience",
  href: "/book/",
  secondary: { label: "See packages & pricing", href: "/slingshot-rental/pricing/" },
};

const SOLO = getPackage("solo").priceLabel;
const TWO_UP = getPackage("two-up").priceLabel;

/** Big price line for card/banner: the linked package's price, or the two 2-hour prices for generic CTAs. */
function PriceLine({ href, size }: { href: string; size: "card" | "banner" }) {
  const num = size === "card" ? "text-2xl font-black text-white" : "text-3xl font-black text-white";
  if (/^mailto:/i.test(href)) return null;
  const query = href.split("?")[1];
  const pkg = query ? packageFromQuery(new URLSearchParams(query).get("package")) : null;
  if (pkg === "drive-and-go") {
    return (
      <>
        <span className={num}>{getPackage("drive-and-go").priceLabel}</span> · 1 hour
      </>
    );
  }
  if (pkg === "solo") {
    return (
      <>
        <span className={num}>{SOLO}</span> solo · 2 hours
      </>
    );
  }
  if (pkg === "two-up") {
    return (
      <>
        <span className={num}>{TWO_UP}</span> for two · 2 hours
      </>
    );
  }
  return (
    <>
      <span className={num}>{SOLO}</span> solo · <span className={num}>{TWO_UP}</span> for two
    </>
  );
}
const FROM = PACKAGES.reduce((min, p) => (p.price < min.price ? p : min), PACKAGES[0]).priceLabel;

const TRUST = ["Insurance included", "No motorcycle license", "Meet at the Ennis Welcome Center"];

/** Sub-line for the strip: the linked package's price, or the "from" price for generic /book/ links. */
function stripNote(href: string): string | null {
  if (/^mailto:/i.test(href)) return "Order by email";
  const query = href.split("?")[1];
  const pkg = query ? packageFromQuery(new URLSearchParams(query).get("package")) : null;
  if (!pkg) return `From ${FROM} · insurance included`;
  const qualifier = pkg === "two-up" ? " for two" : pkg === "solo" ? " solo" : " for 1 hour";
  return `${getPackage(pkg).priceLabel}${qualifier} · insurance included`;
}

function CtaLink({ href, className, children }: { href: string; className: string; children: React.ReactNode }) {
  if (/^mailto:/i.test(href)) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }
  return /^https?:\/\//i.test(href) ? (
    <a href={href} className={className} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ) : (
    <Link to={href} className={className}>
      {children}
    </Link>
  );
}

export function BookingCta({
  variant = "banner",
  headline = CTA_DEFAULTS.headline,
  body = CTA_DEFAULTS.body,
  buttonLabel = CTA_DEFAULTS.buttonLabel,
  href = CTA_DEFAULTS.href,
  secondary = CTA_DEFAULTS.secondary,
  className,
}: BookingCtaProps) {
  if (variant === "strip") {
    return (
      <aside
        aria-label="Book a Slingshot experience"
        className={cn(
          "flex flex-col gap-1 rounded-lg border border-ennis-orange/30 bg-ennis-orange/10 px-4 py-3 md:flex-row md:items-center md:justify-between md:gap-4",
          className,
        )}
      >
        <p className="text-sm text-gray-200 md:text-base">
          <span className="font-bold text-white">{headline}</span>
          <span className="block text-gray-400 sm:inline sm:before:content-['_·_']">{stripNote(href)}</span>
        </p>
        {/* Phones already have the sticky Book bar, so the strip uses a text link there and a button from md. */}
        <CtaLink
          href={href}
          className="inline-flex min-h-[44px] shrink-0 items-center gap-1.5 self-start rounded-lg text-sm font-bold text-ennis-orange underline underline-offset-4 transition-colors hover:text-ennis-orange-bright focus:outline-none focus-visible:ring-2 focus-visible:ring-white md:min-h-0 md:self-auto md:whitespace-nowrap md:bg-ennis-orange md:px-4 md:py-2 md:text-ennis-dark md:no-underline md:shadow-lg md:hover:bg-ennis-orange-bright md:hover:text-ennis-dark"
        >
          {buttonLabel} <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </CtaLink>
      </aside>
    );
  }

  if (variant === "card") {
    return (
      <aside
        aria-label="Book a Slingshot experience"
        className={cn("rounded-lg border border-ennis-orange/30 bg-gradient-to-b from-ennis-orange/10 to-transparent p-5", className)}
      >
        <p className="text-xs font-bold uppercase tracking-widest text-ennis-orange mb-2">April 2027 season</p>
        <h2 className="text-xl font-black text-white tracking-tight mb-2">{headline}</h2>
        <p className="text-sm text-gray-300 leading-relaxed mb-4">{body}</p>
        <p className="text-sm text-gray-200 mb-4 empty:hidden">
          <PriceLine href={href} size="card" />
        </p>
        <CtaLink href={href} className="btn-primary w-full whitespace-normal text-center">
          {buttonLabel}
        </CtaLink>
        {secondary && (
          <Link
            to={secondary.href}
            className="mt-2 block py-2 text-center text-sm text-gray-400 hover:text-ennis-orange"
          >
            {secondary.label}
          </Link>
        )}
      </aside>
    );
  }

  return (
    <section
      aria-label="Book a Slingshot experience"
      className={cn(
        "rounded-xl border border-ennis-orange/30 bg-gradient-to-br from-ennis-orange/15 via-ennis-dark to-ennis-navy/30 p-6 sm:p-8 md:p-10",
        className,
      )}
    >
      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-3">{headline}</h2>
          <p className="text-gray-300 leading-relaxed mb-4 max-w-2xl">{body}</p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-300">
            {TRUST.map((t) => (
              <li key={t} className="inline-flex items-center gap-1.5">
                <Check className="h-4 w-4 text-ennis-orange" aria-hidden="true" />
                {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col items-stretch gap-3 md:items-end md:text-right">
          <p className="text-gray-300 empty:hidden">
            <PriceLine href={href} size="banner" />
          </p>
          <CtaLink href={href} className="btn-primary whitespace-normal text-center sm:text-lg">
            {buttonLabel} <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </CtaLink>
          {secondary && (
            <Link to={secondary.href} className="py-1 text-center text-sm text-gray-400 hover:text-ennis-orange md:text-right">
              {secondary.label}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

export default BookingCta;

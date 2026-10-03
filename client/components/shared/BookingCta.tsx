/**
 * Booking call-to-action used across templates.
 *
 *   variant="banner"  end-of-content block (full width of the content column)
 *   variant="strip"   compact one-line bar near the top of SEO landing pages
 *   variant="card"    stacked card for sidebars (blog posts, hubs)
 *
 * Copy defaults sell the core April experience; pages can override headline /
 * body / button via frontmatter `cta` (shared/content/page-schema.ts).
 * Prices come from the facts that never drift: $79 solo, $149 driver + rider.
 */
import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BookingCtaProps {
  variant?: "banner" | "strip" | "card";
  headline?: string;
  body?: string;
  buttonLabel?: string;
  href?: string;
  /** Secondary text link (defaults to the packages hub). Pass null to hide. */
  secondary?: { label: string; href: string } | null;
  className?: string;
}

export const CTA_DEFAULTS = {
  headline: "Drive the Bluebonnet Trails in a Slingshot",
  body: "Self-drive a Polaris Slingshot through the Ennis Bluebonnet Trails this April. Insurance included, no motorcycle license needed — just a valid driver's license.",
  buttonLabel: "Book your experience",
  href: "/book/",
  secondary: { label: "See packages & pricing", href: "/slingshot-rental/pricing/" },
};

const TRUST = ["Insurance included", "No motorcycle license", "Meet at the Ennis Welcome Center"];

function CtaLink({ href, className, children }: { href: string; className: string; children: React.ReactNode }) {
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

const primaryClass =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-ennis-orange px-6 py-3 font-bold text-ennis-dark shadow-lg transition-colors hover:bg-ennis-orange-bright focus:outline-none focus-visible:ring-2 focus-visible:ring-white";

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
          "flex flex-col gap-3 rounded-lg border border-ennis-orange/30 bg-ennis-orange/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
          className,
        )}
      >
        <p className="text-sm text-gray-200 sm:text-base">
          <span className="font-bold text-white">{headline}</span>
          <span className="block text-gray-400 sm:inline sm:before:content-['_·_']">From $79 · insurance included</span>
        </p>
        <CtaLink href={href} className={cn(primaryClass, "shrink-0 px-4 py-2 text-sm")}>
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
        <p className="text-sm text-gray-200 mb-4">
          <span className="text-2xl font-black text-white">$79</span> solo ·{" "}
          <span className="text-2xl font-black text-white">$149</span> for two
        </p>
        <CtaLink href={href} className={cn(primaryClass, "w-full")}>
          {buttonLabel}
        </CtaLink>
        {secondary && (
          <Link to={secondary.href} className="mt-3 block text-center text-sm text-gray-400 hover:text-ennis-orange">
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
          <p className="text-gray-300">
            <span className="text-3xl font-black text-white">$79</span> solo ·{" "}
            <span className="text-3xl font-black text-white">$149</span> for two
          </p>
          <CtaLink href={href} className={cn(primaryClass, "text-lg")}>
            {buttonLabel} <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </CtaLink>
          {secondary && (
            <Link to={secondary.href} className="text-sm text-gray-400 hover:text-ennis-orange">
              {secondary.label}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

export default BookingCta;

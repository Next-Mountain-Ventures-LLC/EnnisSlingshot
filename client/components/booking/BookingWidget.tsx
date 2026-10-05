/**
 * Package picker + Acuity scheduler — the one booking flow on the site (home
 * #booking-header and /book/). Driven by the bookable packages in
 * shared/booking.ts: pick Solo / Driver + Rider / Drive & Go, review what's
 * included, then "Continue to booking" swaps the card for that package's
 * Acuity iframe (with a Back button).
 *
 * SSR-safe: render never touches window/document, so the prerendered HTML
 * contains the picker. `?package=<id>` (bookHref()) is read AFTER mount —
 * prerendered pages have no query string, and reading it during render would
 * break hydration — and only preselects; it never opens the scheduler.
 */
import { useEffect, useId, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { ArrowLeft, Check, Clock, ExternalLink, Headphones, Users } from "lucide-react";
import {
  DEFAULT_PACKAGE,
  PACKAGES,
  acuitySchedulerUrl,
  getPackage,
  packageFromQuery,
  type BookablePackage,
  type PackageId,
} from "@shared/booking";
import { business } from "@shared/business";
import { TRAILS_2027 } from "@shared/season";
import { trackPixel } from "@/lib/consent";
import { cn } from "@/lib/utils";

export const ACUITY_EMBED_SCRIPT = "https://embed.acuityscheduling.com/js/embed.js";

/** Add Acuity's embed.js (iframe auto-resize) once per page, however often the scheduler opens. */
export function loadAcuityEmbedScript(doc: Document = document): void {
  if (doc.querySelector(`script[src="${ACUITY_EMBED_SCRIPT}"]`)) return;
  const script = doc.createElement("script");
  script.src = ACUITY_EMBED_SCRIPT;
  script.async = true;
  doc.body.appendChild(script);
}

/** "Bluebonnet Trail Experience" for "Bluebonnet Trail Experience — Solo"; null for "Drive & Go". */
function packageSeries(pkg: BookablePackage): string | null {
  const suffix = ` — ${pkg.shortName}`;
  return pkg.name.endsWith(suffix) ? pkg.name.slice(0, -suffix.length) : null;
}

function includedItems(pkg: BookablePackage): string[] {
  const items = [`Polaris Slingshot self-drive experience (${pkg.duration})`, "All fuel included", "Comprehensive insurance coverage"];
  if (pkg.duration.startsWith("2 hour")) items.push("Bluebonnet Trail map in your glove box");
  return items;
}

/** Two solo rides would cost 2 × Solo; Driver + Rider shows the difference. */
const SOLO_PRICE = getPackage("solo").price;

export interface BookingWidgetProps {
  /** Package selected on first render (before any ?package= is read). */
  initialPackage?: PackageId;
  /** Preselect from ?package= after mount (default true). */
  syncWithQuery?: boolean;
  /** id of the card (scroll target). */
  id?: string;
  className?: string;
}

export function BookingWidget({
  initialPackage = DEFAULT_PACKAGE,
  syncWithQuery = true,
  id = "acuity-scheduler",
  className,
}: BookingWidgetProps) {
  const [selectedId, setSelectedId] = useState<PackageId>(initialPackage);
  const [showScheduler, setShowScheduler] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLButtonElement>(null);
  const groupName = useId();

  const { search } = useLocation();
  const queried = syncWithQuery ? packageFromQuery(new URLSearchParams(search).get("package")) : null;

  // Deep link (/book/?package=two-up): preselect after mount, keep the picker open.
  useEffect(() => {
    if (!queried) return;
    setSelectedId(queried);
    setShowScheduler(false);
  }, [queried]);

  useEffect(() => {
    if (showScheduler) loadAcuityEmbedScript();
  }, [showScheduler]);

  const pkg = getPackage(selectedId);

  const scrollToTop = () => {
    const el = rootRef.current;
    if (!el) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  };

  const handleContinue = () => {
    // Meta Pixel InitiateCheckout — only sent with marketing consent (client/lib/consent.ts).
    trackPixel("InitiateCheckout", { content_name: pkg.name, value: pkg.price, currency: "USD" });
    if (typeof window.gtag === "function") {
      window.gtag("event", "begin_checkout", {
        currency: "USD",
        value: pkg.price,
        items: [{ item_id: pkg.id, item_name: pkg.name, price: pkg.price, quantity: 1 }],
      });
    }
    setShowScheduler(true);
    window.setTimeout(() => {
      backRef.current?.focus({ preventScroll: true });
      scrollToTop();
    }, 50);
  };

  const handleBack = () => {
    setShowScheduler(false);
    window.setTimeout(() => {
      rootRef.current?.querySelector<HTMLInputElement>("input[type=radio]:checked")?.focus({ preventScroll: true });
      scrollToTop();
    }, 50);
  };

  return (
    <div
      ref={rootRef}
      id={id}
      className={cn("scroll-mt-4 rounded-lg border border-gray-700 bg-gray-900/60 p-4 sm:p-8", className)}
    >
      {!showScheduler ? (
        <>
          <fieldset>
            <legend className="mb-1 text-lg font-bold text-white">Choose your experience</legend>
            <p className="mb-4 text-sm text-gray-400">
              Season: {TRAILS_2027.label} · every ride starts at the {business.meetingPoint.name}
            </p>
            <div className="space-y-3">
              {PACKAGES.map((p) => {
                const checked = p.id === selectedId;
                const pSeries = packageSeries(p);
                return (
                  <label
                    key={p.id}
                    className={cn(
                      "flex min-h-[44px] cursor-pointer items-start justify-between gap-4 rounded-lg border p-4 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ennis-orange has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-gray-900",
                      checked ? "border-ennis-orange bg-ennis-orange/10" : "border-gray-700 hover:border-ennis-orange/50",
                    )}
                  >
                    <input
                      type="radio"
                      name={groupName}
                      value={p.id}
                      checked={checked}
                      onChange={() => setSelectedId(p.id)}
                      className="sr-only"
                    />
                    <span className="flex min-w-0 items-start gap-3">
                      <span
                        aria-hidden="true"
                        className={cn(
                          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                          checked ? "border-ennis-orange" : "border-gray-500",
                        )}
                      >
                        {checked && <span className="h-2.5 w-2.5 rounded-full bg-ennis-orange" />}
                      </span>
                      <span className="min-w-0">
                        <span className="block font-bold text-white">{p.shortName}</span>
                        <span className="block text-sm text-gray-400">
                          {pSeries ? `${pSeries} · ` : ""}
                          {p.duration} · {p.riders}
                        </span>
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block whitespace-nowrap font-bold text-ennis-orange">{p.priceLabel}</span>
                      {p.id === "two-up" && (
                        <span className="mt-1 flex items-center justify-end gap-2">
                          <span className="hidden text-xs text-gray-400 line-through sm:inline">${SOLO_PRICE * 2}</span>
                          <span className="whitespace-nowrap rounded border border-ennis-orange bg-ennis-orange/20 px-2 py-0.5 text-xs font-semibold text-ennis-orange">
                            Save ${SOLO_PRICE * 2 - p.price}
                          </span>
                        </span>
                      )}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          {/* Selected package details */}
          <dl className="mt-6 grid grid-cols-2 gap-4 rounded-lg border border-ennis-orange/30 bg-ennis-orange/10 p-4 text-sm">
            <div className="flex items-start gap-2">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-ennis-orange" aria-hidden="true" />
              <div>
                <dt className="text-gray-400">Duration</dt>
                <dd className="font-bold text-white">{pkg.duration}</dd>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Users className="mt-0.5 h-4 w-4 shrink-0 text-ennis-orange" aria-hidden="true" />
              <div>
                <dt className="text-gray-400">Who rides</dt>
                <dd className="font-bold text-white">{pkg.riders}</dd>
              </div>
            </div>
          </dl>

          <div className="mt-6">
            <p className="mb-3 font-bold text-white">What's included</p>
            <ul className="space-y-2 text-sm text-gray-300">
              {includedItems(pkg).map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-ennis-orange" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 flex items-start gap-2 rounded-lg border border-gray-700 bg-gray-800/50 p-3 text-sm text-gray-300">
              <Headphones className="mt-0.5 h-4 w-4 shrink-0 text-ennis-orange" aria-hidden="true" />
              <span>Bluetooth communication helmets available as an add-on.</span>
            </p>
          </div>

          <div className="mt-6 border-t border-gray-700 pt-4">
            <div className="flex items-baseline justify-between gap-4 text-lg font-bold text-white">
              <span>Total</span>
              <span className="text-ennis-orange">{pkg.priceLabel}</span>
            </div>
            <p className="mt-1 text-sm text-gray-400">{pkg.name}</p>
            <p className="mt-3 text-sm text-gray-400">
              Free rescheduling up to 7 days before your ride · No deposit · Insurance included
            </p>
          </div>

          <button
            type="button"
            onClick={handleContinue}
            className="btn-primary btn-lg mt-6 w-full"
          >
            Continue to booking
          </button>

          <p className="mt-6 rounded-lg border border-blue-500/30 bg-blue-900/20 p-4 text-sm leading-relaxed text-blue-200">
            <strong>Good to know:</strong> All drivers must be approved by our insurance company. A verification link
            will be sent to your email after booking. If approval is not granted, your booking will be fully refunded.
          </p>
        </>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <button ref={backRef} type="button" onClick={handleBack} className="btn-secondary min-h-[44px] px-4 py-2 text-sm">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Change package
            </button>
            <p className="text-sm text-gray-300">
              <span className="font-bold text-white">{pkg.name}</span> · {pkg.priceLabel}
            </p>
          </div>

          {/* Full card width on phones: bleed through the card's p-4 padding. */}
          <div className="-mx-4 overflow-hidden bg-gray-800/50 sm:mx-0 sm:rounded-lg">
            <iframe
              key={pkg.id}
              src={acuitySchedulerUrl(pkg.id)}
              title={`Book ${pkg.name}`}
              width="100%"
              height="800"
              allow="payment"
              className="block w-full border-0"
            />
          </div>

          <p className="mt-4 text-center text-sm text-gray-400">
            Calendar not loading?{" "}
            <a
              href={`${business.booking.acuityUrl}?appointmentType=${pkg.appointmentType}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-ennis-orange underline underline-offset-4 hover:text-ennis-orange-bright"
            >
              Open it in a new tab
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </p>
        </>
      )}
    </div>
  );
}

export default BookingWidget;

/**
 * Cookie / tracking consent banner (Google Consent Mode v2 + Meta Pixel).
 *
 * Renders nothing on the server and nothing once the visitor has answered
 * (choice persisted in localStorage "ennis-consent"); the inline script in
 * index.html applies the stored choice before the tags load on later visits.
 * Accept → gtag consent update all "granted" + fbq('consent','grant');
 * Reject → all "denied" + fbq('consent','revoke'). Can be re-opened with
 * openConsentBanner() (client/lib/consent.ts).
 */
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { applyConsent, readConsent, CONSENT_OPEN_EVENT } from "@/lib/consent";
import { isBookPath } from "@/components/layout/StickyBookBar";

export function ConsentBanner() {
  const [open, setOpen] = useState(false);
  const acceptRef = useRef<HTMLButtonElement>(null);
  const { pathname } = useLocation();
  // Phones: sit just above the fixed StickyBookBar (≈73px + safe area) — except on /book/, which has no bar.
  const mobileBottom = isBookPath(pathname) ? "bottom-3" : "bottom-[calc(4.75rem+env(safe-area-inset-bottom))]";

  useEffect(() => {
    if (readConsent() === null) setOpen(true);
    const reopen = () => setOpen(true);
    window.addEventListener(CONSENT_OPEN_EVENT, reopen);
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, reopen);
  }, []);

  useEffect(() => {
    if (open) acceptRef.current?.focus({ preventScroll: true });
  }, [open]);

  if (!open) return null;

  const choose = (choice: "granted" | "denied") => {
    applyConsent(choice);
    setOpen(false);
  };

  return (
    <section
      role="region"
      aria-label="Cookie and tracking consent"
      aria-live="polite"
      className={`fixed inset-x-0 ${mobileBottom} md:bottom-4 z-50 px-3 md:px-4 print:hidden`}
    >
      <div className="mx-auto max-w-3xl rounded-lg border border-gray-700 bg-ennis-dark/95 backdrop-blur-sm shadow-2xl p-3 md:p-5 flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
        <p id="consent-text" className="text-xs md:text-sm text-gray-300 leading-relaxed flex-1">
          We use Google Analytics and the Meta Pixel to understand how visitors use this site and to measure our ads.
          Accept to allow those cookies, or reject to keep them off. See our{" "}
          <Link to="/privacy/" className="text-ennis-orange hover:text-ennis-orange-bright underline">
            privacy policy
          </Link>
          .
        </p>
        <div className="flex gap-2 md:shrink-0">
          <button
            type="button"
            onClick={() => choose("denied")}
            className="flex-1 md:flex-none px-4 py-2 rounded-lg border border-gray-600 text-gray-200 hover:border-ennis-orange hover:text-ennis-orange text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ennis-orange"
          >
            Reject
          </button>
          <button
            ref={acceptRef}
            type="button"
            onClick={() => choose("granted")}
            aria-describedby="consent-text"
            className="flex-1 md:flex-none px-4 py-2 rounded-lg bg-ennis-orange hover:bg-ennis-orange-bright text-ennis-dark text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Accept
          </button>
        </div>
      </div>
    </section>
  );
}

export default ConsentBanner;

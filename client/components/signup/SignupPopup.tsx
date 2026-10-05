/**
 * Mailing-list popup (two-step SignupForm in a Radix Dialog).
 *
 * When it opens — whichever comes first, at most once per browser session:
 *   • 15 s of time on site (counted across page views in the session),
 *   • exit intent on desktop (pointer leaves through the top) after 5 s,
 *   • 50 % scroll depth after 8 s.
 * Never on /book/, while a booking scheduler is open or the home booking card
 * is on screen, while a field has focus, in ?embed=1 widgets, or on a 404 page;
 * it waits for the cookie banner to be answered (up to a minute) so visitors
 * don't get two interruptions at once. Not again for 7 days after a dismissal; never after someone has
 * finished. People who gave an email but not a phone get one phone-step
 * reminder after 3 days unless they chose "email is fine".
 *
 * Mobile renders as a bottom sheet (doesn't cover the whole page), desktop as
 * a centered dialog.
 */
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Flower2, X } from "lucide-react";
import { SignupForm } from "./SignupForm";
import { dismissSignupPopup, readSignup, type SignupState } from "@/lib/signup";
import { CONSENT_CHANGE_EVENT, readConsent } from "@/lib/consent";

const DAY = 24 * 60 * 60 * 1000;
const SESSION_START_KEY = "ennis-session-start";
const SESSION_SHOWN_KEY = "ennis-signup-popup-shown";
const DELAY_MS = 15_000;
const EXIT_INTENT_MIN_MS = 5_000;
const SCROLL_MIN_MS = 8_000;
/** Stop waiting on an unanswered cookie banner after this much time on site. */
const CONSENT_WAIT_MAX_MS = 60_000;
/** After the cookie banner is answered, give people a moment before the popup. */
const AFTER_CONSENT_MS = 4_000;

/** In-memory fallback for browsers that block sessionStorage (state survives in-app navigation). */
const memorySession: Record<string, string> = {};

function session(key: string, value?: string): string | null {
  if (value !== undefined) memorySession[key] = value;
  try {
    if (value !== undefined) window.sessionStorage.setItem(key, value);
    return window.sessionStorage.getItem(key) ?? memorySession[key] ?? null;
  } catch {
    return memorySession[key] ?? null;
  }
}

/**
 * Don't interrupt: no popup while a booking scheduler is open or the booking
 * card is on screen (picking a package scrolls the page), while the visitor is
 * typing in a field, on a 404 page (NotFound renders data-not-found), or while
 * the cookie banner is still waiting for an answer (until `elapsedMs` passes
 * CONSENT_WAIT_MAX_MS).
 */
function busyElsewhere(elapsedMs: number): boolean {
  if (document.querySelector('iframe[src*="acuityscheduling.com"], [data-not-found]')) return true;
  // No stored choice yet (the banner may not have mounted yet) or the banner reopened via "Cookie settings".
  const consentPending = readConsent() === null || !!document.querySelector("[data-consent-banner]");
  if (consentPending && elapsedMs < CONSENT_WAIT_MAX_MS) return true;
  const card = document.getElementById("acuity-scheduler");
  if (card) {
    const r = card.getBoundingClientRect();
    if (r.bottom > 0 && r.top < window.innerHeight) return true;
  }
  const active = document.activeElement;
  return !!active && /^(INPUT|TEXTAREA|SELECT|IFRAME)$/.test(active.tagName);
}

export function shouldOfferPopup(state: SignupState, now = Date.now()): boolean {
  if (state.stage === "complete") return false;
  if (state.dismissedAt && now - state.dismissedAt < 7 * DAY) return false;
  if (state.stage === "email") {
    if (state.phoneSkippedAt) return false;
    if (state.emailAt && now - state.emailAt < 3 * DAY) return false;
  }
  return true;
}

function excludedPath(pathname: string, search: string): boolean {
  return /^\/(book|404)(\/|$)/.test(pathname) || new URLSearchParams(search).get("embed") === "1";
}

export function SignupPopup() {
  const { pathname, search } = useLocation();
  const [open, setOpen] = useState(false);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (open || excludedPath(pathname, search)) return;
    if (session(SESSION_SHOWN_KEY) === "1") return;
    if (!shouldOfferPopup(readSignup())) return;

    const start = Number(session(SESSION_START_KEY)) || Number(session(SESSION_START_KEY, String(Date.now())));
    const elapsed = () => Date.now() - start;
    let done = false;
    let timer = 0;
    const show = () => {
      if (done) return;
      // Busy (checkout open, typing, cookie banner, 404): try again a bit later instead of interrupting.
      if (busyElsewhere(elapsed())) {
        window.clearTimeout(timer);
        timer = window.setTimeout(show, 20_000);
        return;
      }
      done = true;
      cleanup();
      // Re-check: another form on the page may have finished meanwhile.
      if (!shouldOfferPopup(readSignup()) || session(SESSION_SHOWN_KEY) === "1") return;
      session(SESSION_SHOWN_KEY, "1");
      setOpen(true);
    };

    timer = window.setTimeout(show, Math.max(0, DELAY_MS - elapsed()));
    const onExit = (e: MouseEvent) => {
      if (!e.relatedTarget && e.clientY <= 0 && elapsed() >= EXIT_INTENT_MIN_MS) show();
    };
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max > 0 && window.scrollY / max >= 0.5 && elapsed() >= SCROLL_MIN_MS) show();
    };
    // Cookie banner answered: don't make them wait for the next 20 s retry.
    const onConsent = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(show, Math.max(AFTER_CONSENT_MS, DELAY_MS - elapsed()));
    };
    const finePointer = window.matchMedia?.("(pointer: fine)").matches;
    if (finePointer) document.addEventListener("mouseout", onExit);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener(CONSENT_CHANGE_EVENT, onConsent);
    function cleanup() {
      window.clearTimeout(timer);
      document.removeEventListener("mouseout", onExit);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener(CONSENT_CHANGE_EVENT, onConsent);
    }
    return cleanup;
  }, [pathname, search, open]);

  // If the page changes underneath (e.g. a link), close quietly — that's not a dismissal.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const onOpenChange = (next: boolean) => {
    if (!next && !finished) dismissSignupPopup();
    setOpen(next);
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          // Mouse/trackpad: start in the first field. Touch: don't pop the keyboard up
          // uninvited — focus the dialog itself (Radix would pick the Close button).
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            const el = e.currentTarget as HTMLElement;
            const first = el.querySelector<HTMLInputElement>("input:not([tabindex='-1'])");
            if (first && window.matchMedia?.("(pointer: fine)").matches) first.focus();
            else el.focus();
          }}
          className={[
            "fixed z-[61] overflow-y-auto overscroll-contain border border-gray-700 bg-ennis-dark text-left shadow-2xl focus:outline-none",
            // mobile: bottom sheet
            "inset-x-0 bottom-0 max-h-[90vh] rounded-t-2xl pb-[env(safe-area-inset-bottom)]",
            "data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom",
            // desktop: centered dialog
            "sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-[calc(100%-2rem)] sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:pb-0",
            "sm:data-[state=open]:slide-in-from-bottom-4 sm:data-[state=open]:zoom-in-95",
          ].join(" ")}
        >
          <div className="relative h-12 sm:h-24 overflow-hidden rounded-t-2xl bg-gradient-to-br from-ennis-blue via-ennis-navy to-ennis-dark">
            <Flower2 className="absolute -right-4 -top-8 h-28 w-28 sm:h-36 sm:w-36 text-ennis-flower/20" aria-hidden="true" />
            <Flower2 className="absolute right-24 top-2 h-8 w-8 sm:top-8 sm:h-12 sm:w-12 text-ennis-flower/25" aria-hidden="true" />
            <Flower2 className="absolute left-6 top-5 h-10 w-10 text-white/10 hidden sm:block" aria-hidden="true" />
            <span className="mx-auto mt-2 block h-1.5 w-12 rounded-full bg-white/30 sm:hidden" aria-hidden="true" />
          </div>
          <DialogPrimitive.Close
            className="absolute right-3 top-3 rounded-full bg-black/40 p-2 text-white transition-colors hover:bg-black/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </DialogPrimitive.Close>
          <div className="px-5 pb-6 pt-5 sm:px-8 sm:pb-8">
            <SignupForm
              variant="popup"
              source="popup"
              titleAs={DialogPrimitive.Title}
              onDone={() => {
                setFinished(true);
                setOpen(false);
              }}
            />
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export default SignupPopup;

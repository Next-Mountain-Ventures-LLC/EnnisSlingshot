/**
 * Consent state shared by ConsentBanner and the tracking call sites.
 *
 * The inline script in index.html reads the same localStorage key on every
 * page load and sets the Google Consent Mode v2 defaults + the Meta Pixel
 * consent state before either tag loads. This module only handles the
 * runtime side: reading / persisting the choice and pushing updates.
 */
export const CONSENT_STORAGE_KEY = "ennis-consent";
export const CONSENT_OPEN_EVENT = "ennis:consent:open";
export const CONSENT_CHANGE_EVENT = "ennis:consent:change";

export type ConsentChoice = "granted" | "denied";

declare global {
  interface Window {
    __ennisConsent?: string | null;
  }
}

export function readConsent(): ConsentChoice | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

export function hasMarketingConsent(): boolean {
  return readConsent() === "granted";
}

/** Persist the choice and push it to gtag (Consent Mode v2) and the Meta Pixel. */
export function applyConsent(choice: ConsentChoice): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, choice);
  } catch {
    /* private mode — still apply for this page view */
  }
  window.__ennisConsent = choice;

  if (typeof window.gtag === "function") {
    window.gtag("consent", "update", {
      ad_storage: choice,
      ad_user_data: choice,
      ad_personalization: choice,
      analytics_storage: choice,
    });
  }
  if (typeof window.fbq === "function") {
    window.fbq("consent", choice === "granted" ? "grant" : "revoke");
  }
  window.dispatchEvent(new CustomEvent(CONSENT_CHANGE_EVENT, { detail: choice }));
}

/** Re-open the banner (e.g. from a "Cookie settings" footer link). */
export function openConsentBanner(): void {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(CONSENT_OPEN_EVENT));
}

/** Meta Pixel event, sent only with marketing consent (fbq itself also queues while revoked). */
export function trackPixel(event: string, params?: Record<string, unknown>): void {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  if (!hasMarketingConsent()) return;
  window.fbq("track", event, params);
}

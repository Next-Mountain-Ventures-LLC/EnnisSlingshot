/// <reference types="vite/client" />

/** Meta Pixel global (loaded by the inline snippet in index.html). */
declare function fbq(...args: unknown[]): void;
/** Google tag global (defined by the inline Consent Mode block in index.html). */
declare function gtag(...args: unknown[]): void;

interface Window {
  fbq?: typeof fbq;
  gtag?: typeof gtag;
  dataLayer?: unknown[];
}

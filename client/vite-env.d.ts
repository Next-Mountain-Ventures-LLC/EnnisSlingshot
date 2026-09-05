/// <reference types="vite/client" />

/** Meta Pixel global (loaded by the inline snippet in index.html). */
declare function fbq(...args: unknown[]): void;

interface Window {
  fbq?: typeof fbq;
  dataLayer?: unknown[];
}

/**
 * Client side of the two-step mailing-list signup (shared/subscribe.ts).
 *
 * Progress is kept in localStorage ("ennis-signup") so every form instance —
 * popup, footer band, blog sidebar — agrees: once someone has given their
 * email the forms open on the phone step, and once they've finished nothing
 * asks again. Instances stay in sync through a window event.
 */
import type { SubscribeEmailInput, SubscribePhoneInput, SubscribeResponse } from "@shared/subscribe";
import { trackPixel } from "./consent";

export const SIGNUP_STORAGE_KEY = "ennis-signup";
export const SIGNUP_CHANGE_EVENT = "ennis:signup:change";

export type SignupStage = "new" | "email" | "complete";

export interface SignupState {
  stage: SignupStage;
  email?: string;
  firstName?: string;
  /** When step 1 / step 2 finished (ms since epoch). */
  emailAt?: number;
  completeAt?: number;
  /** Last time the popup was closed without finishing. */
  dismissedAt?: number;
  /** Visitor said "email is fine" on step 2 (inline forms still offer the phone step quietly). */
  phoneSkippedAt?: number;
}

const EMPTY: SignupState = { stage: "new" };

export function readSignup(): SignupState {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(SIGNUP_STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as SignupState;
    return parsed && typeof parsed === "object" && parsed.stage ? parsed : EMPTY;
  } catch {
    return EMPTY;
  }
}

export function writeSignup(patch: Partial<SignupState>): SignupState {
  const next = { ...readSignup(), ...patch };
  if (typeof window === "undefined") return next;
  try {
    window.localStorage.setItem(SIGNUP_STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* private mode — state lives for this page view only */
  }
  window.dispatchEvent(new CustomEvent(SIGNUP_CHANGE_EVENT, { detail: next }));
  return next;
}

async function post(path: string, body: unknown): Promise<SubscribeResponse> {
  try {
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await res.json().catch(() => null)) as SubscribeResponse | null;
    return data ?? { ok: res.ok, error: res.ok ? undefined : "upstream" };
  } catch {
    return { ok: false, error: "upstream" };
  }
}

function track(method: "email" | "sms", source: string) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", "generate_lead", { method, form_location: source });
  }
  trackPixel("Lead", { content_name: method === "sms" ? "SMS signup" : "Email signup", content_category: source });
}

export async function submitEmailStep(input: SubscribeEmailInput): Promise<SubscribeResponse> {
  const res = await post("/api/subscribe", input);
  if (res.ok) {
    writeSignup({ stage: "email", email: input.email.trim().toLowerCase(), firstName: input.firstName.trim(), emailAt: Date.now() });
    track("email", input.source ?? "unknown");
  }
  return res;
}

export async function submitPhoneStep(input: SubscribePhoneInput): Promise<SubscribeResponse> {
  const res = await post("/api/subscribe/phone", input);
  if (res.ok) {
    writeSignup({ stage: "complete", completeAt: Date.now() });
    track("sms", input.source ?? "unknown");
  }
  return res;
}

/** Visitor chose "email is fine" on step 2: the popup stops asking; footer/sidebar forms still offer the phone step. */
export function skipPhoneStep(): void {
  writeSignup({ phoneSkippedAt: Date.now() });
}

/** Popup closed without finishing. */
export function dismissSignupPopup(): void {
  writeSignup({ dismissedAt: Date.now() });
}

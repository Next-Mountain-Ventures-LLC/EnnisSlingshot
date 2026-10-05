/**
 * Mailing-list signup contract shared by the client forms
 * (client/components/signup/*) and the API route (server/routes/subscribe.ts).
 *
 * Two steps, two requests, so nobody is lost if they skip the phone step:
 *   1. POST /api/subscribe        { firstName, lastName, email, source }
 *      → subscriber is created in Sender immediately.
 *   2. POST /api/subscribe/phone  { email, phone, smsConsent: true, source }
 *      → phone is added to the same subscriber and they join the SMS group
 *        (the Sender automation on that group texts the $10-off code).
 *
 * US numbers only for now.
 */
import { z } from "zod";

/** Bumped whenever SMS_CONSENT_TEXT changes, so logged consents map to the wording shown. */
export const SMS_CONSENT_VERSION = "2026-10-05";

/** Shown next to the phone field; the submit button is the act of consent. */
export const SMS_CONSENT_TEXT =
  "By tapping or clicking “Text me my $10 code”, you agree to receive recurring automated marketing texts (festival dates, bloom reports and offers) from Ennis Slingshot Experience at this number. Consent is not a condition of purchase. Msg frequency varies. Msg & data rates may apply. Reply STOP to cancel, HELP for help.";

/** Strip a US number to 10 digits and return E.164 ("+12145550123"), or null if it isn't a valid NANP number. */
export function normalizeUsPhone(input: string): string | null {
  let digits = (input ?? "").replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) digits = digits.slice(1);
  if (digits.length !== 10) return null;
  // NANP: area code and exchange can't start with 0 or 1; N11 area codes aren't assignable.
  if (!/^[2-9]\d{2}[2-9]\d{6}$/.test(digits)) return null;
  if (digits[1] === "1" && digits[2] === "1") return null;
  return `+1${digits}`;
}

/**
 * As-you-type display format: "(214) 555-0123". Input that can't be a US
 * number (a non-+1 country code, or too many digits) is returned untouched so
 * validation rejects it — never truncate a foreign number into a US-looking one.
 */
export function formatUsPhoneInput(input: string): string {
  const raw = input ?? "";
  let digits = raw.replace(/\D/g, "");
  if (/^\s*\+(?!\s*1)/.test(raw) || digits.length > 11 || (digits.length === 11 && !digits.startsWith("1"))) return raw;
  if (digits.length === 11) digits = digits.slice(1);
  if (digits.length < 4) return digits;
  if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

const name = z.string().trim().min(1, "Required").max(60);
const email = z.string().trim().toLowerCase().email("Enter a valid email").max(254);
/** Where the form lives ("popup", "footer", "blog-sidebar", …) plus the page path, for reporting. */
const source = z.string().trim().max(120).optional();
/** Honeypot: real people never see or fill this field. */
const company = z.string().max(0).optional();

export const subscribeEmailSchema = z.object({
  firstName: name,
  lastName: name,
  email,
  source,
  company,
});
export type SubscribeEmailInput = z.infer<typeof subscribeEmailSchema>;

export const subscribePhoneSchema = z.object({
  email,
  /** Issued by step 1 (server/routes/subscribe.ts) — proves this email went through step 1. */
  token: z.string().trim().min(1, "Please enter your email first").max(200),
  phone: z
    .string()
    .trim()
    .refine((v) => normalizeUsPhone(v) !== null, "Enter a valid US mobile number")
    .transform((v) => normalizeUsPhone(v) as string),
  smsConsent: z.literal(true, { errorMap: () => ({ message: "Consent is required to receive texts" }) }),
  source,
  company,
});
export type SubscribePhoneInput = z.input<typeof subscribePhoneSchema>;

export interface SubscribeResponse {
  ok: boolean;
  /** Step 1 only: token to send with step 2. */
  token?: string;
  /** Machine-readable reason when ok is false. */
  error?: "invalid" | "not_configured" | "upstream" | "spam";
  /** Field-level messages for "invalid". */
  fields?: Record<string, string>;
}

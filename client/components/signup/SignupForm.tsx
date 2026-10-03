/**
 * Two-step mailing-list form (name + email → US mobile for texts + $10 off).
 * Used by the popup (SignupPopup), the footer band on every page and the blog
 * post sidebar. Step 1 is sent to Sender on its own, so nobody is lost if they
 * skip the phone step. All instances share progress via client/lib/signup.ts.
 *
 * SSR renders step 1; stored progress is applied after mount (no hydration
 * mismatch).
 */
import { useEffect, useId, useState, type ElementType, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Check, Flower2, Loader2, MessageSquareText } from "lucide-react";
import { business, isTodo } from "@shared/business";
import { FESTIVAL_2027 } from "@shared/season";
import {
  SMS_CONSENT_TEXT,
  formatUsPhoneInput,
  subscribeEmailSchema,
  subscribePhoneSchema,
} from "@shared/subscribe";
import {
  readSignup,
  skipPhoneStep,
  submitEmailStep,
  submitPhoneStep,
  SIGNUP_CHANGE_EVENT,
  type SignupState,
} from "@/lib/signup";
import { cn } from "@/lib/utils";

export type SignupVariant = "popup" | "band" | "card";
type View = "email" | "phone" | "done-email" | "done-sms";

export interface SignupFormProps {
  variant: SignupVariant;
  /** Reported to Sender logs + analytics ("popup", "footer", "blog-sidebar"). */
  source: string;
  /** Called when the visitor finishes or skips the phone step (popup closes). */
  onDone?: () => void;
  /** Element for the step heading — the popup passes Radix Dialog.Title. */
  titleAs?: ElementType;
  className?: string;
}

const festivalDays = FESTIVAL_2027.label.replace(/,\s*\d{4}$/, "");

function viewFor(state: SignupState): View {
  if (state.stage === "complete") return "done-sms";
  if (state.stage === "email") return "phone";
  return "email";
}

/** Live signup progress (after mount), shared across form instances. */
export function useSignupState(): SignupState | null {
  const [state, setState] = useState<SignupState | null>(null);
  useEffect(() => {
    setState(readSignup());
    const onChange = (e: Event) => setState((e as CustomEvent<SignupState>).detail ?? readSignup());
    window.addEventListener(SIGNUP_CHANGE_EVENT, onChange);
    return () => window.removeEventListener(SIGNUP_CHANGE_EVENT, onChange);
  }, []);
  return state;
}

export function SignupForm({ variant, source, onDone, titleAs: Title = "h2", className }: SignupFormProps) {
  const ids = useId();
  const stored = useSignupState();
  const [view, setView] = useState<View>("email");
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [values, setValues] = useState({ firstName: "", lastName: "", email: "", phone: "", company: "" });

  // Follow progress made in another instance (e.g. the popup) — but never yank
  // a visitor out of the step they're typing in.
  useEffect(() => {
    if (!stored || busy) return;
    setView((current) => {
      const next = viewFor(stored);
      if (current === "done-email" || current === "done-sms") return current;
      return next;
    });
  }, [stored, busy]);

  const pagePath = typeof window !== "undefined" ? window.location.pathname : "";
  const sourceTag = `${source}:${pagePath}`.slice(0, 120);
  const contactEmail = isTodo(business.email) ? null : business.email;
  const firstName = stored?.firstName || values.firstName.trim();

  const set = (key: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = key === "phone" ? formatUsPhoneInput(e.target.value) : e.target.value;
    setValues((s) => ({ ...s, [key]: v }));
    if (errors[key]) setErrors((s) => ({ ...s, [key]: "" }));
  };

  const failure = (error?: string, fields?: Record<string, string>) => {
    if (error === "invalid" && fields) return setErrors(fields);
    setErrors({
      form: `Something went wrong on our end. Please try again${contactEmail ? ` or email ${contactEmail}` : ""}.`,
    });
  };

  const onEmail = async (e: FormEvent) => {
    e.preventDefault();
    const input = { firstName: values.firstName, lastName: values.lastName, email: values.email, source: sourceTag, company: values.company || undefined };
    const check = subscribeEmailSchema.safeParse(input);
    if (!check.success) {
      const f: Record<string, string> = {};
      for (const i of check.error.issues) f[String(i.path[0])] ||= i.message;
      return setErrors(f);
    }
    setBusy(true);
    setErrors({});
    const res = await submitEmailStep(input);
    setBusy(false);
    if (res.ok) setView("phone");
    else failure(res.error, res.fields);
  };

  const onPhone = async (e: FormEvent) => {
    e.preventDefault();
    const email = stored?.email || values.email;
    const input = { email, phone: values.phone, smsConsent: true as const, source: sourceTag, company: values.company || undefined };
    const check = subscribePhoneSchema.safeParse(input);
    if (!check.success) {
      const f: Record<string, string> = {};
      for (const i of check.error.issues) f[String(i.path[0])] ||= i.message;
      return setErrors(f.email && !f.phone ? { form: "Please enter your email first." } : f);
    }
    setBusy(true);
    setErrors({});
    const res = await submitPhoneStep(input);
    setBusy(false);
    if (res.ok) {
      setView("done-sms");
      if (onDone) setTimeout(onDone, 3500);
    } else failure(res.error, res.fields);
  };

  const onSkip = () => {
    skipPhoneStep();
    setView("done-email");
    if (onDone) setTimeout(onDone, 2500);
  };

  const band = variant === "band";
  const card = variant === "card";
  const titleClass = cn(
    "font-black text-white tracking-tight",
    band ? "text-2xl md:text-3xl" : card ? "text-xl" : "text-2xl",
  );
  const bodyClass = cn("text-gray-300 leading-relaxed", card ? "text-sm" : "text-base");
  const inputClass =
    "w-full rounded-lg border border-gray-600 bg-black/40 px-3 py-3 text-base text-white placeholder:text-gray-500 focus:border-ennis-orange focus:outline-none focus:ring-2 focus:ring-ennis-orange/40 disabled:opacity-60";
  const labelClass = "block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1";
  const buttonClass =
    "w-full inline-flex items-center justify-center gap-2 rounded-lg bg-ennis-orange px-5 py-3 text-base font-bold text-ennis-dark transition-colors hover:bg-ennis-orange-bright focus:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:opacity-70";
  const errorText = (key: string) =>
    errors[key] ? (
      <p id={`${ids}-${key}-err`} className="mt-1 text-sm text-red-300">
        {errors[key]}
      </p>
    ) : null;
  const honeypot = (
    <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label>
        Company
        <input type="text" name="company" tabIndex={-1} autoComplete="off" value={values.company} onChange={set("company")} />
      </label>
    </div>
  );

  // ---- intro copy per view -------------------------------------------------
  let eyebrow: React.ReactNode;
  let title: React.ReactNode;
  let body: React.ReactNode;
  if (view === "email") {
    eyebrow = (
      <>
        <Flower2 className="h-4 w-4" aria-hidden="true" /> 2027 Bluebonnet season
      </>
    );
    title = (
      <>
        Get festival dates &amp; trail updates <span className="text-ennis-orange">first</span>
      </>
    );
    body = (
      <>
        The 2027 Ennis Bluebonnet Festival is expected {festivalDays} (subject to change), and the trails are open all
        April. Get confirmed dates, bloom reports and trail news — plus <strong className="text-white">$10 off your ride</strong>{" "}
        when you add your phone.
      </>
    );
  } else if (view === "phone") {
    eyebrow = (
      <>
        <Check className="h-4 w-4" aria-hidden="true" /> {firstName ? `Thanks, ${firstName} — you're on the list` : "You're on the list"}
      </>
    );
    title = (
      <>
        Get updates by text + <span className="text-ennis-orange">$10 off</span> your ride
      </>
    );
    body = (
      <>
        Add your mobile number and we'll text you the moment festival dates are confirmed and the bluebonnets start
        popping — plus a $10-off code for any Slingshot experience.
      </>
    );
  } else {
    eyebrow = (
      <>
        <Check className="h-4 w-4" aria-hidden="true" /> You're all set
      </>
    );
    title = view === "done-sms" ? <>Watch your texts{firstName ? `, ${firstName}` : ""}!</> : <>You're on the list{firstName ? `, ${firstName}` : ""}!</>;
    body =
      view === "done-sms"
        ? "Your $10 code is on its way. We'll text confirmed festival dates and bloom reports as soon as they drop."
        : "We'll email confirmed festival dates, bloom reports and trail news as soon as they drop.";
  }

  const intro = (
    <div className={cn(band && "md:pr-8")} aria-live="polite">
      <p className="mb-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-ennis-flower">{eyebrow}</p>
      <Title className={cn(titleClass, "mb-2")}>{title}</Title>
      <p className={bodyClass}>{body}</p>
    </div>
  );

  // ---- forms ---------------------------------------------------------------
  let form: React.ReactNode = null;
  if (view === "email") {
    form = (
      <form onSubmit={onEmail} noValidate className="relative space-y-3" aria-describedby={errors.form ? `${ids}-form-err` : undefined}>
        {honeypot}
        <div className={cn("grid gap-3", !card && "sm:grid-cols-2")}>
          <div>
            <label htmlFor={`${ids}-first`} className={labelClass}>
              First name
            </label>
            <input id={`${ids}-first`} name="firstName" autoComplete="given-name" required value={values.firstName} onChange={set("firstName")} disabled={busy} aria-invalid={!!errors.firstName} aria-describedby={errors.firstName ? `${ids}-firstName-err` : undefined} className={inputClass} />
            {errorText("firstName")}
          </div>
          <div>
            <label htmlFor={`${ids}-last`} className={labelClass}>
              Last name
            </label>
            <input id={`${ids}-last`} name="lastName" autoComplete="family-name" required value={values.lastName} onChange={set("lastName")} disabled={busy} aria-invalid={!!errors.lastName} aria-describedby={errors.lastName ? `${ids}-lastName-err` : undefined} className={inputClass} />
            {errorText("lastName")}
          </div>
        </div>
        <div>
          <label htmlFor={`${ids}-email`} className={labelClass}>
            Email
          </label>
          <input id={`${ids}-email`} name="email" type="email" inputMode="email" autoComplete="email" required value={values.email} onChange={set("email")} disabled={busy} aria-invalid={!!errors.email} aria-describedby={errors.email ? `${ids}-email-err` : undefined} className={inputClass} />
          {errorText("email")}
        </div>
        <button type="submit" disabled={busy} className={buttonClass}>
          {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          Send me updates
        </button>
        {errorText("form")}
        <p className="text-xs text-gray-500">
          No spam — just dates, bloom reports and trail news. Unsubscribe anytime.{" "}
          <Link to="/privacy/" className="underline hover:text-gray-300">
            Privacy
          </Link>
        </p>
      </form>
    );
  } else if (view === "phone") {
    form = (
      <form onSubmit={onPhone} noValidate className="relative space-y-3">
        {honeypot}
        <div>
          <label htmlFor={`${ids}-phone`} className={labelClass}>
            Mobile number (US)
          </label>
          <div className="flex">
            <span className="inline-flex shrink-0 items-center whitespace-nowrap rounded-l-lg border border-r-0 border-gray-600 bg-gray-800 px-3 text-base text-gray-300" aria-hidden="true">
              +1
            </span>
            <input
              id={`${ids}-phone`}
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              placeholder="(214) 555-0123"
              required
              value={values.phone}
              onChange={set("phone")}
              disabled={busy}
              aria-invalid={!!errors.phone}
              aria-describedby={`${ids}-consent${errors.phone ? ` ${ids}-phone-err` : ""}`}
              className={cn(inputClass, "min-w-0 flex-1 rounded-l-none")}
            />
          </div>
          {errorText("phone")}
        </div>
        <button type="submit" disabled={busy} className={buttonClass}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <MessageSquareText className="h-4 w-4" aria-hidden="true" />}
          Text me my $10 code
        </button>
        {errorText("form")}
        <p id={`${ids}-consent`} className="text-[11px] leading-snug text-gray-500">
          {SMS_CONSENT_TEXT}{" "}
          <Link to="/terms/#sms-terms" className="underline hover:text-gray-300">
            SMS terms
          </Link>{" "}
          ·{" "}
          <Link to="/privacy/" className="underline hover:text-gray-300">
            Privacy
          </Link>
        </p>
        {!stored?.phoneSkippedAt && (
          <button type="button" onClick={onSkip} className="w-full text-center text-sm text-gray-400 underline-offset-4 hover:text-white hover:underline">
            No thanks, email is fine
          </button>
        )}
      </form>
    );
  }

  return (
    <div
      className={cn(
        band && "grid items-center gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]",
        card && "rounded-lg border border-gray-700 bg-gray-900/60 p-5",
        className,
      )}
    >
      {intro}
      {form && <div className={cn(card || variant === "popup" ? "mt-4" : "")}>{form}</div>}
    </div>
  );
}

export default SignupForm;

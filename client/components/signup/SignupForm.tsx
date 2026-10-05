/**
 * Two-step mailing-list form (name + email → US mobile for texts + $10 off).
 * Used by the popup (SignupPopup), the footer band on every page and the blog
 * post sidebar. Step 1 is sent to Sender on its own, so nobody is lost if they
 * skip the phone step. All instances share progress via client/lib/signup.ts.
 *
 * SSR renders step 1; stored progress is applied after mount (no hydration
 * mismatch).
 */
import { useEffect, useId, useRef, useState, type ElementType, type FormEvent } from "react";
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
/** done-* = finished in this visit; subscribed = finished earlier (restored from storage). */
type View = "email" | "phone" | "done-email" | "done-sms" | "subscribed";

/** Inputs that render their own error line; anything else is shown as a form-level error. */
const VISIBLE_FIELDS = new Set(["firstName", "lastName", "email", "phone"]);

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
  if (state.stage === "complete") return "subscribed";
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
  // `hp` is the honeypot: real people never see it; it's sent as `company` and the server drops filled ones.
  const [values, setValues] = useState({ firstName: "", lastName: "", email: "", phone: "", hp: "" });
  const formRef = useRef<HTMLFormElement>(null);
  /** Set when the visitor (not another form instance) moved to the next step, so only then we move focus. */
  const focusNext = useRef(false);
  /** Set by a failed submit so focus moves to the first invalid field once (not while typing). */
  const focusError = useRef(false);

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

  // Keyboard/screen-reader users: land on the phone field after step 1, and on
  // the first invalid field after a failed submit.
  useEffect(() => {
    if (view === "phone" && focusNext.current) {
      focusNext.current = false;
      formRef.current?.querySelector<HTMLInputElement>('input[name="phone"]')?.focus();
    }
  }, [view]);
  useEffect(() => {
    if (!focusError.current) return;
    focusError.current = false;
    formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [errors]);

  const pagePath = typeof window !== "undefined" ? window.location.pathname : "";
  const sourceTag = `${source}:${pagePath}`.slice(0, 120);
  const contactEmail = isTodo(business.email) ? null : business.email;
  const firstName = stored?.firstName || values.firstName.trim();

  const set = (key: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = key === "phone" ? formatUsPhoneInput(e.target.value) : e.target.value;
    setValues((s) => ({ ...s, [key]: v }));
    if (errors[key]) setErrors((s) => ({ ...s, [key]: "" }));
  };

  /** Field errors for visible inputs; anything else (honeypot, token, …) becomes a form-level message. */
  const showErrors = (fields: Record<string, string>) => {
    focusError.current = true;
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(fields)) {
      if (!v) continue;
      if (VISIBLE_FIELDS.has(k)) out[k] ||= v;
      else out.form ||= v;
    }
    setErrors(out);
  };

  const failure = (error?: string, fields?: Record<string, string>) => {
    if (fields?.token) {
      setView("email");
      return setErrors({ form: fields.token });
    }
    if (error === "invalid" && fields) return showErrors(fields);
    setErrors({
      form: `Something went wrong on our end. Please try again${contactEmail ? ` or email ${contactEmail}` : ""}.`,
    });
  };

  const onEmail = async (e: FormEvent) => {
    e.preventDefault();
    const input = { firstName: values.firstName, lastName: values.lastName, email: values.email, source: sourceTag };
    const check = subscribeEmailSchema.safeParse(input);
    if (!check.success) {
      const f: Record<string, string> = {};
      for (const i of check.error.issues) f[String(i.path[0])] ||= i.message;
      return showErrors(f);
    }
    setBusy(true);
    setErrors({});
    const res = await submitEmailStep({ ...input, company: values.hp || undefined });
    setBusy(false);
    if (res.ok) {
      focusNext.current = true;
      setView("phone");
    } else failure(res.error, res.fields);
  };

  const onPhone = async (e: FormEvent) => {
    e.preventDefault();
    const latest = readSignup();
    const email = latest.email || stored?.email || values.email;
    const input = { email, token: latest.token ?? "", phone: values.phone, smsConsent: true as const, source: sourceTag };
    const check = subscribePhoneSchema.safeParse(input);
    if (!check.success) {
      const f: Record<string, string> = {};
      for (const i of check.error.issues) f[String(i.path[0])] ||= i.message;
      if ((f.email || f.token) && !f.phone) {
        setView("email");
        return setErrors({ form: "Please enter your name and email first." });
      }
      return showErrors(f);
    }
    setBusy(true);
    setErrors({});
    const res = await submitPhoneStep({ ...input, company: values.hp || undefined });
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
      <p id={`${ids}-${key}-err`} role="alert" className="mt-1 text-sm text-red-300">
        {errors[key]}
      </p>
    ) : null;
  const honeypot = (
    <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label>
        Leave this field empty
        <input type="text" name="hp_ref" tabIndex={-1} autoComplete="off" value={values.hp} onChange={set("hp")} />
      </label>
    </div>
  );
  /** Legal links: from the popup open a new tab so the half-finished signup isn't lost. */
  const legalLink = (to: string, label: string) =>
    variant === "popup" ? (
      <a href={to} target="_blank" rel="noopener" className="underline hover:text-gray-300">
        {label}
      </a>
    ) : (
      <Link to={to} className="underline hover:text-gray-300">
        {label}
      </Link>
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
        Get festival dates &amp; bloom alerts <span className="text-ennis-orange">by text</span>
      </>
    );
    body = (
      <>
        The 2027 Ennis Bluebonnet Festival is expected {festivalDays} (subject to change), and the trails are open all
        April. Start with your name and email, then add your mobile to get confirmed dates and bloom reports by text —
        plus <strong className="text-white">$10 off your ride</strong>.
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
  } else if (view === "subscribed") {
    eyebrow = (
      <>
        <Check className="h-4 w-4" aria-hidden="true" /> You're on the list
      </>
    );
    title = <>Thanks{firstName ? `, ${firstName}` : ""} — you're getting our updates</>;
    body = (
      <>
        We'll send confirmed 2027 festival dates and bloom reports as they're announced. Have your $10 code? Use it when
        you{" "}
        <Link to="/book/" className="font-semibold text-ennis-orange underline-offset-4 hover:underline">
          book your April ride
        </Link>
        .
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

  // Tell people up front there's a short second step (the phone number is where the $10 is).
  const step = view === "email" ? 1 : view === "phone" ? 2 : null;
  const intro = (
    <div className={cn(band && "md:pr-8")} aria-live="polite">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-ennis-flower">{eyebrow}</p>
        {step && <p className="text-xs font-semibold text-gray-400">Step {step} of 2</p>}
      </div>
      <Title className={cn(titleClass, "mb-2")}>{title}</Title>
      <p className={bodyClass}>{body}</p>
    </div>
  );

  // ---- forms ---------------------------------------------------------------
  let form: React.ReactNode = null;
  if (view === "email") {
    form = (
      <form ref={formRef} method="post" action="/api/subscribe" onSubmit={onEmail} noValidate className="relative space-y-3" aria-describedby={errors.form ? `${ids}-form-err` : undefined}>
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
        <p className="text-xs text-gray-400">
          No spam — just dates, bloom reports and trail news. Unsubscribe anytime. {legalLink("/privacy/", "Privacy")}
        </p>
      </form>
    );
  } else if (view === "phone") {
    form = (
      <form ref={formRef} method="post" action="/api/subscribe/phone" onSubmit={onPhone} noValidate className="relative space-y-3">
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
        <p id={`${ids}-consent`} className="text-xs leading-snug text-gray-400">
          {SMS_CONSENT_TEXT} {legalLink("/terms/#sms-terms", "SMS terms")} · {legalLink("/privacy/", "Privacy")}
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

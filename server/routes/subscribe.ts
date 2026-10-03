/**
 * Mailing-list signup → Sender (https://api.sender.net/v2).
 *
 *   POST /api/subscribe        step 1: name + email. Creates (or updates) the
 *                              subscriber and adds them to SENDER_GROUP_ID.
 *   POST /api/subscribe/phone  step 2: adds a US mobile number to the same
 *                              subscriber and adds them to SENDER_SMS_GROUP_ID —
 *                              the Sender automation on that group texts the
 *                              $10-off code.
 *
 * Environment (Netlify → Site configuration → Environment variables):
 *   SENDER_API_TOKEN     required  Sender → Settings → API access tokens
 *   SENDER_GROUP_ID      required  email list group ("Ennis Slingshot — Festival & Trail Updates")
 *   SENDER_SMS_GROUP_ID  optional  SMS group ("Ennis Slingshot — SMS $10 off"); defaults to SENDER_GROUP_ID
 *   SENDER_API_BASE      optional  override for tests (default https://api.sender.net/v2)
 *
 * The token never reaches the browser; the client only talks to /api/subscribe*.
 */
import type { RequestHandler } from "express";
import {
  SMS_CONSENT_VERSION,
  subscribeEmailSchema,
  subscribePhoneSchema,
  type SubscribeResponse,
} from "../../shared/subscribe";

interface SenderConfig {
  token: string;
  base: string;
  groupId: string;
  smsGroupId: string;
}

function senderConfig(): SenderConfig | null {
  const token = process.env.SENDER_API_TOKEN?.trim();
  const groupId = process.env.SENDER_GROUP_ID?.trim();
  if (!token || !groupId) return null;
  return {
    token,
    base: (process.env.SENDER_API_BASE?.trim() || "https://api.sender.net/v2").replace(/\/$/, ""),
    groupId,
    smsGroupId: process.env.SENDER_SMS_GROUP_ID?.trim() || groupId,
  };
}

async function sender(cfg: SenderConfig, method: string, path: string, body?: unknown): Promise<Response> {
  return fetch(`${cfg.base}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${cfg.token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(8000),
  });
}

async function addToGroup(cfg: SenderConfig, groupId: string, email: string): Promise<boolean> {
  const res = await sender(cfg, "POST", `/subscribers/groups/${encodeURIComponent(groupId)}`, {
    subscribers: [email],
    trigger_automation: true,
  });
  return res.ok;
}

function fieldErrors(issues: { path: (string | number)[]; message: string }[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

function send(res: Parameters<RequestHandler>[1], status: number, body: SubscribeResponse) {
  res.status(status).json(body);
}

/** Step 1 — name + email. */
export const handleSubscribeEmail: RequestHandler = async (req, res) => {
  const parsed = subscribeEmailSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    // A filled honeypot is a bot: answer "ok" so it learns nothing, but do nothing.
    if (parsed.error.issues.some((i) => i.path[0] === "company")) return send(res, 200, { ok: true });
    return send(res, 400, { ok: false, error: "invalid", fields: fieldErrors(parsed.error.issues) });
  }
  const cfg = senderConfig();
  if (!cfg) {
    console.error("[subscribe] SENDER_API_TOKEN / SENDER_GROUP_ID not set");
    return send(res, 503, { ok: false, error: "not_configured" });
  }

  const { email, firstName, lastName } = parsed.data;
  try {
    const created = await sender(cfg, "POST", "/subscribers", {
      email,
      firstname: firstName,
      lastname: lastName,
      groups: [cfg.groupId],
      trigger_automation: true,
    });
    if (created.ok) return send(res, 200, { ok: true });

    // Already on the account (e.g. another list, or signing up twice): update
    // the name and make sure they're in this site's group.
    if (created.status >= 400 && created.status < 500) {
      const updated = await sender(cfg, "PATCH", `/subscribers/${encodeURIComponent(email)}`, {
        firstname: firstName,
        lastname: lastName,
      });
      if (updated.ok && (await addToGroup(cfg, cfg.groupId, email))) return send(res, 200, { ok: true });
      console.error("[subscribe] update existing failed", created.status, updated.status, await created.text().catch(() => ""));
    } else {
      console.error("[subscribe] create failed", created.status, await created.text().catch(() => ""));
    }
  } catch (err) {
    console.error("[subscribe] Sender request error", err);
  }
  return send(res, 502, { ok: false, error: "upstream" });
};

/** Step 2 — US mobile number + SMS consent. */
export const handleSubscribePhone: RequestHandler = async (req, res) => {
  const parsed = subscribePhoneSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    if (parsed.error.issues.some((i) => i.path[0] === "company")) return send(res, 200, { ok: true });
    return send(res, 400, { ok: false, error: "invalid", fields: fieldErrors(parsed.error.issues) });
  }
  const cfg = senderConfig();
  if (!cfg) {
    console.error("[subscribe] SENDER_API_TOKEN / SENDER_GROUP_ID not set");
    return send(res, 503, { ok: false, error: "not_configured" });
  }

  const { email, phone, source } = parsed.data;
  try {
    let updated = await sender(cfg, "PATCH", `/subscribers/${encodeURIComponent(email)}`, { phone });
    if (updated.status === 404) {
      // Step 1 never reached Sender (network blip) — create them now with both groups.
      updated = await sender(cfg, "POST", "/subscribers", {
        email,
        phone,
        groups: [...new Set([cfg.groupId, cfg.smsGroupId])],
        trigger_automation: true,
      });
    }
    if (updated.ok && (await addToGroup(cfg, cfg.smsGroupId, email))) {
      // Consent record for TCPA: when, which wording, where. Phone is truncated in logs.
      console.info(
        JSON.stringify({
          event: "sms_consent",
          at: new Date().toISOString(),
          email,
          phoneLast4: phone.slice(-4),
          consentVersion: SMS_CONSENT_VERSION,
          source: source ?? null,
          ip: req.headers["x-nf-client-connection-ip"] ?? req.ip ?? null,
          userAgent: req.headers["user-agent"] ?? null,
        }),
      );
      return send(res, 200, { ok: true });
    }
    console.error("[subscribe/phone] Sender update failed", updated.status, await updated.text().catch(() => ""));
  } catch (err) {
    console.error("[subscribe/phone] Sender request error", err);
  }
  return send(res, 502, { ok: false, error: "upstream" });
};

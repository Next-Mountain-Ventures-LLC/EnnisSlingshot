import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import express from "express";
import type { AddressInfo } from "node:net";
import { handleSubscribeEmail, handleSubscribePhone } from "./subscribe";
import { formatUsPhoneInput, normalizeUsPhone } from "../../shared/subscribe";

describe("US phone helpers", () => {
  it("normalizes common US formats to E.164", () => {
    expect(normalizeUsPhone("(214) 555-0123")).toBe("+12145550123");
    expect(normalizeUsPhone("214.555.0123")).toBe("+12145550123");
    expect(normalizeUsPhone("+1 214 555 0123")).toBe("+12145550123");
    expect(normalizeUsPhone("12145550123")).toBe("+12145550123");
  });
  it("rejects non-US / invalid numbers", () => {
    expect(normalizeUsPhone("555-0123")).toBeNull();
    expect(normalizeUsPhone("+44 20 7946 0958")).toBeNull();
    expect(normalizeUsPhone("(014) 555-0123")).toBeNull(); // area code can't start with 0
    expect(normalizeUsPhone("(214) 155-0123")).toBeNull(); // exchange can't start with 1
    expect(normalizeUsPhone("(911) 555-0123")).toBeNull(); // N11
    expect(normalizeUsPhone("")).toBeNull();
  });
  it("formats as you type", () => {
    expect(formatUsPhoneInput("214")).toBe("214");
    expect(formatUsPhoneInput("2145")).toBe("(214) 5");
    expect(formatUsPhoneInput("2145550123")).toBe("(214) 555-0123");
    expect(formatUsPhoneInput("1-214-555-0123")).toBe("(214) 555-0123");
    expect(formatUsPhoneInput("21455501239999")).toBe("(214) 555-0123");
  });
});

type Call = { method: string; url: string; body: any };

function app() {
  const a = express();
  a.use(express.json());
  a.post("/api/subscribe", handleSubscribeEmail);
  a.post("/api/subscribe/phone", handleSubscribePhone);
  return a;
}

async function post(path: string, body: unknown) {
  const server = app().listen(0);
  const { port } = server.address() as AddressInfo;
  try {
    const res = await realFetch(`http://127.0.0.1:${port}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return { status: res.status, json: await res.json() };
  } finally {
    server.close();
  }
}

const realFetch = globalThis.fetch;
let calls: Call[];
let responder: (c: Call) => { status: number; body?: unknown };

beforeEach(() => {
  calls = [];
  responder = () => ({ status: 200, body: { data: {} } });
  process.env.SENDER_API_TOKEN = "test-token";
  process.env.SENDER_GROUP_ID = "grpEmail";
  process.env.SENDER_SMS_GROUP_ID = "grpSms";
  delete process.env.SENDER_API_BASE;
  vi.stubGlobal("fetch", async (input: string, init?: RequestInit) => {
    const url = String(input);
    if (!url.startsWith("https://api.sender.net")) return realFetch(input, init);
    expect((init?.headers as Record<string, string>).Authorization).toBe("Bearer test-token");
    const call = { method: init?.method ?? "GET", url, body: init?.body ? JSON.parse(String(init.body)) : undefined };
    calls.push(call);
    const r = responder(call);
    return new Response(JSON.stringify(r.body ?? {}), { status: r.status, headers: { "Content-Type": "application/json" } });
  });
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "info").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("POST /api/subscribe (step 1)", () => {
  it("creates the subscriber in the email group", async () => {
    const res = await post("/api/subscribe", { firstName: " Ada ", lastName: "Lovelace", email: "ADA@Example.com", source: "popup:/" });
    expect(res).toEqual({ status: 200, json: { ok: true } });
    expect(calls).toHaveLength(1);
    expect(calls[0]).toMatchObject({
      method: "POST",
      url: "https://api.sender.net/v2/subscribers",
      body: { email: "ada@example.com", firstname: "Ada", lastname: "Lovelace", groups: ["grpEmail"], trigger_automation: true },
    });
  });

  it("updates + adds to group when the subscriber already exists", async () => {
    responder = (c) => (c.method === "POST" && c.url.endsWith("/subscribers") ? { status: 422, body: { message: "already exists" } } : { status: 200 });
    const res = await post("/api/subscribe", { firstName: "Ada", lastName: "L", email: "ada@example.com" });
    expect(res.json).toEqual({ ok: true });
    expect(calls.map((c) => `${c.method} ${c.url.replace("https://api.sender.net/v2", "")}`)).toEqual([
      "POST /subscribers",
      "PATCH /subscribers/ada%40example.com",
      "POST /subscribers/groups/grpEmail",
    ]);
    expect(calls[2].body).toEqual({ subscribers: ["ada@example.com"], trigger_automation: true });
  });

  it("returns field errors for bad input without calling Sender", async () => {
    const res = await post("/api/subscribe", { firstName: "", lastName: "L", email: "nope" });
    expect(res.status).toBe(400);
    expect(res.json.error).toBe("invalid");
    expect(Object.keys(res.json.fields)).toEqual(expect.arrayContaining(["firstName", "email"]));
    expect(calls).toHaveLength(0);
  });

  it("silently accepts (and drops) honeypot submissions", async () => {
    const res = await post("/api/subscribe", { firstName: "Bot", lastName: "Bot", email: "bot@example.com", company: "Spam LLC" });
    expect(res).toEqual({ status: 200, json: { ok: true } });
    expect(calls).toHaveLength(0);
  });

  it("503s when Sender isn't configured", async () => {
    delete process.env.SENDER_API_TOKEN;
    const res = await post("/api/subscribe", { firstName: "Ada", lastName: "L", email: "ada@example.com" });
    expect(res).toEqual({ status: 503, json: { ok: false, error: "not_configured" } });
  });

  it("502s when Sender errors", async () => {
    responder = () => ({ status: 500 });
    const res = await post("/api/subscribe", { firstName: "Ada", lastName: "L", email: "ada@example.com" });
    expect(res).toEqual({ status: 502, json: { ok: false, error: "upstream" } });
  });
});

describe("POST /api/subscribe/phone (step 2)", () => {
  it("adds the E.164 phone and joins the SMS group", async () => {
    const res = await post("/api/subscribe/phone", { email: "ada@example.com", phone: "(214) 555-0123", smsConsent: true, source: "popup:/" });
    expect(res).toEqual({ status: 200, json: { ok: true } });
    expect(calls.map((c) => `${c.method} ${c.url.replace("https://api.sender.net/v2", "")}`)).toEqual([
      "PATCH /subscribers/ada%40example.com",
      "POST /subscribers/groups/grpSms",
    ]);
    expect(calls[0].body).toEqual({ phone: "+12145550123" });
  });

  it("creates the subscriber if step 1 never reached Sender", async () => {
    responder = (c) => (c.method === "PATCH" ? { status: 404 } : { status: 200 });
    const res = await post("/api/subscribe/phone", { email: "ada@example.com", phone: "2145550123", smsConsent: true });
    expect(res.json).toEqual({ ok: true });
    expect(calls[1]).toMatchObject({
      method: "POST",
      url: "https://api.sender.net/v2/subscribers",
      body: { email: "ada@example.com", phone: "+12145550123", groups: ["grpEmail", "grpSms"] },
    });
  });

  it("requires consent and a valid US number", async () => {
    const noConsent = await post("/api/subscribe/phone", { email: "ada@example.com", phone: "2145550123" });
    expect(noConsent.status).toBe(400);
    expect(noConsent.json.fields.smsConsent).toBeTruthy();
    const badPhone = await post("/api/subscribe/phone", { email: "ada@example.com", phone: "+44 20 7946 0958", smsConsent: true });
    expect(badPhone.status).toBe(400);
    expect(badPhone.json.fields.phone).toBe("Enter a valid US mobile number");
    expect(calls).toHaveLength(0);
  });
});

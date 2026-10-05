import { describe, expect, it } from "vitest";
import { shouldOfferPopup } from "./SignupPopup";

const DAY = 24 * 60 * 60 * 1000;
const now = Date.UTC(2026, 9, 5);

describe("shouldOfferPopup", () => {
  it("offers to new visitors", () => {
    expect(shouldOfferPopup({ stage: "new" }, now)).toBe(true);
  });
  it("never offers after the visitor finished", () => {
    expect(shouldOfferPopup({ stage: "complete", completeAt: now - 90 * DAY }, now)).toBe(false);
  });
  it("waits 7 days after a dismissal", () => {
    expect(shouldOfferPopup({ stage: "new", dismissedAt: now - 6 * DAY }, now)).toBe(false);
    expect(shouldOfferPopup({ stage: "new", dismissedAt: now - 8 * DAY }, now)).toBe(true);
  });
  it("reminds email-only subscribers about the phone step after 3 days, unless they said email is fine", () => {
    expect(shouldOfferPopup({ stage: "email", emailAt: now - 2 * DAY }, now)).toBe(false);
    expect(shouldOfferPopup({ stage: "email", emailAt: now - 4 * DAY }, now)).toBe(true);
    expect(shouldOfferPopup({ stage: "email", emailAt: now - 30 * DAY, phoneSkippedAt: now - 29 * DAY }, now)).toBe(false);
  });
});

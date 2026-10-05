import { describe, expect, it } from "vitest";
import { faqPage, plainFaqAnswer } from "./faqPage";

describe("plainFaqAnswer", () => {
  it("keeps link labels and drops the markup", () => {
    expect(plainFaqAnswer("See our [trail map](/bluebonnets/trail-map/) or [email us](mailto:a@b.c).")).toBe(
      "See our trail map or email us.",
    );
  });

  it("leaves plain answers alone", () => {
    expect(plainFaqAnswer("Yes — insurance is included [no link here].")).toBe("Yes — insurance is included [no link here].");
  });

  it("is what the FAQPage JSON-LD carries", () => {
    const ld = faqPage([{ question: "Q?", answer: "Read the [FAQ](/faq/)." }]) as unknown as {
      mainEntity: { acceptedAnswer: { text: string } }[];
    };
    expect(ld.mainEntity[0].acceptedAnswer.text).toBe("Read the FAQ.");
  });
});

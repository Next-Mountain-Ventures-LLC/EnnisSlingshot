import type { Faq } from "@shared/content/page-schema";
import { withContext, type JsonLd } from "./common";

/** `[label](href)` links inside FAQ answers (rendered as links by FaqAccordion). */
export const FAQ_LINK_RE = /\[([^\]]+)\]\(([^)\s]+)\)/g;

/** FAQ answer without link markup — for JSON-LD and other plain-text uses. */
export function plainFaqAnswer(answer: string): string {
  return answer.replace(FAQ_LINK_RE, "$1");
}

export function faqPage(faqs: Faq[]): JsonLd {
  return withContext({
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: plainFaqAnswer(f.answer) },
    })),
  });
}

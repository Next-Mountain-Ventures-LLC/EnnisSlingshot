import type { Faq } from "@shared/content/page-schema";
import { withContext, type JsonLd } from "./common";

export function faqPage(faqs: Faq[]): JsonLd {
  return withContext({
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  });
}

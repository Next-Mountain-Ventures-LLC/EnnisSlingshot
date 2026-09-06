/**
 * FAQ accordion built on the Radix Accordion primitives from ui/accordion.tsx.
 *
 * Answers stay in the DOM when collapsed (`forceMount` + the `hidden`
 * attribute Radix sets on closed content) so crawlers and AI bots see the
 * full Q&A in the prerendered HTML. Optionally emits FAQPage JSON-LD.
 *
 * Visual treatment matches the original landing FAQ (bordered rows, orange
 * highlight when open, rotating ▼ chevron).
 */
import type { Faq } from "@shared/content/page-schema";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { JsonLdScript } from "@/components/seo/Seo";
import { faqPage } from "@/lib/schema";
import { cn } from "@/lib/utils";

export interface FaqAccordionProps {
  faqs: Faq[];
  /** Emit <script type="application/ld+json"> FAQPage for these items. */
  withSchema?: boolean;
  className?: string;
}

export function FaqAccordion({
  faqs,
  withSchema = false,
  className,
}: FaqAccordionProps) {
  if (!faqs?.length) return null;

  return (
    <>
      {withSchema && <JsonLdScript data={faqPage(faqs)} />}
      <Accordion type="single" collapsible className={cn("space-y-3", className)}>
        {faqs.map((item, i) => (
          <AccordionItem
            key={i}
            value={`faq-${i}`}
            className="border rounded-lg overflow-hidden transition-all border-gray-700 data-[state=open]:border-ennis-orange/50 data-[state=open]:bg-ennis-orange/5"
          >
            <AccordionTrigger
              className={cn(
                "w-full px-6 py-4 text-left hover:bg-gray-900/50 transition-colors flex items-center justify-between",
                "hover:no-underline font-normal [&>svg]:hidden",
                "[&[data-state=open]>span]:rotate-180",
              )}
            >
              {/* AccordionTrigger is already wrapped in a Radix <h3> Header — keep this a span to avoid nested headings. */}
              <span className="text-lg font-bold text-white">{item.question}</span>
              <span
                aria-hidden="true"
                className="text-ennis-orange flex-shrink-0 ml-4 transition-transform inline-block"
              >
                ▼
              </span>
            </AccordionTrigger>
            {/*
              forceMount keeps the answer in the DOM when closed (Radix would
              otherwise unmount it). Radix does not set `hidden` on force-mounted
              content, so collapse the closed state with CSS via the outer
              element's data-state (ui/accordion puts `className` on the inner div).
            */}
            <AccordionContent
              forceMount
              className="px-6 pb-4 pt-2 text-gray-300 leading-relaxed border-t border-gray-700 text-base [[data-state=closed]_&]:hidden"
            >
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </>
  );
}

export default FaqAccordion;

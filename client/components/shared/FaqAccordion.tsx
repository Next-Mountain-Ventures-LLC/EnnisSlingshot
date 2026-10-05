/**
 * FAQ accordion built on the Radix Accordion primitives from ui/accordion.tsx.
 *
 * Answers stay in the DOM when collapsed (`forceMount` + the `hidden`
 * attribute Radix sets on closed content) so crawlers and AI bots see the
 * full Q&A in the prerendered HTML. Optionally emits FAQPage JSON-LD.
 *
 * Visual treatment matches the original landing FAQ (bordered rows, orange
 * highlight when open); only the chevron icon rotates when an item opens.
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
            {/*
              The chevron is the lucide ChevronDown that ui/accordion appends as
              the trigger's last child; ui/accordion rotates only that <svg>
              ([&[data-state=open]>svg]:rotate-180), so the question text never turns.
            */}
            <AccordionTrigger
              className={cn(
                "w-full gap-4 px-4 sm:px-6 py-4 text-left hover:bg-gray-900/50 transition-colors flex items-center justify-between",
                "hover:no-underline font-normal",
                "[&>svg]:h-5 [&>svg]:w-5 [&>svg]:text-ennis-orange",
              )}
            >
              {/* AccordionTrigger is already wrapped in a Radix <h3> Header — keep this a span to avoid nested headings. */}
              <span className="flex-1 text-base sm:text-lg font-bold text-white">{item.question}</span>
            </AccordionTrigger>
            {/*
              forceMount keeps the answer in the DOM when closed (Radix would
              otherwise unmount it). Radix does not set `hidden` on force-mounted
              content, so collapse the closed state with CSS via the outer
              element's data-state (ui/accordion puts `className` on the inner div).
            */}
            <AccordionContent
              forceMount
              className="px-4 sm:px-6 pb-4 pt-2 text-gray-300 leading-relaxed border-t border-gray-700 text-base [[data-state=closed]_&]:hidden"
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

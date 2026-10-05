import { FaqAccordion } from "@/components/shared/FaqAccordion";
import type { Faq } from "@shared/content/page-schema";

export const homeFaqItems: Faq[] = [
  {
    question: "How much does the experience cost?",
    answer:
      "The 2-hour Bluebonnet Trail Experience is $79 solo (one driver) or $149 for one driver plus one rider, and the 1-hour Drive & Go is $69.99 for one driver. Every price includes all fuel and comprehensive insurance with no deposit, and the 2-hour experience comes with the Ennis Bluebonnet Trail map.",
  },
  {
    question: "Do I need a special license to drive a Slingshot?",
    answer:
      "No special license is required! You only need a valid driver's license. The Polaris Slingshot uses AutoDrive (no clutch pedal), so it's as easy to drive as a car. However, all drivers must be approved by our insurance company before driving.",
  },
  {
    question: "What is the driver approval process?",
    answer:
      "After you book, we'll send a verification link to your email. You'll need to complete our insurance approval process to be cleared as a driver. Approval typically comes through within 24 hours. If for any reason you don't meet our insurance requirements, your booking will be fully refunded.",
  },
  {
    question: "What insurance coverage is included?",
    answer:
      "Comprehensive insurance coverage is included with every rental. This protects you from liability and damage claims. With standard coverage, there is a $500 max out of pocket for vehicle damage or theft. Our insurance is tailored for Slingshot experiences and provides peace of mind while you focus on the thrill of the ride.",
  },
  {
    question: "Can I reschedule my booking?",
    answer:
      "Yes! You can reschedule up to 7 days before your experience date. If you need to change your booking date or time, simply contact us and we'll help you find another available slot—subject to availability.",
  },
  {
    question: "What is your cancellation policy?",
    answer:
      "You can reschedule at no additional charge up to 7 days before your experience date. If weather or a mechanical issue affects your ride, we'll offer a full reschedule instead of a refund.",
  },
  {
    question: "Can I bring a friend? How does the 2-person setup work?",
    answer:
      "Absolutely! Book the Solo experience for one driver, or bring a rider in the passenger seat with the Driver + Rider experience ($149). Each Slingshot seats one driver and one rider. Only the driver needs to complete our approval process before the experience—your passenger does not need to be approved.",
  },
  {
    question: "How long is the experience?",
    answer:
      "The Bluebonnet Trail Experience is 2 hours total, including vehicle orientation, a safety briefing and the ride through the Bluebonnet Trails; Drive & Go is a 1-hour drive. Either way, arrive 15 minutes early to check in.",
  },
  {
    question: "What happens if there's bad weather?",
    answer:
      "We ride rain or shine whenever it's safe. If conditions turn unsafe (heavy rain, severe storms or dangerous winds), we'll reach out to reschedule your experience at no cost.",
  },
  {
    question: "What trails are on the map?",
    answer:
      "The Bluebonnet Trail Map features our expert-curated scenic routes throughout Ennis and the surrounding areas. The map includes recommended trails with varying difficulty levels and stunning wildflower viewing locations. It comes in your glove box with the 2-hour Bluebonnet Trail Experience.",
  },
  {
    question: "Do I need a helmet?",
    answer:
      "Texas applies its motorcycle helmet rules to autocycles: riders under 21 must wear a helmet, and riders 21 and older can ride without one only if they've completed a motorcycle safety course or carry qualifying health insurance (Tex. Transp. Code §661.0015, §661.003). We strongly suggest a helmet for everyone. We offer Bluetooth communication helmets for $25 per helmet. These helmets allow both you and your passenger to hear each other clearly while riding, enhancing communication and safety on the trails.",
  },
];

/**
 * Landing-page FAQ. Answers are rendered in the DOM (Radix accordion with
 * forceMount) so crawlers see them; FAQPage JSON-LD is emitted too.
 */
export function FAQ() {
  return (
    <section className="py-20 md:py-32 bg-gradient-to-b from-ennis-darker to-ennis-dark">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            Frequently Asked <span className="text-ennis-orange">Questions</span>
          </h2>
          <p className="text-gray-400 text-lg">
            Everything you need to know about your Slingshot experience
          </p>
        </div>

        <FaqAccordion faqs={homeFaqItems} withSchema />
      </div>
    </section>
  );
}

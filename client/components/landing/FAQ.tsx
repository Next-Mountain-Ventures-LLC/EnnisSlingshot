import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqItems = [
  {
    id: "pricing",
    question: "How much does the experience cost?",
    answer:
      "The Slingshot rental is $79 per rider for a 2-hour experience. This includes the vehicle rental, all fuel, comprehensive insurance coverage, and a 2026 Bluebonnet Trail Map. The experience accommodates 1 rider and 1 driver (you can book as either role).",
  },
  {
    id: "drivers",
    question: "Do I need a special license to drive a Slingshot?",
    answer:
      "No special license is required! You only need a valid driver's license. The Polaris Slingshot SL has an automatic transmission, making it as easy to drive as a car. However, all riders must be approved by our insurance company before driving.",
  },
  {
    id: "approval",
    question: "What is the driver approval process?",
    answer:
      "After you book, we'll send a verification link to your email. You'll need to complete our insurance approval process to be cleared as a driver. This typically takes 1-2 business days. If for any reason you don't meet our insurance requirements, your booking will be fully refunded.",
  },
  {
    id: "insurance",
    question: "What insurance coverage is included?",
    answer:
      "Comprehensive insurance coverage is included with every rental. This protects you from liability and damage claims. Our insurance is tailored for Slingshot experiences and provides peace of mind while you focus on the thrill of the ride.",
  },
  {
    id: "reschedule",
    question: "Can I reschedule my booking?",
    answer:
      "Yes! While all rides are non-refundable, they are fully reschedulable. If you need to change your booking date or time, simply contact us and we'll help you find another available slot—subject to availability.",
  },
  {
    id: "cancel",
    question: "What is your cancellation policy?",
    answer:
      "All bookings are non-refundable. However, you can reschedule to another available date at no additional charge. If we need to cancel due to weather or mechanical issues, we'll provide a full refund or reschedule option.",
  },
  {
    id: "riders",
    question: "Can I bring a friend? How does the 2-person setup work?",
    answer:
      "Absolutely! The Slingshot accommodates both a rider and a driver. You can book as either role. If you book 2 riders, one will be the passenger/rider, and the other will be the driver. Both must complete our driver approval process before the experience.",
  },
  {
    id: "duration",
    question: "How long is the experience?",
    answer:
      "The experience is 2 hours total. This includes vehicle orientation, safety briefing, and the actual ride through the beautiful Bluebonnet trails. We recommend arriving 15 minutes early to complete any final preparations.",
  },
  {
    id: "weather",
    question: "What happens if there's bad weather?",
    answer:
      "We operate rain or shine, as the Slingshot is equipped to handle various weather conditions. However, if conditions are unsafe (severe storms, dangerous winds), we'll reach out to reschedule your experience at no cost.",
  },
  {
    id: "map",
    question: "What trails are included in the 2026 map?",
    answer:
      "The 2026 Bluebonnet Trail Map features our expert-curated scenic routes throughout Ennis and the surrounding areas. The map includes recommended trails with varying difficulty levels and stunning wildflower viewing locations. It comes in your glove box during your rental.",
  },
];

export function FAQ() {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggleOpen = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

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

        <div className="space-y-3">
          {faqItems.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div
                key={item.id}
                className={`border rounded-lg overflow-hidden transition-all ${
                  isOpen ? "border-ennis-orange/50 bg-ennis-orange/5" : "border-gray-700"
                }`}
              >
                <button
                  onClick={() => toggleOpen(item.id)}
                  className="w-full px-6 py-4 text-left hover:bg-gray-900/50 transition-colors flex items-center justify-between"
                >
                  <h3 className="text-lg font-bold text-white">
                    {item.question}
                  </h3>
                  <ChevronDown
                    className={`w-5 h-5 text-ennis-orange flex-shrink-0 ml-4 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-6 pb-4 pt-2 text-gray-300 leading-relaxed border-t border-gray-700">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Additional Info */}
        <div className="mt-12 bg-ennis-orange/10 border border-ennis-orange/30 rounded-lg p-8">
          <h3 className="text-xl font-bold text-white mb-3">Still have questions?</h3>
          <p className="text-gray-300 mb-4">
            We're here to help! Reach out to us and we'll answer any additional questions about your Slingshot experience.
          </p>
          <div className="text-gray-400 text-sm">
            <p>📧 Email: <span className="text-ennis-orange font-semibold">[Your Email]</span></p>
            <p>📱 Phone: <span className="text-ennis-orange font-semibold">[Your Phone]</span></p>
          </div>
        </div>
      </div>
    </section>
  );
}

import { useState } from "react";

const faqItems = [
  {
    id: "pricing",
    question: "How much does the experience cost?",
    answer:
      "Our slingshot experience pricing is $79 for a solo experience (one driver) and $149 for the experience with one driver and one additional rider. Both include the 2-hour rental, all fuel, comprehensive insurance coverage, and a 2026 Bluebonnet Trail Map.",
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
      "After you book, we'll send a verification link to your email. You'll need to complete our insurance approval process to be cleared as a driver. This typically approves within 24 hours. If for any reason you don't meet our insurance requirements, your booking will be fully refunded.",
  },
  {
    id: "insurance",
    question: "What insurance coverage is included?",
    answer:
      "Comprehensive insurance coverage is included with every rental. This protects you from liability and damage claims. With standard coverage, there is a $500 max out of pocket for vehicle damage or theft. Our insurance is tailored for Slingshot experiences and provides peace of mind while you focus on the thrill of the ride.",
  },
  {
    id: "reschedule",
    question: "Can I reschedule my booking?",
    answer:
      "Yes! Bookings can be rescheduled up to 7 days prior to the scheduled date. If you need to change your booking date or time, simply contact us and we'll help you find another available slot—subject to availability.",
  },
  {
    id: "cancel",
    question: "What is your cancellation policy?",
    answer:
      "Bookings can be rescheduled within 7 days prior to the experience date at no additional charge. If there are weather or mechanical issues, no refunds will be offered, but a full reschedule will be offered instead.",
  },
  {
    id: "riders",
    question: "Can I bring a friend? How does the 2-person setup work?",
    answer:
      "Absolutely! You can enjoy a solo experience with one driver, or bring a rider for an additional cost. There is one driver and one rider. Only the driver needs to complete our approval process before the experience—your passenger does not need to be approved.",
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
      "We operate rain or shine, as the Slingshot is equipped to handle various weather conditions. However, if conditions are unsafe (rain, severe storms, dangerous winds), we'll reach out to reschedule your experience at no cost.",
  },
  {
    id: "map",
    question: "What trails are included in the 2026 map?",
    answer:
      "The 2026 Bluebonnet Trail Map features our expert-curated scenic routes throughout Ennis and the surrounding areas. The map includes recommended trails with varying difficulty levels and stunning wildflower viewing locations. It comes in your glove box during your rental.",
  },
  {
    id: "helmets",
    question: "Do I need a helmet?",
    answer:
      "Helmets are not required by law, but we strongly suggest wearing one for your safety and protection. We offer Bluetooth communication helmets available for rent at $25 per helmet. These helmets allow both you and your passenger to hear each other clearly while riding, enhancing communication and safety on the trails.",
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
                  <span
                    className={`text-ennis-orange flex-shrink-0 ml-4 transition-transform inline-block ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  >
                    ▼
                  </span>
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

        {/* Additional Info - Hidden for now */}
        {/* <div className="mt-12 bg-ennis-orange/10 border border-ennis-orange/30 rounded-lg p-8">
          <h3 className="text-xl font-bold text-white mb-3">Still have questions?</h3>
          <p className="text-gray-300 mb-4">
            We're here to help! Reach out to us and we'll answer any additional questions about your Slingshot experience.
          </p>
          <div className="text-gray-400 text-sm">
            <p>📧 Email: <span className="text-ennis-orange font-semibold">[Your Email]</span></p>
            <p>📱 Phone: <span className="text-ennis-orange font-semibold">[Your Phone]</span></p>
          </div>
        </div> */}
      </div>
    </section>
  );
}

import { useState } from "react";

export function Booking() {
  const [riderCount, setRiderCount] = useState(1);
  const [videoMuted, setVideoMuted] = useState(true);

  const pricePerRider = 79;
  const totalPrice = riderCount * pricePerRider;

  return (
    <section className="py-20 md:py-32 bg-gradient-to-b from-ennis-darker to-ennis-dark">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            Book Your <span className="text-ennis-orange">Experience</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Choose your adventure and reserve your Slingshot rental today
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto items-start">
          {/* Video */}
          <div className="w-full aspect-video lg:aspect-square bg-gray-900 rounded-lg border border-gray-700 overflow-hidden relative group">
            <video
              autoPlay
              muted={videoMuted}
              loop
              playsInline
              preload="auto"
              className="w-full h-full object-cover"
            >
              <source src="https://videos.files.wordpress.com/HvuZEn7E/1744504370711.mov" type="video/quicktime" />
              <source src="https://videos.files.wordpress.com/HvuZEn7E/1744504370711.mov" type="video/mp4" />
            </video>

            {/* Mute/Unmute Button */}
            <button
              onClick={() => setVideoMuted(!videoMuted)}
              className="absolute bottom-4 right-4 bg-ennis-orange hover:bg-ennis-orange-bright text-ennis-dark font-bold py-2 px-4 rounded-lg transition-all opacity-0 group-hover:opacity-100"
              title={videoMuted ? "Unmute audio" : "Mute audio"}
            >
              {videoMuted ? "🔊 Unmute" : "🔇 Mute"}
            </button>
          </div>

          {/* Booking Card */}
          <div className="bg-gray-900/60 border border-gray-700 rounded-lg p-8 h-fit">
            <h3 className="text-2xl font-bold text-white mb-6">Your Experience</h3>

            {/* Faux Booking Embed Placeholder */}
            <div className="bg-black/40 border border-dashed border-gray-600 rounded-lg p-8 mb-8">
              <div className="text-center text-gray-500 text-sm">
                <p className="mb-4">📅 Real booking embed will appear here</p>
                <p className="text-xs">This is a placeholder for the actual booking system</p>
              </div>
            </div>

            {/* Rider Selection */}
            <div className="mb-8">
              <h4 className="text-lg font-bold text-white mb-4">Select Your Package</h4>
              <div className="space-y-3">
                <button
                  onClick={() => setRiderCount(1)}
                  className={`w-full text-left p-4 border rounded-lg transition-colors ${
                    riderCount === 1
                      ? "border-ennis-orange bg-ennis-orange/10"
                      : "border-gray-700 hover:border-ennis-orange/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white">1 Rider</div>
                      <div className="text-sm text-gray-400">Solo Experience</div>
                    </div>
                    <div className="text-ennis-orange font-bold">${pricePerRider}</div>
                  </div>
                </button>

                <button
                  onClick={() => setRiderCount(2)}
                  className={`w-full text-left p-4 border rounded-lg transition-colors ${
                    riderCount === 2
                      ? "border-ennis-orange bg-ennis-orange/10"
                      : "border-gray-700 hover:border-ennis-orange/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white">2 Riders</div>
                      <div className="text-sm text-gray-400">You + One Rider</div>
                    </div>
                    <div className="text-ennis-orange font-bold">${pricePerRider * 2}</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Duration Info */}
            <div className="bg-ennis-orange/10 border border-ennis-orange/30 rounded-lg p-4 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Duration</p>
                  <p className="text-white font-bold">2 Hours</p>
                </div>
                <div className="text-3xl">⏱️</div>
              </div>
            </div>

            {/* What's Included */}
            <div className="mb-8">
              <h4 className="font-bold text-white mb-3">What's Included</h4>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-ennis-orange font-bold">✓</span>
                  <span>Polaris Slingshot SLR Rental (2 hours)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-ennis-orange font-bold">✓</span>
                  <span>All Fuel Included</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-ennis-orange font-bold">✓</span>
                  <span>Comprehensive Insurance Coverage</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-ennis-orange font-bold">✓</span>
                  <span>2026 Bluebonnet Trail Map</span>
                </li>
              </ul>
            </div>

            {/* Price Summary */}
            <div className="border-t border-gray-700 pt-4 mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Base Price ({riderCount} Rider{riderCount > 1 ? 's' : ''})</span>
                <span className="text-white font-bold">${totalPrice}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-white pt-2">
                <span>Total</span>
                <span className="text-ennis-orange">${totalPrice}</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">Fully rescheduled 7 days prior to booking</p>
            </div>

            {/* CTA Button */}
            <a
              href={riderCount === 1 ? "https://ennissling.as.me/?appointmentType=91042979" : "https://ennissling.as.me/?appointmentType=91043037"}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-6 bg-ennis-orange hover:bg-ennis-orange-bright text-ennis-dark font-bold text-base rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl text-center"
            >
              Continue to Booking
            </a>
          </div>
        </div>

        {/* Important Note */}
        <div className="mt-12 bg-blue-900/20 border border-blue-500/30 rounded-lg p-6 max-w-5xl mx-auto">
          <p className="text-blue-200 text-sm leading-relaxed">
            <strong>Note:</strong> All riders must be approved by our insurance company to drive. A verification link will be sent to your email after booking. If approval is not granted, your booking will be fully refunded.
          </p>
        </div>
      </div>
    </section>
  );
}

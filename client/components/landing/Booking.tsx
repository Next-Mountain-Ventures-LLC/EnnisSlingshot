import { useState, useEffect } from "react";

export function Booking() {
  const [riderCount, setRiderCount] = useState(1);
  const [videoMuted, setVideoMuted] = useState(true);
  const [showScheduler, setShowScheduler] = useState(false);

  const totalPrice = riderCount === 1 ? 79 : 149;

  // Load the Acuity embed script when scheduler is shown
  useEffect(() => {
    if (showScheduler) {
      const script = document.createElement('script');
      script.src = 'https://embed.acuityscheduling.com/js/embed.js';
      script.type = 'text/javascript';
      document.body.appendChild(script);
    }
  }, [showScheduler]);

  const handleBackClick = () => {
    setShowScheduler(false);
  };

  const handleContinueClick = () => {
    setShowScheduler(true);
    // Scroll to the scheduler section
    setTimeout(() => {
      const schedulerElement = document.getElementById('acuity-scheduler');
      if (schedulerElement) {
        schedulerElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

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

        <div>
          {/* Video - Over */}
          <div className="w-full aspect-video bg-gray-900 rounded-lg border border-gray-700 overflow-hidden relative group mb-12">
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

          {/* Scheduling Section - Under */}
          <div id="acuity-scheduler" className="bg-gray-900/60 border border-gray-700 rounded-lg p-8">
            {!showScheduler ? (
              <>
                {/* Selection UI */}
                {/* Rider Selection */}
                <div className="mb-8">
                  <h4 className="text-lg font-bold text-white mb-4 text-center">Book Your Experience</h4>
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
                        <div className="text-ennis-orange font-bold">$79</div>
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
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="font-bold text-white">2 Riders</div>
                          <div className="text-sm text-gray-400">You + One Rider</div>
                        </div>
                        <div className="text-ennis-orange font-bold">$149</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 line-through">$158</span>
                        <span className="inline-block px-2 py-1 bg-ennis-orange/20 border border-ennis-orange rounded text-ennis-orange text-xs font-semibold">Save $9</span>
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

                {/* Helmet Rentals Add-On Info */}
                <div className="mb-8 bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">
                    🎧 Bluetooth communication helmets available for add-on.
                  </p>
                </div>

                {/* Price Summary */}
                <div className="border-t border-gray-700 pt-4 mb-6">
                  <div className="flex justify-between text-lg font-bold text-white mb-4">
                    <span>Total Price</span>
                    <span className="text-ennis-orange">${totalPrice}</span>
                  </div>
                  <p className="text-xs text-gray-500">Fully rescheduled 7 days prior to booking</p>
                </div>

                {/* CTA Button */}
                <button
                  onClick={handleContinueClick}
                  className="w-full py-6 bg-ennis-orange hover:bg-ennis-orange-bright text-ennis-dark font-bold text-base rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl"
                >
                  Continue to Booking
                </button>
              </>
            ) : (
              <>
                {/* Back Button */}
                <button
                  onClick={handleBackClick}
                  className="mb-2 px-4 py-2 border border-ennis-orange text-ennis-orange hover:bg-ennis-orange hover:text-ennis-dark font-bold rounded-lg transition-all"
                >
                  ← Back to Selection
                </button>

                {/* Acuity Scheduling Embed */}
                <div className="bg-gray-800/50 rounded-lg overflow-hidden">
                  <iframe
                    src={riderCount === 1 ? "https://app.acuityscheduling.com/schedule.php?owner=13113355&appointmentType=91042979&ref=embedded_csp" : "https://app.acuityscheduling.com/schedule.php?owner=13113355&appointmentType=91043037&ref=embedded_csp"}
                    title="Schedule Appointment"
                    width="100%"
                    height="800"
                    frameBorder="0"
                    allow="payment"
                    style={{ display: 'block' }}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Important Note */}
        <div className="mt-12 bg-blue-900/20 border border-blue-500/30 rounded-lg p-6">
          <p className="text-blue-200 text-sm leading-relaxed">
            <strong>Note:</strong> All riders must be approved by our insurance company to drive. A verification link will be sent to your email after booking. If approval is not granted, your booking will be fully refunded.
          </p>
        </div>
      </div>
    </section>
  );
}

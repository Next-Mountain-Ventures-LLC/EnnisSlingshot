import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { vehicleSpec, horsepowerRangeLabel, torqueRangeLabel } from "@shared/vehicle-spec";
import { RIDE_PHOTOS } from "@/lib/ridePhotos";
import { ClickToPlayYouTube } from "@/components/shared/ClickToPlayVideo";

const maxHorsepower = Math.max(...vehicleSpec.hpByTrim.map((t) => t.horsepower));

export function YourRide() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const goToPrevious = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? RIDE_PHOTOS.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setCurrentImageIndex((prev) =>
      prev === RIDE_PHOTOS.length - 1 ? 0 : prev + 1
    );
  };
  // Specs come from shared/vehicle-spec.ts (single source of truth).
  const specs = [
    { label: "Engine", value: vehicleSpec.engineShort },
    { label: "Horsepower", value: horsepowerRangeLabel() },
    { label: "Torque", value: torqueRangeLabel() },
    { label: "Transmission", value: "AutoDrive automated manual (no clutch)" },
    { label: "Wheels", value: `${vehicleSpec.wheels} (2 front, 1 rear)` },
    { label: "Seats", value: vehicleSpec.seatingLabel },
    { label: "License Required", value: vehicleSpec.licenseNote, fullWidth: true },
  ];

  return (
    <section className="py-20 md:py-32 bg-gradient-to-b from-ennis-dark to-ennis-darker">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            Your Ride: <span className="text-ennis-orange">{vehicleSpec.displayName}</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            The ultimate 3-wheeled adrenaline machine. Engineered for performance, designed for thrills.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start mb-16">
          {/* Image Carousel */}
          <div className="relative">
            <div
              className="w-full aspect-[4/3] bg-gray-900 rounded-lg border border-gray-700 overflow-hidden relative"
              role="group"
              aria-roledescription="carousel"
              aria-label="Photos of our Polaris Slingshots"
            >
              <img
                src={RIDE_PHOTOS[currentImageIndex].src}
                alt={RIDE_PHOTOS[currentImageIndex].alt}
                width={1242}
                height={745}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
              />

              {/* Navigation Buttons — 44px targets */}
              <button
                type="button"
                onClick={goToPrevious}
                aria-label="Previous photo"
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-black/50 hover:bg-black/75 text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ennis-orange"
              >
                <ChevronLeft className="h-6 w-6" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={goToNext}
                aria-label="Next photo"
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-black/50 hover:bg-black/75 text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ennis-orange"
              >
                <ChevronRight className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            {/* Image Counter */}
            <div className="text-center mt-4 text-gray-400 text-sm" aria-live="polite">
              {currentImageIndex + 1} of {RIDE_PHOTOS.length}
            </div>
          </div>

          {/* Specs Grid */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-6">Specifications</h3>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {specs.map((spec, idx) => (
                <div key={idx} className={`min-w-0 bg-gray-900/50 border border-gray-700 rounded-lg p-3 sm:p-4 hover:border-ennis-orange/50 transition-colors ${spec.fullWidth ? 'col-span-2' : ''}`}>
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">{spec.label}</p>
                  <p className="text-white font-bold text-base sm:text-lg">{spec.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-gray-900/40 border border-gray-700 rounded-lg p-6 md:p-12">
          <h3 className="text-2xl font-bold text-white mb-6">Why Choose the Polaris Slingshot?</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h4 className="text-ennis-orange font-bold mb-2 text-lg">⚡ High Performance</h4>
              <p className="text-gray-300">
                A {vehicleSpec.engine} making up to {maxHorsepower} hp in a three-wheel, open-cockpit autocycle — real performance, no motorcycle license needed.
              </p>
            </div>
            <div>
              <h4 className="text-ennis-orange font-bold mb-2 text-lg">🛡️ Safety First</h4>
              <p className="text-gray-300">
                All riders benefit from comprehensive insurance coverage included with your rental, with a $500 max out of pocket for vehicle damage or theft. All drivers are approved through our insurance partner right after you book.
              </p>
            </div>
            <div>
              <h4 className="text-ennis-orange font-bold mb-2 text-lg">🚗 Easy to Drive</h4>
              <p className="text-gray-300">
                The intuitive handling and automatic transmission make this machine accessible to anyone with driving experience.
              </p>
            </div>
          </div>
        </div>

        {/* Featured Video Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">See It in Action</h3>
          {/* Click-to-play: no YouTube request (or cookies) until the visitor presses play. */}
          <ClickToPlayYouTube videoId="agWSnFYUvGI" title="Polaris Slingshot in action" />
        </div>
      </div>
    </section>
  );
}

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { vehicleSpec } from "@shared/vehicle-spec";
import { trackPixel } from "@/lib/consent";

interface PromotionalPopupProps {
  onClose?: () => void;
}

export function PromotionalPopup({ onClose }: PromotionalPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    // Show popup after 8 seconds of page load
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 8000);

    return () => clearTimeout(showTimer);
  }, []);

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleBookNow = () => {
    // Open Acuity booking in new tab
    window.open(
      "https://ennissling.as.me/?appointmentType=92391639",
      "_blank"
    );
    // Meta Pixel Schedule — only sent with marketing consent (client/lib/consent.ts)
    trackPixel('Schedule');
  };

  // If not visible yet (waiting for 8 second delay), don't show anything
  if (!isVisible) return null;

  // Minimized tab version
  if (isMinimized) {
    return (
      <div
        onClick={handleMinimize}
        className="fixed bottom-4 right-4 z-50 cursor-pointer"
      >
        <div className="bg-ennis-orange text-white rounded-full shadow-lg hover:bg-ennis-orange-bright transition-colors flex items-center justify-center w-24 h-24">
          <span className="text-xs font-bold text-center px-2">
            Limited<br />Time<br />Offer
          </span>
        </div>
      </div>
    );
  }

  // Full popup modal
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-gradient-to-b from-ennis-dark to-ennis-darker rounded-lg border border-ennis-orange/30 shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header with minimize button */}
        <div
          className="relative bg-cover bg-center p-4 py-8"
          style={{
            backgroundImage: 'url(https://images.pexels.com/photos/18554232/pexels-photo-18554232.jpeg)',
            backgroundPosition: 'center'
          }}
        >
          {/* Overlay for text readability */}
          <div className="absolute inset-0 bg-black/60"></div>

          <button
            onClick={handleMinimize}
            className="absolute top-3 right-3 p-2 hover:bg-white/20 rounded transition-colors z-20"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Logo */}
          <div className="flex justify-center mb-4 relative z-10">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2F5193f7a05d654f0c98a0a70f48ef2387%2F700b36c4a653482c8265f6619a61ea23?format=webp&width=200"
              alt="Ennis Slingshot Experience Logo"
              width={200}
              height={200}
              decoding="async"
              className="h-20 w-auto drop-shadow-lg"
            />
          </div>

          {/* Urgency banner */}
          <div className="text-center mb-3 relative z-10">
            <div className="inline-block bg-white/20 px-3 py-1 rounded-full mb-2">
              <p className="text-white font-bold text-sm">TODAY ONLY - APRIL 25TH</p>
            </div>
            <h3 className="text-2xl md:text-3xl font-black text-white">
              1-HOUR
              <br />
              <span className="text-white">DRIVE & GO</span>
            </h3>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Price and availability */}
          <div className="text-center">
            <p className="text-5xl font-black text-ennis-orange mb-2">$69.99</p>
            <p className="text-ennis-orange text-lg font-bold">while slots last</p>
          </div>

          {/* Features */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="text-ennis-orange text-xl mt-1">✓</div>
              <div>
                <p className="font-bold text-white">AutoDrive — No Clutch</p>
                <p className="text-gray-300 text-sm">{vehicleSpec.transmissionShort.replace(/^AutoDrive — no clutch, /, "").replace(/^d/, "D")}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-ennis-orange text-xl mt-1">✓</div>
              <div>
                <p className="font-bold text-white">Insurance Included</p>
                <p className="text-gray-300 text-sm">Just give it a try</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-ennis-orange text-xl mt-1">✓</div>
              <div>
                <p className="font-bold text-white">No Experience Needed</p>
                <p className="text-gray-300 text-sm">Anyone can do it</p>
              </div>
            </div>
          </div>

          {/* Tagline */}
          <div className="text-center border-t border-gray-700 pt-4">
            <p className="text-ennis-orange font-bold text-lg">
              Easy. Fun. Unforgettable.
            </p>
            <p className="text-gray-400 text-sm">See Texas Like Never Before!</p>
          </div>

          {/* CTA Button */}
          <Button
            onClick={handleBookNow}
            className="w-full bg-ennis-orange hover:bg-ennis-orange-bright text-white font-bold py-3 text-base h-auto rounded-lg transition-all"
          >
            Book Now
          </Button>
        </div>
      </div>
    </div>
  );
}

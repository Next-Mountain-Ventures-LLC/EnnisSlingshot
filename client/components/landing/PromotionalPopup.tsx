import { useState, useEffect } from "react";
import { X, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PromotionalPopupProps {
  onClose?: () => void;
}

export function PromotionalPopup({ onClose }: PromotionalPopupProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasBeenClosed, setHasBeenClosed] = useState(false);

  useEffect(() => {
    // Auto-minimize popup after 8 seconds (rather than showing full for 8 seconds)
    const timer = setTimeout(() => {
      if (!hasBeenClosed) {
        setIsMinimized(true);
      }
    }, 8000);

    return () => clearTimeout(timer);
  }, [hasBeenClosed]);

  const handleClose = () => {
    setHasBeenClosed(true);
    setIsMinimized(false);
    onClose?.();
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleBookNow = () => {
    // Open Acuity booking in new tab
    window.open(
      "https://ennissling.as.me/?appointmentType=92391639",
      "_blank"
    );
    // Track the Schedule event for Meta Pixel
    if (window.fbq) {
      fbq('track', 'Schedule');
    }
  };

  // If completely closed (X button), don't show anything
  if (hasBeenClosed) return null;

  // Minimized tab version
  if (isMinimized) {
    return (
      <div
        onClick={handleMinimize}
        className="fixed bottom-4 right-4 z-50 cursor-pointer"
      >
        <div className="bg-ennis-orange text-white rounded-full shadow-lg hover:bg-ennis-orange-bright transition-colors flex items-center justify-center w-14 h-14">
          <span className="text-xs font-bold text-center px-1">
            Limited<br />Offer
          </span>
        </div>
      </div>
    );
  }

  // Full popup modal
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-gradient-to-b from-ennis-dark to-ennis-darker rounded-lg border border-ennis-orange/30 shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header with close button */}
        <div className="relative bg-gradient-to-r from-ennis-orange to-ennis-orange-bright p-6">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Urgency banner */}
          <div className="text-center mb-3">
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
            <p className="text-ennis-orange text-lg font-bold">ALL SLOTS AVAILABLE</p>
          </div>

          {/* Features */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="text-ennis-orange text-xl mt-1">✓</div>
              <div>
                <p className="font-bold text-white">Fully Automatic</p>
                <p className="text-gray-300 text-sm">Drives like a car</p>
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

          {/* Minimize option */}
          <button
            onClick={handleMinimize}
            className="w-full flex items-center justify-center gap-2 text-gray-400 hover:text-white text-sm transition-colors"
          >
            <ChevronUp className="w-4 h-4" />
            Minimize
          </button>
        </div>
      </div>
    </div>
  );
}

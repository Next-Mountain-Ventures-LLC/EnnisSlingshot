import { useRef, useState } from "react";
import { Hero } from "@/components/landing/Hero";
import { YourRide } from "@/components/landing/YourRide";
import { Trails } from "@/components/landing/Trails";
import { Booking } from "@/components/landing/Booking";
// import { MoreInfo } from "@/components/landing/MoreInfo"; // Hidden for now
import { FAQ } from "@/components/landing/FAQ";
import { Contact } from "@/components/landing/Contact";
import { PromotionalPopup } from "@/components/landing/PromotionalPopup";

export default function Index() {
  const bookingRef = useRef<HTMLDivElement>(null);
  const [showPopup, setShowPopup] = useState(true);

  const scrollToBooking = () => {
    // Scroll to the booking header with title at the top of the viewport
    const bookingHeader = document.getElementById('booking-header');
    if (bookingHeader) {
      bookingHeader.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="w-full bg-ennis-dark">
      {/* Promotional Popup - Disabled for now, can be re-enabled later */}
      {/* {showPopup && <PromotionalPopup onClose={() => setShowPopup(false)} />} */}

      {/* Hero Section */}
      <Hero onBookingClick={scrollToBooking} />

      {/* Your Ride Section */}
      <YourRide />

      {/* Trails Section */}
      <Trails />

      {/* Booking Section */}
      <div ref={bookingRef}>
        <Booking />
      </div>

      {/* More Info Section - Hidden for now */}
      {/* <MoreInfo /> */}

      {/* FAQ Section */}
      <FAQ />

      {/* Contact & Footer */}
      <Contact />
    </div>
  );
}

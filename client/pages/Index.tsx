import { useRef } from "react";
import { Hero } from "@/components/landing/Hero";
import { YourRide } from "@/components/landing/YourRide";
import { Trails } from "@/components/landing/Trails";
import { Booking } from "@/components/landing/Booking";
// import { MoreInfo } from "@/components/landing/MoreInfo"; // Hidden for now
import { FAQ } from "@/components/landing/FAQ";
import { Contact } from "@/components/landing/Contact";

export default function Index() {
  const bookingRef = useRef<HTMLDivElement>(null);

  const scrollToBooking = () => {
    // Scroll to the booking header (which is below the video)
    const bookingHeader = document.getElementById('booking-header');
    if (bookingHeader) {
      bookingHeader.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div className="w-full bg-ennis-dark">
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

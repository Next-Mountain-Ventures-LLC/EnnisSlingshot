import { useRef } from "react";
import { Hero } from "@/components/landing/Hero";
import { YourRide } from "@/components/landing/YourRide";
import { Trails } from "@/components/landing/Trails";
import { Booking } from "@/components/landing/Booking";
import { MoreInfo } from "@/components/landing/MoreInfo";
import { FAQ } from "@/components/landing/FAQ";
import { Contact } from "@/components/landing/Contact";

export default function Index() {
  const bookingRef = useRef<HTMLDivElement>(null);

  const scrollToBooking = () => {
    bookingRef.current?.scrollIntoView({ behavior: "smooth" });
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

      {/* More Info Section */}
      <MoreInfo />

      {/* FAQ Section */}
      <FAQ />

      {/* Contact & Footer */}
      <Contact />
    </div>
  );
}

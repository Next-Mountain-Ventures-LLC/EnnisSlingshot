import { useRef, useState } from "react";
import { Hero } from "@/components/landing/Hero";
import { YourRide } from "@/components/landing/YourRide";
import { Trails } from "@/components/landing/Trails";
import { Booking } from "@/components/landing/Booking";
// import { MoreInfo } from "@/components/landing/MoreInfo"; // Hidden for now
import { FAQ } from "@/components/landing/FAQ";
import { PromotionalPopup } from "@/components/landing/PromotionalPopup";
import { Seo } from "@/components/seo/Seo";
import { localBusiness, organization, webSite, service } from "@/lib/schema";
import { business } from "@shared/business";

/** Packages as published on the site today (CLAUDE.md "facts that must never drift"). */
const HOME_PACKAGES = [
  { name: "1-Hour Drive & Go", price: 69.99, url: "/slingshot-rental/drive-and-go/" },
  { name: "2-Hour Bluebonnet Trail Experience — Solo", price: 79, url: "/slingshot-rental/bluebonnet-trail-experience/" },
  { name: "2-Hour Bluebonnet Trail Experience — Driver + Rider", price: 149, url: "/slingshot-rental/bluebonnet-trail-experience/" },
];

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
      <Seo
        title="Tour the Bluebonnet Trails in a Slingshot, Only $79.00!"
        description="It's time for an adventure! Drive a Polaris Slingshot through the Ennis Bluebonnet Trails — 35 minutes south of Dallas. Insurance included, no motorcycle license needed."
        canonicalPath="/"
        ogImage={business.image}
        jsonLd={[
          localBusiness(),
          organization(),
          webSite(),
          service({
            name: "Ennis Slingshot Experience packages",
            description:
              "Self-drive Polaris Slingshot experiences on the Ennis Bluebonnet Trails: 1-hour Drive & Go and the 2-hour Bluebonnet Trail Experience.",
            path: "/slingshot-rental/",
            packages: HOME_PACKAGES,
          }),
        ]}
      />

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

      {/* Contact & Footer is rendered by SiteLayout on every route */}
    </div>
  );
}

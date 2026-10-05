import { Hero } from "@/components/landing/Hero";
import { YourRide } from "@/components/landing/YourRide";
import { Trails } from "@/components/landing/Trails";
import { Booking } from "@/components/landing/Booking";
import { FAQ } from "@/components/landing/FAQ";
import { Seo } from "@/components/seo/Seo";
import { localBusiness, organization, webSite, service } from "@/lib/schema";
import { business } from "@shared/business";
import { PACKAGES, bookHref } from "@shared/booking";

/** The bookable packages (shared/booking.ts) for the home Service/OfferCatalog JSON-LD. */
const HOME_PACKAGES = PACKAGES.map((p) => ({
  name: p.name,
  price: p.price,
  description: p.description,
  url: bookHref(p.id),
}));

export default function Index() {
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

      {/* Hero Section */}
      <Hero onBookingClick={scrollToBooking} />

      {/* Your Ride Section */}
      <YourRide />

      {/* Trails Section */}
      <Trails />

      {/* Booking Section (#booking-header) */}
      <Booking />

      {/* FAQ Section */}
      <FAQ />

      {/* Contact & Footer is rendered by SiteLayout on every route */}
    </div>
  );
}

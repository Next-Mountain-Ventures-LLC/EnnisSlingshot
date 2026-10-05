/**
 * Home booking section: the "Book Your Experience" heading (#booking-header —
 * the hero and the mobile StickyBookBar scroll here), the shared package
 * picker + Acuity scheduler (BookingWidget), then a click-to-play video.
 */
import { ClickToPlayVideo } from "@/components/shared/ClickToPlayVideo";
import { BookingWidget } from "@/components/booking/BookingWidget";
import { HERO_VIDEO } from "@/lib/media";

export function Booking() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-ennis-darker to-ennis-dark">
      <div className="container mx-auto px-4">
        {/* scroll-mt adds breathing room on top of the html scroll-padding for the sticky header */}
        <div id="booking-header" className="mx-auto mb-10 max-w-3xl scroll-mt-4 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            Book Your <span className="text-ennis-orange">Experience</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Pick a package, then choose your April date and time.
          </p>
        </div>

        <BookingWidget className="mx-auto max-w-3xl" />

        {/* Video — click-to-play so the (shared) hero file is only fetched once, and only on demand here */}
        <ClickToPlayVideo
          sources={HERO_VIDEO.sources}
          poster={HERO_VIDEO.poster}
          width={HERO_VIDEO.width}
          height={HERO_VIDEO.height}
          label="Play the Ennis Slingshot Experience video"
          className="mx-auto mt-16 max-w-3xl"
        />
      </div>
    </section>
  );
}

export default Booking;

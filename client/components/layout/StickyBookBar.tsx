/**
 * Mobile-only fixed bottom "Book" CTA. On the home page it scrolls to the
 * booking section (#booking-header) and steps aside while the booking card
 * itself is on screen; elsewhere it links to /book/. Hidden on /book/, where
 * the scheduler is already on screen.
 */
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

export function isBookPath(pathname: string): boolean {
  return pathname.replace(/\/+$/, "") === "/book";
}

/** id of the BookingWidget card on the home page (client/components/booking/BookingWidget.tsx). */
const HOME_BOOKING_CARD_ID = "acuity-scheduler";

export function StickyBookBar() {
  const { pathname } = useLocation();
  const onHome = pathname === "/";
  const [bookingInView, setBookingInView] = useState(false);

  useEffect(() => {
    setBookingInView(false);
    if (!onHome || typeof IntersectionObserver === "undefined") return;
    const el = document.getElementById(HOME_BOOKING_CARD_ID);
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setBookingInView(entry.isIntersecting));
    observer.observe(el);
    return () => observer.disconnect();
  }, [onHome]);

  if (isBookPath(pathname) || bookingInView) return null;

  const scrollToBooking = (e: React.MouseEvent) => {
    if (!onHome) return;
    const el = document.getElementById("booking-header");
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div
      className="md:hidden fixed inset-x-0 bottom-0 z-40 border-t border-gray-700 bg-ennis-dark/95 backdrop-blur-sm px-4 py-3"
      style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
    >
      <Link
        to={onHome ? "/#booking-header" : "/book/"}
        onClick={scrollToBooking}
        className="btn-primary w-full"
      >
        Book Your Experience
      </Link>
    </div>
  );
}

export default StickyBookBar;

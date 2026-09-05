/**
 * Mobile-only fixed bottom "Book" CTA. On the home page it scrolls to the
 * booking section; elsewhere it links to /book/ (falling back to the home
 * booking section until that page exists).
 */
import { Link, useLocation } from "react-router-dom";
import { getPage } from "@/lib/pages";

const hasBookPage = Boolean(getPage("/book/"));

export function StickyBookBar() {
  const { pathname } = useLocation();
  const onHome = pathname === "/";
  const target = hasBookPage ? "/book/" : "/#booking-header";

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
        to={onHome ? "/#booking-header" : target}
        onClick={scrollToBooking}
        className="block w-full text-center py-3 bg-ennis-orange hover:bg-ennis-orange-bright text-ennis-dark font-bold rounded-lg transition-all"
      >
        Book Your Experience
      </Link>
    </div>
  );
}

export default StickyBookBar;

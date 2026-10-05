import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

/** Global nav per LINKING-CONVENTIONS.md: Experiences · Bluebonnets · Ennis · Blog · FAQ · Book (CTA). */
export const NAV_ITEMS = [
  { label: "Experiences", to: "/slingshot-rental/" },
  { label: "Bluebonnets", to: "/bluebonnets/" },
  { label: "Ennis", to: "/ennis/" },
  { label: "Blog", to: "/blog/" },
  { label: "FAQ", to: "/faq/" },
] as const;

export const BOOK_ITEM = { label: "Book", to: "/book/" } as const;

const LOGO_SRC =
  "/logo-112.png";

export function Header() {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const { pathname } = useLocation();

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Escape closes the mobile menu and returns focus to the toggle.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      toggleRef.current?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `whitespace-nowrap text-sm font-semibold uppercase tracking-wider transition-colors ${
      isActive ? "text-ennis-orange" : "text-gray-300 hover:text-white"
    }`;

  return (
    <header className="sticky top-0 z-50 w-full bg-ennis-dark/95 backdrop-blur-sm border-b border-gray-700">
      <div className="container mx-auto px-4 py-3 md:py-4 flex items-center justify-between gap-4 lg:gap-6">
        {/* Logo — fixed box so a slow/failed image can't squash the alt text or shift the nav */}
        <Link
          to="/"
          className="flex min-w-0 shrink-0 items-center gap-3 hover:opacity-90 transition-opacity"
          aria-label="Ennis Slingshot Experience — home"
        >
          <img
            src={LOGO_SRC}
            alt="Ennis Slingshot Experience"
            width={56}
            height={56}
            className="h-10 w-10 md:h-14 md:w-14 shrink-0 object-contain"
          />
          {/* Wordmark: phones + desktop. Hidden 768–1023px so the full nav fits on one line. */}
          <span className="hidden sm:block md:hidden lg:block whitespace-nowrap">
            <span className="block text-white font-black text-lg leading-tight">ENNIS</span>
            <span className="block text-ennis-orange text-xs font-semibold">Slingshot Experience</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Primary" className="hidden md:flex items-center gap-4 lg:gap-6">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass}>
              {item.label}
            </NavLink>
          ))}
          <Link
            to={BOOK_ITEM.to}
            className="whitespace-nowrap px-4 lg:px-5 py-2 bg-ennis-orange hover:bg-ennis-orange-bright text-ennis-dark font-bold rounded-lg transition-colors text-sm uppercase tracking-wider"
          >
            {BOOK_ITEM.label}
          </Link>
        </nav>

        {/* Mobile toggle */}
        <button
          ref={toggleRef}
          type="button"
          className="md:hidden -mr-2 p-2 text-gray-300 hover:text-white"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/*
        Mobile nav — kept in the DOM (hidden attribute) so links are crawlable. It drops down
        over the page (absolute) so opening it doesn't shift the scroll position.
      */}
      <nav
        id="mobile-nav"
        aria-label="Primary mobile"
        hidden={!open}
        className="md:hidden absolute inset-x-0 top-full max-h-[calc(100vh-4rem)] overflow-y-auto border-y border-gray-700 bg-ennis-dark shadow-2xl"
      >
        <ul className="container mx-auto px-4 py-3 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `block py-2.5 text-base font-semibold ${isActive ? "text-ennis-orange" : "text-gray-200"}`
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
          <li className="pt-2">
            <Link
              to={BOOK_ITEM.to}
              onClick={() => setOpen(false)}
              className="block text-center py-3 bg-ennis-orange text-ennis-dark font-bold rounded-lg"
            >
              {BOOK_ITEM.label} Your Experience
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;

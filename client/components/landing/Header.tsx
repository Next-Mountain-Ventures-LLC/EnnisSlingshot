import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
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

export function Header() {
  const [open, setOpen] = useState(false);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-semibold uppercase tracking-wider transition-colors ${
      isActive ? "text-ennis-orange" : "text-gray-300 hover:text-white"
    }`;

  return (
    <header className="sticky top-0 z-50 w-full bg-ennis-dark/95 backdrop-blur-sm border-b border-gray-700">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity" aria-label="Ennis Slingshot Experience — home">
          <img
            src="https://cdn.builder.io/api/v1/image/assets%2F5193f7a05d654f0c98a0a70f48ef2387%2F700b36c4a653482c8265f6619a61ea23?format=webp&width=80"
            alt="Ennis Slingshot Experience"
            width={56}
            height={56}
            className="h-12 md:h-14 w-auto"
          />
          <span className="hidden sm:block">
            <span className="block text-white font-black text-lg leading-tight">ENNIS</span>
            <span className="block text-ennis-orange text-xs font-semibold">Slingshot Experience</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Primary" className="hidden md:flex items-center gap-6">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass}>
              {item.label}
            </NavLink>
          ))}
          <Link
            to={BOOK_ITEM.to}
            className="px-5 py-2 bg-ennis-orange hover:bg-ennis-orange-bright text-ennis-dark font-bold rounded-lg transition-all text-sm uppercase tracking-wider"
          >
            {BOOK_ITEM.label}
          </Link>
        </nav>

        {/* Mobile toggle */}
        <button
          type="button"
          className="md:hidden p-2 text-gray-300 hover:text-white"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile nav — kept in the DOM (hidden attribute) so links are crawlable */}
      <nav
        id="mobile-nav"
        aria-label="Primary mobile"
        hidden={!open}
        className="md:hidden border-t border-gray-700 bg-ennis-dark"
      >
        <ul className="container mx-auto px-4 py-3 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `block py-2 text-base font-semibold ${isActive ? "text-ennis-orange" : "text-gray-200"}`
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

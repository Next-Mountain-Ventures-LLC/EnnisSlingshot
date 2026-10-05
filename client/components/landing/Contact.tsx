import { Facebook } from "lucide-react";
import { Link } from "react-router-dom";
import { business, isTodo } from "@shared/business";
import { SignupForm } from "@/components/signup/SignupForm";
import { openConsentBanner } from "@/lib/consent";

/** Year the site was built (vite.config.ts `define`); falls back to the runtime year outside Vite. */
declare const __BUILD_YEAR__: number | undefined;
const COPYRIGHT_YEAR = typeof __BUILD_YEAR__ === "number" ? __BUILD_YEAR__ : new Date().getFullYear();

/** Footer link groups (LINKING-CONVENTIONS.md: hubs + 6 most important spokes). */
const FOOTER_LINKS = {
  hubs: [
    { label: "Slingshot Rental & Experiences", to: "/slingshot-rental/" },
    { label: "Ennis Bluebonnets", to: "/bluebonnets/" },
    { label: "Things to Do in Ennis", to: "/ennis/" },
    { label: "Blog", to: "/blog/" },
  ],
  spokes: [
    { label: "Trail Map", to: "/bluebonnets/trail-map/" },
    { label: "Bloom Tracker", to: "/bluebonnets/bloom-tracker/" },
    { label: "Bluebonnet Festival", to: "/bluebonnets/festival/" },
    { label: "Drive & Go", to: "/slingshot-rental/drive-and-go/" },
    { label: "Pricing", to: "/slingshot-rental/pricing/" },
    { label: "Texas Slingshot Laws", to: "/blog/texas-slingshot-laws/" },
  ],
  support: [
    { label: "About", to: "/about/" },
    { label: "FAQ", to: "/faq/" },
    { label: "Gallery", to: "/gallery/" },
    { label: "Contact", to: "/contact/" },
    { label: "Book", to: "/book/" },
    { label: "Privacy", to: "/privacy/" },
    { label: "Terms", to: "/terms/" },
  ],
};

export function Contact() {
  const facebookUrl = business.facebookUrl;
  const showPhone = !isTodo(business.phone);
  const showEmail = !isTodo(business.email);
  const showStreet = !isTodo(business.address.streetAddress);

  return (
    <footer className="bg-ennis-darker border-t border-gray-700">
      {/* Mailing-list signup — on every page (two-step: email, then phone for texts + $10 off) */}
      <section className="py-14 md:py-20 border-b border-gray-700 bg-gradient-to-br from-ennis-navy/40 via-ennis-darker to-ennis-darker" aria-label="Get festival and trail updates">
        <div className="container mx-auto px-4 max-w-6xl">
          <SignupForm variant="band" source="footer" />
        </div>
      </section>

      {/* NAP + link columns */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4 mb-12">
            {/* NAP block — TODO values (phone / email / street) are hidden, never printed. */}
            <address className="not-italic text-gray-400 text-sm space-y-2 col-span-2 md:col-span-1">
              <p className="text-white font-bold text-base">{business.name}</p>
              <p>
                <span className="text-gray-400 uppercase tracking-widest text-xs block mb-1">Meeting point</span>
                {business.meetingPoint.name}
                <br />
                {business.meetingPoint.streetAddress}
                <br />
                {business.meetingPoint.addressLocality}, {business.meetingPoint.addressRegion}{" "}
                {business.meetingPoint.postalCode}
              </p>
              {showStreet && (
                <p>
                  <span className="text-gray-400 uppercase tracking-widest text-xs block mb-1">Address</span>
                  {business.address.streetAddress}
                  <br />
                  {business.address.addressLocality}, {business.address.addressRegion}{" "}
                  {business.address.postalCode}
                </p>
              )}
              {showPhone && (
                <p>
                  <a href={`tel:${business.phone.replace(/[^+\d]/g, "")}`} className="hover:text-ennis-orange transition-colors">
                    {business.phone}
                  </a>
                </p>
              )}
              {showEmail && (
                <p>
                  <a href={`mailto:${business.email}`} className="hover:text-ennis-orange transition-colors">
                    {business.email}
                  </a>
                </p>
              )}
              <p>
                <span className="text-gray-400 uppercase tracking-widest text-xs block mb-1">Hours</span>
                {business.hours.note}
              </p>
              <p>
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:text-ennis-orange transition-colors"
                >
                  <Facebook className="w-4 h-4" /> Facebook
                </a>
              </p>
            </address>

            <FooterColumn title="Explore" links={FOOTER_LINKS.hubs} />
            <FooterColumn title="Popular" links={FOOTER_LINKS.spokes} />
            <FooterColumn title="Info" links={FOOTER_LINKS.support}>
              <li>
                <button
                  type="button"
                  onClick={openConsentBanner}
                  className="inline-block py-2 text-left text-gray-400 hover:text-ennis-orange transition-colors"
                >
                  Cookie settings
                </button>
              </li>
            </FooterColumn>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-700 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
              <p className="text-center md:text-left">Ennis, Texas — Bluebonnet Capital of Texas</p>

              <div className="text-center md:text-right">
                <p>
                  © {COPYRIGHT_YEAR} {business.name}. All rights reserved.
                </p>
                <p className="mt-2">🌸 2027 season: April 1–30 · Bluebonnet Festival expected April 17–19</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
  children,
}: {
  title: string;
  links: { label: string; to: string }[];
  /** Extra <li> items after the links (e.g. the Cookie settings button). */
  children?: React.ReactNode;
}) {
  return (
    <nav aria-label={title}>
      <p className="text-gray-400 uppercase tracking-widest text-xs mb-1">{title}</p>
      <ul className="text-sm">
        {links.map((l) => (
          <li key={l.to}>
            <Link to={l.to} className="inline-block py-2 text-gray-400 hover:text-ennis-orange transition-colors">
              {l.label}
            </Link>
          </li>
        ))}
        {children}
      </ul>
    </nav>
  );
}

import { Facebook } from "lucide-react";
import { Link } from "react-router-dom";
import { business, isTodo } from "@shared/business";

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
    { label: "Date Night", to: "/slingshot-rental/date-night/" },
    { label: "Gift Cards", to: "/slingshot-rental/gift-cards/" },
    // TODO(2026-09-15): switch to "/blog/texas-slingshot-laws/" once that post has synced from WordPress (it is scheduled for Sep 15) — until then it would 404.
    { label: "Texas Slingshot Laws", to: "/faq/" },
  ],
  support: [
    { label: "About", to: "/about/" },
    { label: "FAQ", to: "/faq/" },
    { label: "Reviews", to: "/reviews/" },
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

  const handleFacebookShare = () => {
    // Share Facebook page to Facebook
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(facebookUrl)}`;
    window.open(shareUrl, "_blank", "width=600,height=400");
  };

  return (
    <footer className="bg-ennis-darker border-t border-gray-700">
      {/* Share Section */}
      <section className="py-16 md:py-20 border-b border-gray-700">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
            Share the <span className="text-ennis-orange">Thrill</span>
          </h2>
          <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
            Invite your friends and family to experience the adrenaline rush of a lifetime. Let them book their Slingshot adventure today.
          </p>

          <button
            onClick={handleFacebookShare}
            className="px-8 py-6 bg-[#1877F2] hover:bg-[#165FE5] text-white font-bold text-lg rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl inline-flex items-center gap-3"
          >
            <Facebook className="w-6 h-6" />
            Share on Facebook
          </button>
        </div>
      </section>

      {/* NAP + link columns */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid gap-10 md:grid-cols-4 mb-12">
            {/* NAP block — TODO values (phone / email / street) are hidden, never printed. */}
            <address className="not-italic text-gray-400 text-sm space-y-2 md:col-span-1">
              <p className="text-white font-bold text-base">{business.name}</p>
              <p>
                <span className="text-gray-500 uppercase tracking-widest text-xs block mb-1">Meeting point</span>
                {business.meetingPoint.name}
                <br />
                {business.meetingPoint.streetAddress}
                <br />
                {business.meetingPoint.addressLocality}, {business.meetingPoint.addressRegion}{" "}
                {business.meetingPoint.postalCode}
              </p>
              {showStreet && (
                <p>
                  <span className="text-gray-500 uppercase tracking-widest text-xs block mb-1">Address</span>
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
                <span className="text-gray-500 uppercase tracking-widest text-xs block mb-1">Hours</span>
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
            <FooterColumn title="Info" links={FOOTER_LINKS.support} />
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-700 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-center md:text-left">
                <h4 className="text-white font-bold mb-1">ENNIS SLINGSHOT EXPERIENCE</h4>
                <p className="text-gray-500 text-sm">
                  Ennis, Texas — Bluebonnet Capital of Texas
                </p>
              </div>

              <div className="text-gray-500 text-sm text-center">
                <p>© 2026 Ennis Slingshot Experience. All rights reserved.</p>
                <p className="mt-2">🌸 2027 bluebonnet season: April 1–30 — bookings open this winter</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { label: string; to: string }[] }) {
  return (
    <nav aria-label={title}>
      <p className="text-gray-500 uppercase tracking-widest text-xs mb-3">{title}</p>
      <ul className="space-y-2 text-sm">
        {links.map((l) => (
          <li key={l.to}>
            <Link to={l.to} className="text-gray-400 hover:text-ennis-orange transition-colors">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

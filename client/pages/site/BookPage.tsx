/**
 * /book/ — where every Book button leads. The package picker + Acuity
 * scheduler (BookingWidget) comes first, right under the H1, in #booking;
 * /book/?package=solo|two-up|drive-and-go preselects a package after mount.
 * book.md's "How booking works" etc. follow. No CTA strip/banner here (the
 * scheduler is the CTA); the sidebar holds the practical details instead.
 */
import { Link } from "react-router-dom";
import { Check, Mail, MapPin } from "lucide-react";
import type { SitePage } from "@/lib/pages";
import { business } from "@shared/business";
import { BookingWidget } from "@/components/booking/BookingWidget";
import { IslandPageShell } from "./IslandPageShell";

export function BookPage({ page }: { page: SitePage }) {
  return (
    <IslandPageShell
      page={page}
      beforeBody={
        <div id="booking" className="scroll-mt-4">
          <BookingWidget />
        </div>
      }
      aside={<BookingFacts />}
    />
  );
}

function BookingFacts() {
  const mp = business.meetingPoint;
  const icon = "mt-0.5 h-4 w-4 shrink-0 text-ennis-orange";
  return (
    <section
      aria-labelledby="booking-facts-heading"
      className="rounded-lg border border-gray-700 bg-gray-900/60 p-5 text-sm leading-relaxed text-gray-300"
    >
      <h2 id="booking-facts-heading" className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">
        Good to know
      </h2>
      <ul className="space-y-3">
        <li className="flex gap-2">
          <MapPin className={icon} aria-hidden="true" />
          <span>
            Meet us at the <strong className="text-white">{mp.name}</strong>, {mp.streetAddress}, {mp.addressLocality} —
            15 minutes before your time slot.
          </span>
        </li>
        <li className="flex gap-2">
          <Check className={icon} aria-hidden="true" />
          <span>
            A valid driver's license is all you need — no motorcycle license.{" "}
            <Link to="/slingshot-rental/requirements/" className="text-ennis-orange hover:text-ennis-orange-bright">
              Requirements
            </Link>
          </span>
        </li>
        <li className="flex gap-2">
          <Check className={icon} aria-hidden="true" />
          <span>Insurance included ($500 max out of pocket). No deposit.</span>
        </li>
        <li className="flex gap-2">
          <Mail className={icon} aria-hidden="true" />
          <span>
            Questions before you book?{" "}
            <a href={`mailto:${business.email}`} className="text-ennis-orange hover:text-ennis-orange-bright">
              Email us
            </a>
            .
          </span>
        </li>
      </ul>
    </section>
  );
}

export default BookPage;

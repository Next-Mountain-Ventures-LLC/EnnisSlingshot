/**
 * The packages that can actually be booked today (Acuity appointment types),
 * and helpers for linking to them. Single source for the /book/ scheduler,
 * package deep links (/book/?package=<id>) and price tables.
 *
 * Proposed packages (Golden Hour Date Night, Group Convoy, Festival Weekend
 * Ride, photo add-on, gift certificates) are NOT listed here until they exist
 * in Acuity — see the owner to-do list.
 */
import { business } from "./business";

export type PackageId = "drive-and-go" | "solo" | "two-up";

export interface BookablePackage {
  id: PackageId;
  /** Public name — keep identical everywhere (tables, widget, JSON-LD). */
  name: string;
  /** Short label for compact UI ("Solo", "Driver + Rider", "Drive & Go"). */
  shortName: string;
  price: number;
  priceLabel: string;
  duration: string;
  riders: string;
  description: string;
  /** Info page for the package. */
  detailPath: string;
  appointmentType: string;
}

export const PACKAGES: readonly BookablePackage[] = [
  {
    id: "solo",
    name: "Bluebonnet Trail Experience — Solo",
    shortName: "Solo",
    price: 79,
    priceLabel: "$79",
    duration: "2 hours",
    riders: "1 driver",
    description: "Orientation, safety briefing and a self-drive curated route through the Ennis Bluebonnet Trails.",
    detailPath: "/slingshot-rental/bluebonnet-trail-experience/",
    appointmentType: business.booking.soloAppointmentType,
  },
  {
    id: "two-up",
    name: "Bluebonnet Trail Experience — Driver + Rider",
    shortName: "Driver + Rider",
    price: 149,
    priceLabel: "$149",
    duration: "2 hours",
    riders: "1 driver + 1 passenger",
    description: "The full 2-hour trail experience for two. Only the driver needs insurance approval.",
    detailPath: "/slingshot-rental/bluebonnet-trail-experience/",
    appointmentType: business.booking.twoUpAppointmentType,
  },
  {
    id: "drive-and-go",
    name: "Drive & Go",
    shortName: "Drive & Go",
    price: 69.99,
    priceLabel: "$69.99",
    duration: "1 hour",
    riders: "1 driver",
    description: "A quick 1-hour drive — fully automatic, insurance included, no experience needed.",
    detailPath: "/slingshot-rental/drive-and-go/",
    appointmentType: business.booking.driveAndGoAppointmentType,
  },
];

export const DEFAULT_PACKAGE: PackageId = "solo";

export function getPackage(id: PackageId): BookablePackage {
  return PACKAGES.find((p) => p.id === id) ?? PACKAGES[0];
}

/** Deep link into the /book/ scheduler, optionally preselecting a package. */
export function bookHref(id?: PackageId): string {
  return id ? `/book/?package=${id}` : "/book/";
}

/** Read ?package= (accepts a few aliases); null when absent/unknown. */
export function packageFromQuery(value: string | null | undefined): PackageId | null {
  const v = (value ?? "").trim().toLowerCase();
  if (!v) return null;
  if (["solo", "1", "driver"].includes(v)) return "solo";
  if (["two-up", "two-person", "driver-rider", "driver-plus-rider", "2", "couple"].includes(v)) return "two-up";
  if (["drive-and-go", "drive-go", "1-hour", "hour"].includes(v)) return "drive-and-go";
  return null;
}

/** Acuity embed URL for a package (used in an <iframe>). */
export function acuitySchedulerUrl(id: PackageId): string {
  const pkg = getPackage(id);
  return `https://app.acuityscheduling.com/schedule.php?owner=${business.booking.acuityOwner}&appointmentType=${pkg.appointmentType}&ref=embedded_csp`;
}

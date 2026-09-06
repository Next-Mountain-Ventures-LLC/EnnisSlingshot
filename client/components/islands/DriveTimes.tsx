/**
 * Drive-time widget (SITE-REBUILD-PLAN.md §5, T17). Fully static data from
 * client/lib/drive-times.ts; the picker is a plain <select> whose initial
 * value is derived from the page path so SSR and hydration agree. A
 * collapsible full table keeps every origin crawlable.
 *
 * Mounted by ContentPage when a page's frontmatter has `widget: "DriveTimes"`.
 */
import { useState } from "react";
import {
  DRIVE_TIMES,
  DRIVE_TIMES_BY_DISTANCE,
  DRIVE_TIMES_NOTE,
  defaultOriginForPath,
  formatMiles,
  formatMinutes,
  slugifyCity,
  type DriveTime,
} from "@/lib/drive-times";
import { business } from "@shared/business";

const DESTINATION = business.meetingPoint.formatted;

function directionsUrl(d: DriveTime): string {
  const params = new URLSearchParams({
    api: "1",
    origin: `${d.originCity}, ${d.state}`,
    destination: `${business.meetingPoint.streetAddress}, ${business.meetingPoint.addressLocality}, ${business.meetingPoint.addressRegion} ${business.meetingPoint.postalCode}`,
    travelmode: "driving",
  });
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

export interface DriveTimePickerProps {
  /** Page path used to pick the default origin ("/slingshot-rental/near-fort-worth/" → Fort Worth). */
  defaultOriginPath?: string;
  className?: string;
}

export function DriveTimePicker({ defaultOriginPath = "/", className }: DriveTimePickerProps) {
  const initial = defaultOriginForPath(defaultOriginPath);
  const [slug, setSlug] = useState(slugifyCity(initial.originCity));
  const selected = DRIVE_TIMES.find((d) => slugifyCity(d.originCity) === slug) ?? initial;

  return (
    <section className={className} aria-labelledby="drive-time-heading">
      <div className="bg-gray-900/60 border border-gray-700 rounded-lg p-6">
        <h2 id="drive-time-heading" className="text-2xl font-black text-white mb-1">
          How far is <span className="text-ennis-orange">Ennis</span>?
        </h2>
        <p className="text-sm text-gray-400 mb-5">Drive time to the meeting point: {DESTINATION}.</p>

        <label className="block text-sm text-gray-300 mb-4">
          <span className="block mb-1">Where are you coming from?</span>
          <select
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full sm:w-auto bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white"
          >
            {DRIVE_TIMES_BY_DISTANCE.map((d) => (
              <option key={d.originCity} value={slugifyCity(d.originCity)}>
                {d.originCity}, {d.state}
              </option>
            ))}
          </select>
        </label>

        <dl className="grid gap-4 sm:grid-cols-3 text-sm">
          <div className="rounded-md bg-black/30 p-3">
            <dt className="text-gray-400">Distance</dt>
            <dd className="text-2xl font-black text-white">{formatMiles(selected.miles)}</dd>
          </div>
          <div className="rounded-md bg-black/30 p-3">
            <dt className="text-gray-400">Drive time (no traffic)</dt>
            <dd className="text-2xl font-black text-white">{formatMinutes(selected.minutes)}</dd>
          </div>
          <div className="rounded-md bg-black/30 p-3">
            <dt className="text-gray-400">Route</dt>
            <dd className="text-lg font-black text-white">{selected.route}</dd>
          </div>
        </dl>

        <p className="mt-4 text-sm">
          <a
            href={directionsUrl(selected)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-ennis-orange hover:text-ennis-orange-bright"
          >
            Directions from {selected.originCity} in Google Maps ↗
          </a>
        </p>

        <p className="mt-4 text-xs text-gray-500">
          Times are no-traffic estimates — expect longer on Friday afternoons and festival weekends, and check Google
          Maps before you leave. Data note: &ldquo;{DRIVE_TIMES_NOTE}.&rdquo;
        </p>

        <details className="mt-4 text-sm">
          <summary className="cursor-pointer text-gray-300">All drive times to Ennis</summary>
          <DriveTimeTable className="mt-3" />
        </details>
      </div>
    </section>
  );
}

export function DriveTimeTable({ className }: { className?: string }) {
  return (
    <div className={`overflow-x-auto ${className ?? ""}`}>
      <table className="w-full text-sm text-left whitespace-nowrap">
        <caption className="sr-only">Drive distance and time from each city to the Ennis Welcome Center</caption>
        <thead>
          <tr className="text-gray-400 border-b border-gray-700">
            <th scope="col" className="py-2 pr-4 font-semibold">
              From
            </th>
            <th scope="col" className="py-2 pr-4 font-semibold">
              Miles
            </th>
            <th scope="col" className="py-2 pr-4 font-semibold">
              Drive time
            </th>
            <th scope="col" className="py-2 font-semibold">
              Route
            </th>
          </tr>
        </thead>
        <tbody>
          {DRIVE_TIMES_BY_DISTANCE.map((d) => (
            <tr key={d.originCity} className="border-b border-gray-800 last:border-0">
              <th scope="row" className="py-2 pr-4 font-medium text-white">
                {d.originCity}, {d.state}
              </th>
              <td className="py-2 pr-4 text-gray-200">{Math.round(d.miles)}</td>
              <td className="py-2 pr-4 text-gray-200">{formatMinutes(d.minutes)}</td>
              <td className="py-2 text-gray-200">{d.route}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DriveTimePicker;

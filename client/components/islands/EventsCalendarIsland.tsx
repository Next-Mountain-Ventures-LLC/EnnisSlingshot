/**
 * EventsCalendarIsland (SITE-REBUILD-PLAN.md §5, T16).
 *
 * Prerendered: every event from events.json grouped by month in date order
 * (upcoming first), with a "dates TBD" badge + note and outbound links.
 * Client enhancement (after mount, so hydration matches the server HTML):
 * category filter + "show past events" toggle. "Past" is judged against
 * today's America/Chicago date in the browser — the prerender lists all
 * events because the build date is meaningless for a static site.
 */
import { useEffect, useMemo, useState } from "react";
import {
  EVENTS,
  categoryLabel,
  eventCategories,
  formatEventDates,
  groupByMonth,
  isPastEvent,
  todayChicago,
  type EnnisEvent,
} from "./eventsData";

export function EventsCalendarIsland({ className }: { className?: string }) {
  // null until mounted → server + first client render show everything.
  const [today, setToday] = useState<string | null>(null);
  const [category, setCategory] = useState<string>("all");
  const [showPast, setShowPast] = useState(false);

  useEffect(() => {
    setToday(todayChicago());
  }, []);

  const categories = useMemo(() => eventCategories(), []);

  const filtered = useMemo(() => {
    let list: readonly EnnisEvent[] = EVENTS;
    if (category !== "all") list = list.filter((e) => (e.category ?? "other") === category);
    if (today && !showPast) list = list.filter((e) => !isPastEvent(e, today));
    return list;
  }, [category, showPast, today]);

  const pastCount = today ? EVENTS.filter((e) => isPastEvent(e, today)).length : 0;
  const groups = groupByMonth(filtered);

  return (
    <section className={className} aria-labelledby="events-heading">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <h2 id="events-heading" className="text-2xl font-black text-white">
          Upcoming <span className="text-ennis-orange">events</span>
        </h2>
        {today && (
          <form className="flex flex-wrap items-center gap-4 text-sm" onSubmit={(e) => e.preventDefault()}>
            <label className="flex items-center gap-2 text-gray-300">
              <span>Category</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white"
              >
                <option value="all">All</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {categoryLabel(c)}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                className="accent-ennis-orange"
                checked={showPast}
                onChange={(e) => setShowPast(e.target.checked)}
              />
              <span>Show past events{pastCount ? ` (${pastCount})` : ""}</span>
            </label>
          </form>
        )}
      </div>

      {groups.length === 0 ? (
        <p className="text-gray-400">No events match that filter yet — check back as dates are confirmed.</p>
      ) : (
        <div className="space-y-10">
          {groups.map((g) => (
            <div key={g.key}>
              <h3 className="text-lg font-bold text-white border-b border-gray-700 pb-2 mb-4">{g.label}</h3>
              <ol className="space-y-4">
                {g.events.map((e) => (
                  <EventCard key={e.id} event={e} past={today ? isPastEvent(e, today) : false} />
                ))}
              </ol>
            </div>
          ))}
        </div>
      )}

      <p className="mt-8 text-xs text-gray-500">
        Dates marked <span className="text-amber-200">TBD</span> are expected windows based on prior years and have
        not been confirmed by the organizer — always check the linked official site before booking travel.
      </p>
    </section>
  );
}

function EventCard({ event, past }: { event: EnnisEvent; past: boolean }) {
  return (
    <li className={`rounded-lg border p-4 ${past ? "border-gray-800 opacity-70" : "border-gray-700 bg-gray-900/40"}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="text-white font-bold text-base">
            {event.url ? (
              <a href={event.url} target="_blank" rel="noopener noreferrer" className="hover:text-ennis-orange">
                {event.name}
              </a>
            ) : (
              event.name
            )}
          </h4>
          <p className="text-sm text-gray-300 mt-1">
            <time dateTime={event.startDate}>{formatEventDates(event)}</time>
            {" · "}
            {event.location}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          {event.category && (
            <span className="inline-flex rounded-full bg-gray-800 px-2.5 py-0.5 text-xs text-gray-300">
              {categoryLabel(event.category)}
            </span>
          )}
          {event.tbd && (
            <span
              className="inline-flex rounded-full bg-amber-500/15 text-amber-200 ring-1 ring-amber-400/40 px-2.5 py-0.5 text-xs font-semibold"
              title="Expected dates — not yet confirmed by the organizer"
            >
              Dates TBD
            </span>
          )}
          {past && (
            <span className="inline-flex rounded-full bg-gray-800 px-2.5 py-0.5 text-xs text-gray-400">Past</span>
          )}
        </div>
      </div>
      <p className="text-sm text-gray-400 mt-3 leading-relaxed">{event.description}</p>
      {event.tbd && (
        <p className="text-xs text-amber-200/80 mt-2">
          Expected dates based on prior years; confirm with the organizer before you book.
        </p>
      )}
      {event.url && (
        <p className="mt-3 text-sm">
          <a href={event.url} target="_blank" rel="noopener noreferrer" className="text-ennis-orange hover:text-ennis-orange-bright">
            Official site ↗
          </a>
        </p>
      )}
    </li>
  );
}

export default EventsCalendarIsland;

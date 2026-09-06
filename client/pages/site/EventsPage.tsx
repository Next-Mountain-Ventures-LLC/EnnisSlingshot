/**
 * /ennis/events/ — markdown intro, then the EventsCalendarIsland (the copy
 * says "the list below"), then FAQ. Emits one schema.org Event per entry in
 * events.json (every entry has a startDate) alongside the page's default
 * CollectionPage JSON-LD.
 */
import type { SitePage } from "@/lib/pages";
import { EventsCalendarIsland } from "@/components/islands/EventsCalendarIsland";
import { eventsJsonLd } from "@/components/islands/eventsData";
import { IslandPageShell } from "./IslandPageShell";

export function EventsPage({ page }: { page: SitePage }) {
  return (
    <IslandPageShell
      page={page}
      afterBody={<EventsCalendarIsland />}
      extraJsonLd={eventsJsonLd(page.path)}
    />
  );
}

export default EventsPage;

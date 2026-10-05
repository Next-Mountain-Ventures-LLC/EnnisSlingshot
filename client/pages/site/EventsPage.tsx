/**
 * /ennis/events/ — markdown intro, then the EventsCalendarIsland right after
 * the first section (the copy says "the list below"), then the rest of the
 * guide + FAQ. Emits one schema.org Event per entry in events.json (every
 * entry has a startDate) alongside the page's default CollectionPage JSON-LD.
 */
import type { SitePage } from "@/lib/pages";
import { EventsCalendarIsland } from "@/components/islands/EventsCalendarIsland";
import { eventsJsonLd } from "@/components/islands/eventsData";
import { IslandPageShell } from "./IslandPageShell";

export function EventsPage({ page }: { page: SitePage }) {
  return (
    <IslandPageShell
      page={page}
      afterIntro={<EventsCalendarIsland />}
      extraJsonLd={eventsJsonLd(page.path)}
    />
  );
}

export default EventsPage;

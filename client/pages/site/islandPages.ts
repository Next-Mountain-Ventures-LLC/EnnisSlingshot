/**
 * `island` frontmatter value (shared/content/page-schema.ts ISLANDS) →
 * page component. ContentPage dispatches here so the markdown pages that
 * host an interactive island render through their dedicated page.
 */
import type { ComponentType } from "react";
import type { IslandName } from "@shared/content/page-schema";
import type { SitePage } from "@/lib/pages";
import { TrailMapPage } from "./TrailMapPage";
import { BloomTrackerPage } from "./BloomTrackerPage";
import { WeatherPage } from "./WeatherPage";
import { EventsPage } from "./EventsPage";

export const ISLAND_PAGES: Record<IslandName, ComponentType<{ page: SitePage }>> = {
  TrailMap: TrailMapPage,
  BloomTracker: BloomTrackerPage,
  Weather: WeatherPage,
  EventsCalendar: EventsPage,
};

/**
 * /bluebonnets/trail-map/ — the TrailMapIsland sits right after the intro
 * section ("the map below shows…"), followed by the rest of the guide + FAQ.
 * The chrome-less embed for third-party sites is a dedicated /embed/* route.
 */
import type { SitePage } from "@/lib/pages";
import { TrailMapIsland } from "@/components/islands/TrailMapIsland";
import { IslandPageShell } from "./IslandPageShell";

export function TrailMapPage({ page }: { page: SitePage }) {
  // Sidebar from xl: the map + its loop legend need the full column on 1024–1279px screens.
  return <IslandPageShell page={page} afterIntro={<TrailMapIsland />} sidebarFrom="xl" />;
}

export default TrailMapPage;

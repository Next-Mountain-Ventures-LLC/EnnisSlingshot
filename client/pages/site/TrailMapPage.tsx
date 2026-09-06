/**
 * /bluebonnets/trail-map/ — markdown body + FAQ with the TrailMapIsland
 * mounted after the intro copy ("the map below"). `?embed=1` renders the
 * map alone without site chrome for third-party embeds.
 */
import type { SitePage } from "@/lib/pages";
import { TrailMapIsland } from "@/components/islands/TrailMapIsland";
import { useEmbed } from "@/components/islands/useEmbed";
import { IslandPageShell } from "./IslandPageShell";

export function TrailMapPage({ page }: { page: SitePage }) {
  const embed = useEmbed();
  return <IslandPageShell page={page} embed={embed} afterBody={<TrailMapIsland embed={embed} />} />;
}

export default TrailMapPage;

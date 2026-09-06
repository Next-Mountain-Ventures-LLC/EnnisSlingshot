/**
 * /bluebonnets/bloom-tracker/ — the BloomTrackerIsland sits above the
 * markdown body (the copy says "check the tracker above"), followed by the
 * explainer + FAQ.
 */
import type { SitePage } from "@/lib/pages";
import { BloomTrackerIsland } from "@/components/islands/BloomTrackerIsland";
import { IslandPageShell } from "./IslandPageShell";

export function BloomTrackerPage({ page }: { page: SitePage }) {
  return <IslandPageShell page={page} beforeBody={<BloomTrackerIsland />} />;
}

export default BloomTrackerPage;

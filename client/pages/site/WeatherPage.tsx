/**
 * /bluebonnets/weather/ — WeatherIsland above the markdown body (the copy
 * says "check the forecast widget above"), then normals explainer + FAQ.
 */
import type { SitePage } from "@/lib/pages";
import { WeatherIsland } from "@/components/islands/WeatherIsland";
import { IslandPageShell } from "./IslandPageShell";

export function WeatherPage({ page }: { page: SitePage }) {
  return <IslandPageShell page={page} beforeBody={<WeatherIsland />} />;
}

export default WeatherPage;

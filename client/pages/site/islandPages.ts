/**
 * `island` frontmatter value (shared/content/page-schema.ts ISLANDS) →
 * page component. ContentPage dispatches here so the markdown pages that
 * host an interactive island render through their dedicated page.
 */
import type { ComponentType } from "react";
import type { IslandName } from "@shared/content/page-schema";
import type { SitePage } from "@/lib/pages";
import { TrailMapPage } from "./TrailMapPage";

export const ISLAND_PAGES: Partial<Record<IslandName, ComponentType<{ page: SitePage }>>> = {
  TrailMap: TrailMapPage,
};

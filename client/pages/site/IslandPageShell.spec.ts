import { describe, expect, it } from "vitest";
import { splitAfterFirstSection } from "./IslandPageShell";

describe("splitAfterFirstSection", () => {
  it("cuts before the second H2", () => {
    const body = "## How the map works\n\nThe map below…\n\n## The three loops\n\nNorth…\n\n## FAQ\n\nQ";
    expect(splitAfterFirstSection(body)).toEqual([
      "## How the map works\n\nThe map below…",
      "## The three loops\n\nNorth…\n\n## FAQ\n\nQ",
    ]);
  });

  it("ignores H3s and returns bodies with fewer than two H2s whole", () => {
    expect(splitAfterFirstSection("## Only\n\n### Sub\n\ntext")).toEqual(["## Only\n\n### Sub\n\ntext", ""]);
    expect(splitAfterFirstSection("Intro only")).toEqual(["Intro only", ""]);
  });
});

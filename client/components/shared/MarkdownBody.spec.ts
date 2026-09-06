import { describe, expect, it } from "vitest";
import { stripHtmlComments } from "./MarkdownBody";

describe("stripHtmlComments", () => {
  it("removes single-line and multi-line IMAGE notes", () => {
    const md = 'Intro.\n\n<!-- IMAGE: hero, alt="x" -->\n\n## H\n\nText <!-- inline\nnote --> more.';
    const out = stripHtmlComments(md);
    expect(out).not.toContain("<!--");
    expect(out).not.toContain("IMAGE:");
    expect(out).toContain("## H");
    expect(out).toContain("Text  more.");
  });
  it("leaves markdown without comments untouched", () => {
    expect(stripHtmlComments("# Hi\n\nBody")).toBe("# Hi\n\nBody");
  });
});

import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { ACUITY_EMBED_SCRIPT, BookingWidget, loadAcuityEmbedScript } from "./BookingWidget";

describe("BookingWidget (prerender)", () => {
  it("renders the package picker server-side, Solo preselected, no scheduler iframe", () => {
    const html = renderToString(
      <StaticRouter location="/book/">
        <BookingWidget />
      </StaticRouter>,
    );
    expect(html).toContain("Choose your experience");
    for (const name of ["Solo", "Driver + Rider", "Drive &amp; Go"]) expect(html).toContain(name);
    expect(html).toContain("$69.99");
    expect(html).toContain("Free rescheduling up to 7 days before your ride");
    expect(html).toMatch(/type="radio"[^>]*value="solo"[^>]*checked=""|checked=""[^>]*value="solo"/);
    expect(html).not.toContain("<iframe");
  });

  it("does not read ?package= during render (applied after mount)", () => {
    const html = renderToString(
      <StaticRouter location="/book/?package=two-up">
        <BookingWidget />
      </StaticRouter>,
    );
    // Same markup as the prerendered page (no query) so hydration matches.
    expect(html).toMatch(/value="solo"[^>]*checked=""|checked=""[^>]*value="solo"/);
  });

  it("shows the trail map only for the 2-hour packages", () => {
    const solo = renderToString(
      <StaticRouter location="/">
        <BookingWidget initialPackage="solo" />
      </StaticRouter>,
    );
    const driveAndGo = renderToString(
      <StaticRouter location="/">
        <BookingWidget initialPackage="drive-and-go" />
      </StaticRouter>,
    );
    expect(solo).toContain("Bluebonnet Trail map in your glove box");
    expect(driveAndGo).not.toContain("Bluebonnet Trail map in your glove box");
  });
});

describe("loadAcuityEmbedScript", () => {
  it("injects embed.js only once", () => {
    const scripts: Array<{ src: string }> = [];
    const doc = {
      querySelector: (sel: string) => (sel.includes(ACUITY_EMBED_SCRIPT) && scripts.length ? scripts[0] : null),
      createElement: () => ({ src: "", async: false }),
      body: { appendChild: (el: { src: string }) => scripts.push(el) },
    } as unknown as Document;
    loadAcuityEmbedScript(doc);
    loadAcuityEmbedScript(doc);
    expect(scripts).toHaveLength(1);
    expect(scripts[0].src).toBe(ACUITY_EMBED_SCRIPT);
  });
});

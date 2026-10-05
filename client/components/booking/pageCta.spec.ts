import { describe, expect, it } from "vitest";
import { pageCtaCopy, pageCtaSlots } from "./pageCta";

describe("pageCtaSlots", () => {
  it("gives hub pages and their spokes the full CTA set", () => {
    expect(pageCtaSlots({ path: "/bluebonnets/", hub: "bluebonnets" })).toEqual({ strip: true, banner: true, card: true });
    expect(pageCtaSlots({ path: "/ennis/downtown/", hub: "ennis" })).toEqual({ strip: true, banner: true, card: true });
  });

  it("treats /faq/, /about/ and /gallery/ as SEO pages", () => {
    for (const path of ["/faq/", "/about/", "/gallery/"]) {
      expect(pageCtaSlots({ path, hub: null })).toEqual({ strip: true, banner: true, card: true });
    }
  });

  it("gives /contact/ (and other hub-less pages) only the banner", () => {
    expect(pageCtaSlots({ path: "/contact/", hub: null })).toEqual({ strip: false, banner: true, card: false });
    expect(pageCtaSlots({ path: "/reviews/", hub: null })).toEqual({ strip: false, banner: true, card: false });
  });

  it("shows no CTA on /privacy/, /terms/ or /book/", () => {
    for (const path of ["/privacy/", "/terms/", "/book/"]) {
      expect(pageCtaSlots({ path, hub: null })).toEqual({ strip: false, banner: false, card: false });
    }
  });
});

describe("pageCtaCopy", () => {
  it("defaults href to /book/ and leaves other fields to the component defaults", () => {
    expect(pageCtaCopy(undefined)).toEqual({ headline: undefined, body: undefined, buttonLabel: undefined, href: "/book/" });
  });

  it("passes frontmatter copy through", () => {
    expect(
      pageCtaCopy({ headline: "See the festival", body: "One line.", buttonLabel: "Book", href: "/book/?package=two-up" }),
    ).toEqual({ headline: "See the festival", body: "One line.", buttonLabel: "Book", href: "/book/?package=two-up" });
  });
});

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { describe, expect, it, vi } from "vitest";
import { MarkdownBody, isKnownSitePath, slugifyHeading, stripHtmlComments, toSitePath } from "./MarkdownBody";

function render(md: string): string {
  return renderToStaticMarkup(createElement(StaticRouter, { location: "/" }, createElement(MarkdownBody, null, md)));
}

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

describe("toSitePath", () => {
  it("turns absolute links to this site into site paths", () => {
    expect(toSitePath("https://ennisslingshot.com/blog/texas-slingshot-laws/")).toBe("/blog/texas-slingshot-laws/");
    expect(toSitePath("https://www.ennisslingshot.com/book/?package=solo")).toBe("/book/?package=solo");
    expect(toSitePath("http://ennisslingshot.com")).toBe("/");
    expect(toSitePath("https://ennisslingshot.com#faq")).toBe("/#faq");
  });
  it("leaves other hosts and relative links alone", () => {
    expect(toSitePath("https://ennisslingshot.com.evil.example/x")).toBe("https://ennisslingshot.com.evil.example/x");
    expect(toSitePath("https://www.bluebonnettrail.org/")).toBe("https://www.bluebonnettrail.org/");
    expect(toSitePath("/faq/")).toBe("/faq/");
  });
});

describe("isKnownSitePath", () => {
  it("knows prerendered routes with or without the trailing slash", () => {
    expect(isKnownSitePath("/")).toBe(true);
    expect(isKnownSitePath("/faq/")).toBe(true);
    expect(isKnownSitePath("/faq")).toBe(true);
    expect(isKnownSitePath("/blog/")).toBe(true);
  });
  it("treats static files as known and unpublished paths as unknown", () => {
    expect(isKnownSitePath("/rss.xml")).toBe(true);
    expect(isKnownSitePath("/blog/this-post-does-not-exist-yet/")).toBe(false);
  });
});

describe("slugifyHeading", () => {
  it("makes stable anchor slugs", () => {
    expect(slugifyHeading("SMS terms")).toBe("sms-terms");
    expect(slugifyHeading("Weather & cancellation policy")).toBe("weather-cancellation-policy");
    expect(slugifyHeading("What's included?")).toBe("whats-included");
  });
});

describe("MarkdownBody rendering", () => {
  it("renders absolute self links as same-tab internal links", () => {
    const html = render("See [our FAQ](https://ennisslingshot.com/faq/).");
    expect(html).toContain('href="/faq/"');
    expect(html).not.toContain("target=");
    expect(html).not.toContain("noreferrer");
  });

  it("keeps external links in a new tab", () => {
    const html = render("[Trails](https://www.bluebonnettrail.org/)");
    expect(html).toContain('href="https://www.bluebonnettrail.org/"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it("never emits react-markdown's node prop as an attribute", () => {
    const html = render("[FAQ](/faq/) and [x](https://example.com)\n\n| A | B |\n|---|---|\n| 1 | 2 |");
    expect(html).not.toContain("node=");
    expect(html).not.toContain("[object Object]");
  });

  it("renders links to unpublished pages as plain text", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const html = render("Read [the hub post](https://ennisslingshot.com/blog/this-post-does-not-exist-yet/) soon.");
    expect(html).toContain("Read the hub post soon.");
    expect(html).not.toContain("<a");
    warn.mockRestore();
  });

  it("wraps GFM tables in a horizontal scroll container", () => {
    const html = render("| Package | Price |\n|---|---|\n| Solo | $79 |");
    expect(html).toMatch(/<div[^>]*overflow-x-auto[^>]*><table/);
    expect(html).toContain("whitespace-nowrap");
  });

  it("adds unique id slugs to h2 and h3", () => {
    const html = render("## SMS terms\n\nText\n\n### Details\n\n## SMS terms");
    expect(html).toContain('<h2 id="sms-terms">');
    expect(html).toContain('<h3 id="details">');
    expect(html).toContain('<h2 id="sms-terms-1">');
  });
});

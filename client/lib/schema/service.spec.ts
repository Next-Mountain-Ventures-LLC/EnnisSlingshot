import { describe, expect, it } from "vitest";
import { bookableOffers, matchBookablePackage, offerCatalog, service } from "./service";

describe("matchBookablePackage", () => {
  it("matches the real packages by name + price, whatever dash/alias the page uses", () => {
    expect(matchBookablePackage({ name: "Bluebonnet Trail Experience — Solo", price: "$79" })?.id).toBe("solo");
    expect(matchBookablePackage({ name: "Bluebonnet Trail Experience – Two-Up", price: "$149" })?.id).toBe("two-up");
    expect(matchBookablePackage({ name: "Driver + Rider", price: 149 })?.id).toBe("two-up");
    expect(matchBookablePackage({ name: "1-Hour Drive & Go", price: 69.99 })?.id).toBe("drive-and-go");
    expect(matchBookablePackage({ name: "Drive and Go", price: "$69.99" })?.id).toBe("drive-and-go");
  });

  it("uses a /book/?package= deep link when present", () => {
    expect(matchBookablePackage({ name: "Couples ride", price: "$149 for two", url: "/book/?package=two-up" })?.id).toBe(
      "two-up",
    );
  });

  it("rejects proposed / unpriced products", () => {
    expect(matchBookablePackage({ name: "Golden Hour Date Night", price: "$169 for two" })).toBeNull();
    expect(matchBookablePackage({ name: "Group Convoy (per vehicle)", price: "$139" })).toBeNull();
    expect(matchBookablePackage({ name: "Festival Weekend Ride", price: "Pricing TBD" })).toBeNull();
    expect(matchBookablePackage({ name: "Photo add-on", price: "$39" })).toBeNull();
    // Right price, wrong product.
    expect(matchBookablePackage({ name: "Group Convoy", price: "$149" })).toBeNull();
  });
});

describe("offerCatalog", () => {
  it("emits InStock offers only for bookable packages, with canonical names and deep links", () => {
    const catalog = offerCatalog([
      { name: "Drive & Go", price: "$69.99" },
      { name: "Golden Hour Date Night", price: "$169 for two" },
      { name: "Bluebonnet Trail Experience – Solo", price: "$79" },
      { name: "Group Convoy (per vehicle)", price: "$139" },
    ]) as unknown as { itemListElement: Array<Record<string, unknown>> };
    const offers = catalog.itemListElement;
    expect(offers.map((o) => o.name)).toEqual(["Drive & Go", "Bluebonnet Trail Experience — Solo"]);
    expect(offers.map((o) => o.price)).toEqual(["69.99", "79.00"]);
    expect(offers.every((o) => o.availability === "https://schema.org/InStock")).toBe(true);
    expect(String(offers[0].url)).toMatch(/\/book\/\?package=drive-and-go$/);
  });

  it("returns undefined when nothing is bookable, and service() then omits the catalog", () => {
    const rows = [{ name: "Golden Hour Date Night", price: "$169" }];
    expect(offerCatalog(rows)).toBeUndefined();
    expect(service({ name: "Date night", description: "x", path: "/slingshot-rental/date-night/", packages: rows })).not.toHaveProperty(
      "hasOfferCatalog",
    );
  });

  it("lists each package once", () => {
    expect(bookableOffers([{ name: "Solo", price: 79 }, { name: "Bluebonnet Trail Experience — Solo", price: "$79" }])).toHaveLength(1);
  });
});

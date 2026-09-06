import { describe, expect, it } from "vitest";
import {
  buildRouteManifest,
  blogCategoryPagePath,
  blogIndexPath,
  blogPageCount,
  isRoutingCategory,
  postIsInCategory,
  BLOG_PAGE_SIZE,
} from "./site-routes";

function fakePosts(n: number, categorySlugs: string[] = ["ennisslingshot-com", "slingshot-101"]) {
  return Array.from({ length: n }, (_, i) => ({
    slug: `post-${i + 1}`,
    pubDate: new Date(2026, 8, 1 + i),
    categories: categorySlugs,
    categorySlugs,
  }));
}

describe("routing category", () => {
  it("is detected by slug or name and never counts as a site category", () => {
    expect(isRoutingCategory({ slug: "ennisslingshot-com" })).toBe(true);
    expect(isRoutingCategory({ name: "EnnisSlingshot.com" })).toBe(true);
    expect(isRoutingCategory({ name: "Ennis Bluebonnets", slug: "ennis-bluebonnets" })).toBe(false);
    expect(postIsInCategory({ categorySlugs: ["ennisslingshot-com"] }, "news")).toBe(false);
  });
  it("maps legacy 'about' onto news", () => {
    expect(postIsInCategory({ categories: ["About"], categorySlugs: ["about"] }, "news")).toBe(true);
  });
});

describe("pagination paths", () => {
  it("keeps page 1 at the bare path", () => {
    expect(blogIndexPath(1)).toBe("/blog/");
    expect(blogIndexPath(2)).toBe("/blog/page/2/");
    expect(blogCategoryPagePath("news", 1)).toBe("/blog/category/news/");
    expect(blogCategoryPagePath("news", 3)).toBe("/blog/category/news/page/3/");
    expect(blogPageCount(0)).toBe(1);
    expect(blogPageCount(BLOG_PAGE_SIZE)).toBe(1);
    expect(blogPageCount(BLOG_PAGE_SIZE + 1)).toBe(2);
  });
});

describe("buildRouteManifest pagination", () => {
  it("adds /blog/page/N/ and category pages only when needed, flagged paginated", () => {
    const { routes } = buildRouteManifest({ pages: [], posts: fakePosts(25) });
    const paths = routes.map((r) => r.path);
    expect(paths).toContain("/blog/");
    expect(paths).toContain("/blog/page/2/");
    expect(paths).toContain("/blog/page/3/");
    expect(paths).not.toContain("/blog/page/4/");
    expect(paths).toContain("/blog/category/slingshot-101/page/2/");
    expect(paths).toContain("/blog/category/slingshot-101/page/3/");
    expect(paths).not.toContain("/blog/category/news/page/2/");
    for (const r of routes) {
      expect(Boolean(r.paginated)).toBe(/\/page\/\d+\/$/.test(r.path));
    }
  });
  it("adds no paginated routes for a single page of posts", () => {
    const { routes } = buildRouteManifest({ pages: [], posts: fakePosts(3) });
    expect(routes.some((r) => r.paginated)).toBe(false);
  });
});

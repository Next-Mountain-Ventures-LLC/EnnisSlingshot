/**
 * /blog/category/<slug>/ and /blog/category/<slug>/page/<n>/ — one of the
 * five visible categories (shared/content/site-routes.ts BLOG_CATEGORIES).
 * Intro copy comes from client/content/pages/blog-categories/<slug>.md (its
 * canonicalPath is already /blog/category/<slug>/). Posts are matched through
 * getPostsByCategorySlug(), which maps WordPress terms onto site categories
 * and ignores the hidden routing category.
 */
import { Link, useParams } from "react-router-dom";
import { getBlogCategory, blogCategoryPagePath, BLOG_PAGE_SIZE, blogPageCount } from "@shared/content/site-routes";
import { getPostsByCategorySlug, getPostUrl, getPostExcerpt } from "@/lib/blog";
import { getBlogCategoryIntro } from "@/lib/pages";
import { Seo } from "@/components/seo/Seo";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { MarkdownBody } from "@/components/shared/MarkdownBody";
import { itemList, webPage } from "@/lib/schema";
import { BlogCard } from "./BlogCard";
import { Pagination } from "./Pagination";
import { parsePageParam } from "./BlogIndexTemplate";
import NotFound from "@/pages/NotFound";

export function BlogCategoryTemplate() {
  const { slug, page: pageParam } = useParams<{ slug: string; page?: string }>();
  const category = slug ? getBlogCategory(slug) : undefined;
  const page = parsePageParam(pageParam);
  if (!category || page === null) return <NotFound />;

  const allPosts = getPostsByCategorySlug(category.slug);
  const pageCount = blogPageCount(allPosts.length);
  if (page > pageCount) return <NotFound />;
  const posts = allPosts.slice((page - 1) * BLOG_PAGE_SIZE, page * BLOG_PAGE_SIZE);

  const path = blogCategoryPagePath(category.slug, page);
  const intro = getBlogCategoryIntro(category.slug);
  const pageSuffix = page > 1 ? ` — Page ${page}` : "";

  const baseTitle = intro?.data.title ?? `${category.name} | Ennis Slingshot Blog`;
  const title = page > 1 ? baseTitle.replace(/\s*\|/, `${pageSuffix} |`) : baseTitle;
  const description = intro?.data.metaDescription ?? category.description;

  const crumbs =
    page > 1
      ? [{ label: "Home", path: "/" }, { label: "Blog", path: "/blog/" }, { label: category.name, path: blogCategoryPagePath(category.slug, 1) }, { label: `Page ${page}` }]
      : [{ label: "Home", path: "/" }, { label: "Blog", path: "/blog/" }, { label: category.name }];

  return (
    <div className="min-h-screen bg-ennis-dark">
      <Seo
        title={title}
        description={description}
        canonicalPath={path}
        jsonLd={[
          webPage({ path, name: `${category.name}${pageSuffix}`, description, type: "CollectionPage" }),
          itemList(
            `${category.name}${pageSuffix}`,
            posts.map((p) => ({ name: p.data.title, url: getPostUrl(p), description: getPostExcerpt(p) })),
            { path, description },
          ),
        ]}
      />
      <div className="container mx-auto px-4 py-12">
        <Breadcrumbs items={crumbs} className="mb-6" />
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4">
            {intro?.data.h1 ?? category.name}
            {page > 1 && <span className="block text-2xl md:text-3xl text-gray-400 font-bold mt-2">Page {page} of {pageCount}</span>}
          </h1>
          {/* Intro copy only on page 1 — paginated pages carry the short description so they aren't near-duplicates. */}
          {intro && page === 1 ? (
            <div className="max-w-3xl mx-auto text-left">
              <MarkdownBody>{intro.body}</MarkdownBody>
            </div>
          ) : (
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">{category.description}</p>
          )}
        </div>

        {posts.length > 0 ? (
          <div className="max-w-4xl mx-auto grid gap-8 md:grid-cols-2">
            {posts.map((post, i) => (
              <BlogCard key={post.id} post={post} eager={i < 2} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400 text-lg py-12">
            No posts in this category yet. Check back soon, or browse{" "}
            <Link to="/blog/" className="text-ennis-orange">all posts</Link>.
          </p>
        )}

        <Pagination page={page} pageCount={pageCount} hrefFor={(p) => blogCategoryPagePath(category.slug, p)} className="mt-12" />
      </div>
    </div>
  );
}

export default BlogCategoryTemplate;

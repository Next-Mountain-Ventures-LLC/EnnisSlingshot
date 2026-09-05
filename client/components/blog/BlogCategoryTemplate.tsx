/**
 * /blog/category/<slug>/ — one of the five visible categories
 * (shared/content/site-routes.ts BLOG_CATEGORIES). Intro copy comes from
 * client/content/pages/blog-categories/<slug>.md when an author has written it.
 */
import { Link, useParams } from "react-router-dom";
import { getBlogCategory, blogCategoryPath } from "@shared/content/site-routes";
import { getPublishedPosts, getPostUrl, getPostExcerpt, getCategoryTerms } from "@/lib/blog";
import { resolveBlogCategory } from "@shared/content/site-routes";
import { getBlogCategoryIntro } from "@/lib/pages";
import { Seo } from "@/components/seo/Seo";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { MarkdownBody } from "@/components/shared/MarkdownBody";
import { itemList, webPage } from "@/lib/schema";
import NotFound from "@/pages/NotFound";

export function BlogCategoryTemplate() {
  const { slug } = useParams<{ slug: string }>();
  const category = slug ? getBlogCategory(slug) : undefined;
  if (!category) return <NotFound />;

  const path = blogCategoryPath(category.slug);
  const intro = getBlogCategoryIntro(category.slug);
  const posts = getPublishedPosts().filter((post) =>
    getCategoryTerms(post).some((t) => resolveBlogCategory(t.slug)?.slug === category.slug || resolveBlogCategory(t.name)?.slug === category.slug),
  );

  const title = intro?.data.title ?? `${category.name} | Ennis Slingshot Blog`;
  const description = intro?.data.metaDescription ?? category.description;

  return (
    <div className="min-h-screen bg-ennis-dark">
      <Seo
        title={title}
        description={description}
        canonicalPath={path}
        jsonLd={[
          webPage({ path, name: category.name, description, type: "CollectionPage" }),
          itemList(
            category.name,
            posts.map((p) => ({ name: p.data.title, url: getPostUrl(p), description: getPostExcerpt(p) })),
            { path, description },
          ),
        ]}
      />
      <div className="container mx-auto px-4 py-12">
        <Breadcrumbs
          items={[{ label: "Home", path: "/" }, { label: "Blog", path: "/blog/" }, { label: category.name }]}
          className="mb-6"
        />
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4">
            {intro?.data.h1 ?? category.name}
          </h1>
          {intro ? (
            <div className="max-w-3xl mx-auto text-left">
              <MarkdownBody>{intro.body}</MarkdownBody>
            </div>
          ) : (
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">{category.description}</p>
          )}
        </div>

        {posts.length > 0 ? (
          <div className="max-w-4xl mx-auto grid gap-8 md:grid-cols-2">
            {posts.map((post) => (
              <Link
                key={post.id}
                to={getPostUrl(post)}
                className="group bg-gray-900 border border-gray-700 hover:border-ennis-orange rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-ennis-orange/20"
              >
                {post.data.heroImage && (
                  <div className="relative overflow-hidden bg-gray-800 h-48">
                    <img
                      src={post.data.heroImage}
                      alt={post.data.heroImageAlt || post.data.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="text-gray-400 text-sm mb-3">
                    {post.data.pubDate.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-ennis-orange transition-colors">
                    {post.data.title}
                  </h2>
                  <p className="text-gray-300 line-clamp-2">{getPostExcerpt(post)}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400 text-lg py-12">
            No posts in this category yet. Check back soon, or browse{" "}
            <Link to="/blog/" className="text-ennis-orange">all posts</Link>.
          </p>
        )}
      </div>
    </div>
  );
}

export default BlogCategoryTemplate;

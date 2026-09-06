/**
 * /blog/ and /blog/page/<n>/ — all published posts, BLOG_PAGE_SIZE (12) per
 * page, newest first. Every page is prerendered and self-canonical; only
 * page 1 is in sitemap.xml (scripts/generate-seo-files.ts).
 */
import { Link, useParams } from 'react-router-dom';
import { getPublishedPosts, getPostUrl, getPostExcerpt } from '../../lib/blog';
import { BLOG_CATEGORIES, BLOG_PAGE_SIZE, blogCategoryPath, blogIndexPath, blogPageCount } from '@shared/content/site-routes';
import { Seo } from '@/components/seo/Seo';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { webPage, itemList } from '@/lib/schema';
import { BlogCard } from './BlogCard';
import { Pagination } from './Pagination';
import NotFound from '@/pages/NotFound';

/** Parse the `:page` param: undefined → 1; anything that isn't an integer ≥ 2 → null (404). */
export function parsePageParam(raw: string | undefined): number | null {
  if (raw === undefined) return 1;
  if (!/^\d+$/.test(raw)) return null;
  const n = Number(raw);
  return n >= 2 ? n : null; // /page/1/ is not a URL — page 1 lives at the bare path
}

export function BlogIndexTemplate() {
  const { page: pageParam } = useParams<{ page?: string }>();
  const page = parsePageParam(pageParam);
  const allPosts = getPublishedPosts();
  const pageCount = blogPageCount(allPosts.length);
  if (page === null || page > pageCount) return <NotFound />;

  const posts = allPosts.slice((page - 1) * BLOG_PAGE_SIZE, page * BLOG_PAGE_SIZE);
  const path = blogIndexPath(page);
  const pageSuffix = page > 1 ? ` — Page ${page}` : '';
  const description = 'Stories, tips, and adventures from the Ennis Slingshot Experience: bluebonnet season, things to do in Ennis and DFW, Dallas date ideas, and Polaris Slingshot 101.';

  return (
    <div className="min-h-screen bg-ennis-dark">
      <Seo
        title={`Blog${pageSuffix} | Ennis Slingshot Experience`}
        description={description}
        canonicalPath={path}
        jsonLd={[
          webPage({ path, name: `Ennis Slingshot Blog${pageSuffix}`, description, type: 'CollectionPage' }),
          itemList(
            page > 1 ? `Posts — page ${page}` : 'Latest posts',
            posts.map((p) => ({ name: p.data.title, url: getPostUrl(p), description: getPostExcerpt(p) })),
            { path },
          ),
        ]}
      />
      <div className="container mx-auto px-4 py-12">
        <Breadcrumbs
          items={page > 1 ? [{ label: 'Home', path: '/' }, { label: 'Blog', path: '/blog/' }, { label: `Page ${page}` }] : [{ label: 'Home', path: '/' }, { label: 'Blog' }]}
          className="mb-6"
        />
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-black text-white mb-4">
            <span className="text-ennis-orange">Blog</span>
            {page > 1 && <span className="block text-2xl md:text-3xl text-gray-400 font-bold mt-2">Page {page} of {pageCount}</span>}
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Stories, tips, and adventures from the Slingshot experience
          </p>
          <nav aria-label="Blog categories" className="mt-8 flex flex-wrap justify-center gap-2">
            {BLOG_CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                to={blogCategoryPath(cat.slug)}
                className="inline-block px-3 py-1 bg-ennis-orange/20 border border-ennis-orange rounded-full text-ennis-orange text-xs font-semibold tracking-widest uppercase hover:bg-ennis-orange hover:text-ennis-dark transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </nav>
          <p className="mt-4 text-sm text-gray-500">
            <a href="/rss.xml" type="application/rss+xml" className="hover:text-ennis-orange transition-colors">
              Subscribe via RSS
            </a>
          </p>
        </div>

        {/* Blog Posts Grid */}
        {posts.length > 0 ? (
          <div className="max-w-4xl mx-auto grid gap-8 md:grid-cols-2">
            {posts.map((post, i) => (
              <BlogCard key={post.id} post={post} eager={i < 2} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No blog posts yet. Check back soon!</p>
          </div>
        )}

        <Pagination page={page} pageCount={pageCount} hrefFor={blogIndexPath} className="mt-12" />
      </div>
    </div>
  );
}

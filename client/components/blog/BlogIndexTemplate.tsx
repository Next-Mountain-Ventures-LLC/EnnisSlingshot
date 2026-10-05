/**
 * /blog/ and /blog/page/<n>/ — all published posts, BLOG_PAGE_SIZE (12) per
 * page, newest first. Every page is prerendered and self-canonical; only
 * page 1 is in sitemap.xml (scripts/generate-seo-files.ts).
 */
import { Fragment } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getPublishedPosts, getPostUrl, getPostExcerpt, type BlogPost } from '../../lib/blog';
import { BLOG_CATEGORIES, BLOG_PAGE_SIZE, blogCategoryPath, blogIndexPath, blogPageCount } from '@shared/content/site-routes';
import { Seo } from '@/components/seo/Seo';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { webPage, itemList } from '@/lib/schema';
import { BookingCta } from '@/components/shared/BookingCta';
import { BlogCard } from './BlogCard';
import { Pagination } from './Pagination';
import NotFound from '@/pages/NotFound';

/** Number of cards before the in-grid booking banner (2 rows at lg, 3 at md); shorter lists get it at the end. */
export const BLOG_CTA_AFTER = 6;

/**
 * Card grid shared by /blog/ and the category pages: 1 → 2 → 3 columns, with a
 * full-width BookingCta banner after the first BLOG_CTA_AFTER cards (or after
 * the grid when there are fewer posts).
 */
export function BlogCardGrid({ posts }: { posts: BlogPost[] }) {
  const inline = posts.length > BLOG_CTA_AFTER;
  return (
    <>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post, i) => (
          <Fragment key={post.id}>
            <BlogCard post={post} eager={i < 2} />
            {inline && i === BLOG_CTA_AFTER - 1 && <BookingCta variant="banner" className="col-span-full" />}
          </Fragment>
        ))}
      </div>
      {!inline && posts.length > 0 && <BookingCta variant="banner" className="mt-12" />}
    </>
  );
}

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
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <Breadcrumbs
          items={page > 1 ? [{ label: 'Home', path: '/' }, { label: 'Blog', path: '/blog/' }, { label: `Page ${page}` }] : [{ label: 'Home', path: '/' }, { label: 'Blog' }]}
          className="mb-6"
        />
        {/* Header — left-aligned with the breadcrumbs and the card grid */}
        <div className="mb-10 md:mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4">
            <span className="text-ennis-orange">Blog</span>
            {page > 1 && <span className="block text-2xl md:text-3xl text-gray-400 font-bold mt-2">Page {page} of {pageCount}</span>}
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl">
            Stories, tips, and adventures from the Slingshot experience
          </p>
          <nav aria-label="Blog categories" className="mt-6 md:mt-8 flex flex-wrap gap-2">
            {BLOG_CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                to={blogCategoryPath(cat.slug)}
                className="inline-block px-3 py-2 bg-ennis-orange/20 border border-ennis-orange rounded-full text-ennis-orange text-xs font-semibold tracking-widest uppercase hover:bg-ennis-orange hover:text-ennis-dark transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </nav>
          <p className="mt-4 text-sm text-gray-400">
            <a href="/rss.xml" type="application/rss+xml" className="inline-block py-1 hover:text-ennis-orange transition-colors">
              Subscribe via RSS
            </a>
          </p>
        </div>

        {/* Blog Posts Grid */}
        {posts.length > 0 ? (
          <BlogCardGrid posts={posts} />
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

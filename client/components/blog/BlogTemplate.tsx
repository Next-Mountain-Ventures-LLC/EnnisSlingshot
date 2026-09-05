import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getPostBySlug, getPostUrl, getCategoryTerms, getTagTerms, getPostExcerpt } from '../../lib/blog';
import { resolveBlogCategory, blogCategoryPath } from '@shared/content/site-routes';
import { Seo } from '@/components/seo/Seo';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { MarkdownBody } from '@/components/shared/MarkdownBody';
import { blogPostingStack, organization } from '@/lib/schema';
import NotFound from '@/pages/NotFound';

export function BlogTemplate() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getPostBySlug(slug) : undefined;

  if (!post) {
    return <NotFound />;
  }

  const formattedDate = post.data.pubDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const categories = getCategoryTerms(post);
  const tags = getTagTerms(post);
  const path = getPostUrl(post);
  const siteCategory = categories.map((c) => resolveBlogCategory(c.slug) ?? resolveBlogCategory(c.name)).find(Boolean);

  return (
    <div className="min-h-screen bg-ennis-dark">
      <Seo
        title={post.data.title}
        description={getPostExcerpt(post)}
        canonicalPath={path}
        ogType="article"
        ogImage={post.data.heroImage}
        article={{
          publishedTime: post.data.pubDate.toISOString(),
          modifiedTime: (post.data.updatedDate ?? post.data.pubDate).toISOString(),
          author: post.data.author,
          tags: post.data.tags,
        }}
        jsonLd={[...blogPostingStack({ data: post.data, path, body: post.body }), organization()]}
      />
      <div className="container mx-auto px-4 py-12">
        <Breadcrumbs
          items={[
            { label: 'Home', path: '/' },
            { label: 'Blog', path: '/blog/' },
            ...(siteCategory ? [{ label: siteCategory.name, path: blogCategoryPath(siteCategory.slug) }] : []),
            { label: post.data.title },
          ]}
          className="mb-6"
        />
        {/* Back Button */}
        <Link
          to="/blog/"
          className="inline-flex items-center gap-2 text-ennis-orange hover:text-ennis-orange-bright transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </Link>

        {/* Featured Image */}
        {post.data.heroImage && (
          <div className="mb-8 rounded-lg overflow-hidden">
            <img
              src={post.data.heroImage}
              alt={post.data.heroImageAlt || post.data.title}
              width={1200}
              height={630}
              className="w-full h-auto object-cover max-h-96"
            />
          </div>
        )}

        {/* Post Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">{post.data.title}</h1>

          <div className="flex items-center gap-4 text-gray-400 mb-6">
            <span>{formattedDate}</span>
            {post.data.author && (
              <>
                <span>•</span>
                <span>{post.data.author}</span>
              </>
            )}
          </div>

          {categories.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {categories.map((cat) => {
                const site = resolveBlogCategory(cat.slug) ?? resolveBlogCategory(cat.name);
                const cls = 'inline-block px-3 py-1 bg-ennis-orange/20 border border-ennis-orange rounded-full text-ennis-orange text-xs font-semibold tracking-widest uppercase';
                return site ? (
                  <Link key={cat.slug} to={blogCategoryPath(site.slug)} className={cls}>
                    {site.name}
                  </Link>
                ) : (
                  <span key={cat.slug} className={cls}>
                    {cat.name}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Post Content */}
        <div className="max-w-3xl">
          <MarkdownBody>{post.body}</MarkdownBody>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-700">
            <h3 className="text-lg font-bold text-white mb-4">Tags</h3>
            <div className="flex gap-2 flex-wrap">
              {tags.map((tag) => (
                <span
                  key={tag.slug}
                  className="inline-block px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-full text-sm transition-colors"
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

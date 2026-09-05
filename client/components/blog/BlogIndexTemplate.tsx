import { Link } from 'react-router-dom';
import { getPublishedPosts, getPostUrl, getPostExcerpt } from '../../lib/blog';
import { BLOG_CATEGORIES, blogCategoryPath } from '@shared/content/site-routes';
import { Seo } from '@/components/seo/Seo';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { webPage, itemList } from '@/lib/schema';

export function BlogIndexTemplate() {
  const posts = getPublishedPosts();
  const description = 'Stories, tips, and adventures from the Ennis Slingshot Experience: bluebonnet season, things to do in Ennis and DFW, Dallas date ideas, and Polaris Slingshot 101.';

  return (
    <div className="min-h-screen bg-ennis-dark">
      <Seo
        title="Blog | Ennis Slingshot Experience"
        description={description}
        canonicalPath="/blog/"
        jsonLd={[
          webPage({ path: '/blog/', name: 'Ennis Slingshot Blog', description, type: 'CollectionPage' }),
          itemList(
            'Latest posts',
            posts.map((p) => ({ name: p.data.title, url: getPostUrl(p), description: getPostExcerpt(p) })),
            { path: '/blog/' },
          ),
        ]}
      />
      <div className="container mx-auto px-4 py-12">
        <Breadcrumbs items={[{ label: 'Home', path: '/' }, { label: 'Blog' }]} className="mb-6" />
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-black text-white mb-4">
            <span className="text-ennis-orange">Blog</span>
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
        </div>

        {/* Blog Posts Grid */}
        {posts.length > 0 ? (
          <div className="max-w-4xl mx-auto grid gap-8 md:grid-cols-2">
            {posts.map((post) => (
              <Link
                key={post.id}
                to={getPostUrl(post)}
                className="group bg-gray-900 border border-gray-700 hover:border-ennis-orange rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-ennis-orange/20"
              >
                {/* Featured Image */}
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

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-3">
                    <span>
                      {post.data.pubDate.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-ennis-orange transition-colors">
                    {post.data.title}
                  </h2>

                  <p className="text-gray-300 line-clamp-2 mb-4">{getPostExcerpt(post)}</p>

                  <div className="inline-flex items-center gap-2 text-ennis-orange group-hover:gap-4 transition-all">
                    Read More
                    <span className="text-lg">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No blog posts yet. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
}

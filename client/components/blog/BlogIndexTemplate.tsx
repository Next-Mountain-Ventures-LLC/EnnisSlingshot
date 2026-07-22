import { Link } from 'react-router-dom';
import { getPublishedPosts, getPostUrl, getPostExcerpt } from '../../lib/blog';

export function BlogIndexTemplate() {
  const posts = getPublishedPosts();

  return (
    <div className="min-h-screen bg-ennis-dark">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-black text-white mb-4">
            <span className="text-ennis-orange">Blog</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Stories, tips, and adventures from the Slingshot experience
          </p>
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

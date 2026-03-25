import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProcessedPost } from '../../lib/wordpress';

export function BlogIndexTemplate() {
  const [posts, setPosts] = useState<ProcessedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPosts() {
      try {
        const response = await fetch('/blog/carousel-data.json');
        if (!response.ok) {
          throw new Error('Failed to fetch blog posts');
        }
        const data = await response.json();
        setPosts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    }

    loadPosts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-ennis-dark flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ennis-orange"></div>
          <p className="text-gray-300 mt-4">Loading blog posts...</p>
        </div>
      </div>
    );
  }

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

        {error && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6 mb-12 max-w-3xl mx-auto">
            <h2 className="text-red-400 font-bold mb-2">Error Loading Posts</h2>
            <p className="text-gray-300">{error}</p>
          </div>
        )}

        {/* Blog Posts Grid */}
        {posts && posts.length > 0 ? (
          <div className="max-w-4xl mx-auto grid gap-8 md:grid-cols-2">
            {posts.map((post) => (
              <Link
                key={post.id}
                to={`/blog/${post.slug}`}
                className="group bg-gray-900 border border-gray-700 hover:border-ennis-orange rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-ennis-orange/20"
              >
                {/* Featured Image */}
                {post.featuredMedia && (
                  <div className="relative overflow-hidden bg-gray-800 h-48">
                    <img
                      src={post.featuredMedia.url}
                      alt={post.featuredMedia.alt || post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-3">
                    <span>{new Date(post.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}</span>
                  </div>

                  <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-ennis-orange transition-colors">
                    {post.title}
                  </h2>

                  <p className="text-gray-300 line-clamp-2 mb-4">{post.excerpt}</p>

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

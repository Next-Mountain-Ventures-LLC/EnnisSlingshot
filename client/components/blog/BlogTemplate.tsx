import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ProcessedPost } from '../../lib/wordpress';

export function BlogTemplate() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<ProcessedPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // In production, this data comes from the build process
    // For now, fetch carousel data and search for the post
    async function loadPost() {
      try {
        if (!slug) {
          setError('No post slug provided');
          setLoading(false);
          return;
        }

        // Try to fetch carousel data first (which has recent posts)
        const response = await fetch('/blog/carousel-data.json');
        if (response.ok) {
          const posts = await response.json();
          const foundPost = posts.find((p: ProcessedPost) => p.slug === slug);
          if (foundPost) {
            setPost(foundPost);
            setLoading(false);
            return;
          }
        }

        // If not in carousel, return placeholder
        setError(`Post "${slug}" not found`);
        setLoading(false);
      } catch (err) {
        setError(`Failed to load post: ${err instanceof Error ? err.message : String(err)}`);
        setLoading(false);
      }
    }

    loadPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-ennis-dark flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ennis-orange"></div>
          <p className="text-gray-300 mt-4">Loading post...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-ennis-dark">
        <div className="container mx-auto px-4 py-12">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-ennis-orange hover:text-ennis-orange-bright transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>

          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6">
            <h1 className="text-2xl font-bold text-red-400 mb-2">Post Not Found</h1>
            <p className="text-gray-300">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-ennis-dark">
      <div className="container mx-auto px-4 py-12">
        {/* Back Button */}
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-ennis-orange hover:text-ennis-orange-bright transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </Link>

        {/* Featured Image */}
        {post.featuredMedia && (
          <div className="mb-8 rounded-lg overflow-hidden">
            <img
              src={post.featuredMedia.url}
              alt={post.featuredMedia.alt || post.title}
              className="w-full h-auto object-cover max-h-96"
            />
          </div>
        )}

        {/* Post Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">{post.title}</h1>

          <div className="flex items-center gap-4 text-gray-400 mb-6">
            <span>{formattedDate}</span>
            {post.author && (
              <>
                <span>•</span>
                <div className="flex items-center gap-2">
                  {post.author.avatar && (
                    <img
                      src={post.author.avatar}
                      alt={post.author.name}
                      className="w-6 h-6 rounded-full"
                    />
                  )}
                  <span>{post.author.name}</span>
                </div>
              </>
            )}
          </div>

          {post.categories && post.categories.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {post.categories.map((cat) => (
                <span
                  key={cat.id}
                  className="inline-block px-3 py-1 bg-ennis-orange/20 border border-ennis-orange rounded-full text-ennis-orange text-xs font-semibold tracking-widest uppercase"
                >
                  {cat.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Post Content */}
        <div className="max-w-3xl">
          <div className="prose prose-invert max-w-none">
            <div
              className="text-gray-300 leading-relaxed space-y-4"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-700">
            <h3 className="text-lg font-bold text-white mb-4">Tags</h3>
            <div className="flex gap-2 flex-wrap">
              {post.tags.map((tag) => (
                <span
                  key={tag.id}
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

import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft } from 'lucide-react';
import { getPostBySlug, getCategoryTerms, getTagTerms } from '../../lib/blog';

export function BlogTemplate() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getPostBySlug(slug) : undefined;

  if (!post) {
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
            <p className="text-gray-300">Post "{slug}" not found.</p>
          </div>
        </div>
      </div>
    );
  }

  const formattedDate = post.data.pubDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const categories = getCategoryTerms(post);
  const tags = getTagTerms(post);

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
        {post.data.heroImage && (
          <div className="mb-8 rounded-lg overflow-hidden">
            <img
              src={post.data.heroImage}
              alt={post.data.heroImageAlt || post.data.title}
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
              {categories.map((cat) => (
                <span
                  key={cat.slug}
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
          <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed">
            <ReactMarkdown>{post.body}</ReactMarkdown>
          </div>
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

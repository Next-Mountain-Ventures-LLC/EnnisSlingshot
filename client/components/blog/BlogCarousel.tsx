import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ProcessedPost } from '../../lib/wordpress';

interface BlogCarouselProps {
  limit?: number;
}

export function BlogCarousel({ limit = 4 }: BlogCarouselProps) {
  const [posts, setPosts] = useState<ProcessedPost[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
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
        setPosts(data.slice(0, limit));
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        console.error('Error loading blog carousel:', err);
      } finally {
        setLoading(false);
      }
    }

    loadPosts();
  }, [limit]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? posts.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === posts.length - 1 ? 0 : prev + 1));
  };

  if (loading) {
    return (
      <div className="w-full h-80 bg-gray-900 rounded-lg border border-gray-700 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-ennis-orange"></div>
          <p className="text-gray-400 mt-3">Loading blog posts...</p>
        </div>
      </div>
    );
  }

  if (error || posts.length === 0) {
    return (
      <div className="w-full bg-gray-900 rounded-lg border border-gray-700 p-6 text-center">
        <p className="text-gray-400">Unable to load blog posts at this time.</p>
      </div>
    );
  }

  const currentPost = posts[currentIndex];
  const formattedDate = new Date(currentPost.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div>
      {/* Carousel Container */}
      <div className="relative">
        {/* Blog Card Display */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden min-h-80">
          <div className="flex flex-col md:flex-row h-full">
            {/* Featured Image */}
            {currentPost.featuredMedia && (
              <div className="w-full md:w-1/3 h-64 md:h-auto bg-gray-800 overflow-hidden">
                <img
                  src={currentPost.featuredMedia.url}
                  alt={currentPost.featuredMedia.alt || currentPost.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Content */}
            <div className={`flex flex-col justify-between p-6 md:p-8 ${currentPost.featuredMedia ? 'md:w-2/3' : 'w-full'}`}>
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs text-gray-400 uppercase tracking-wider">
                    {formattedDate}
                  </span>
                </div>
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-3">
                  {currentPost.title}
                </h3>
                <p className="text-gray-300 text-lg leading-relaxed">
                  {currentPost.excerpt}
                </p>
              </div>

              <div>
                <Link
                  to={`/blog/${currentPost.slug}`}
                  className="inline-flex items-center gap-2 px-6 py-2 bg-ennis-orange hover:bg-ennis-orange-bright text-ennis-dark font-bold rounded-lg transition-all duration-300 hover:scale-105"
                >
                  Read More
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Controls */}
        {posts.length > 1 && (
          <>
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={goToPrevious}
                className="rounded-full w-12 h-12 p-0 border border-gray-700 hover:border-ennis-orange hover:bg-ennis-orange/10 transition-colors text-gray-300 font-bold text-lg"
                aria-label="Previous post"
              >
                ‹
              </button>

              {/* Dots */}
              <div className="flex gap-2">
                {posts.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      idx === currentIndex ? 'bg-ennis-orange' : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                    aria-label={`Go to post ${idx + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={goToNext}
                className="rounded-full w-12 h-12 p-0 border border-gray-700 hover:border-ennis-orange hover:bg-ennis-orange/10 transition-colors text-gray-300 font-bold text-lg"
                aria-label="Next post"
              >
                ›
              </button>
            </div>

            {/* Post Counter */}
            <p className="text-center text-gray-500 text-sm mt-4">
              {currentIndex + 1} of {posts.length}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

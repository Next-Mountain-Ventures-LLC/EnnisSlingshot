import { useState } from "react";

const blogPosts = [
  {
    id: 1,
    title: "Ultimate Guide to Slingshot Performance",
    excerpt: "Learn the ins and outs of your Polaris Slingshot SL, from acceleration techniques to handling tips.",
    category: "Guide",
  },
  {
    id: 2,
    title: "Best Time to Visit Bluebonnet Country",
    excerpt: "Discover when the bluebonnets are in full bloom and plan your perfect Ennis adventure.",
    category: "Travel",
  },
  {
    id: 3,
    title: "Safety First: Everything You Need to Know",
    excerpt: "Comprehensive safety information and best practices for your Slingshot rental experience.",
    category: "Safety",
  },
  {
    id: 4,
    title: "Experience Stories from Our Riders",
    excerpt: "Read inspiring stories from adventurers who've taken on the Bluebonnet Trails.",
    category: "Stories",
  },
];

export function MoreInfo() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? blogPosts.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === blogPosts.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="py-12 md:py-20 bg-ennis-dark">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            More <span className="text-ennis-orange">Information</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Stay informed with our latest guides, stories, and updates about the Slingshot experience
          </p>
        </div>

        {/* Carousel */}
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Blog Card Display */}
            <div className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden p-6 md:p-8 min-h-80 flex flex-col justify-between">
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-ennis-orange/20 border border-ennis-orange rounded-full text-ennis-orange text-xs font-semibold tracking-widest uppercase mb-3">
                  {blogPosts[currentIndex].category}
                </span>
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-3">
                  {blogPosts[currentIndex].title}
                </h3>
                <p className="text-gray-300 text-lg">
                  {blogPosts[currentIndex].excerpt}
                </p>
              </div>
              <div>
                <button className="px-6 py-2 bg-ennis-orange hover:bg-ennis-orange-bright text-ennis-dark font-bold rounded-lg transition-all duration-300 hover:scale-105">
                  Read More →
                </button>
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={goToPrevious}
                className="rounded-full w-12 h-12 p-0 border border-gray-700 hover:border-ennis-orange hover:bg-ennis-orange/10 transition-colors text-gray-300 font-bold text-lg"
              >
                ‹
              </button>

              {/* Dots */}
              <div className="flex gap-2">
                {blogPosts.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      idx === currentIndex ? "bg-ennis-orange" : "bg-gray-700 hover:bg-gray-600"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={goToNext}
                className="rounded-full w-12 h-12 p-0 border border-gray-700 hover:border-ennis-orange hover:bg-ennis-orange/10 transition-colors text-gray-300 font-bold text-lg"
              >
                ›
              </button>
            </div>
          </div>

          {/* Post Counter */}
        <p className="text-center text-gray-500 text-sm mt-4">
          {currentIndex + 1} of {blogPosts.length}
        </p>
      </div>
      </div>
    </section>
  );
}

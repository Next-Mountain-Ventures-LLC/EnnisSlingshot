import { BlogCarousel } from "../blog/BlogCarousel";

export function MoreInfo() {

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

        {/* Blog Carousel */}
        <div className="max-w-4xl mx-auto">
          <BlogCarousel limit={4} />
        </div>
      </div>
    </section>
  );
}

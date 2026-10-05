/**
 * "Keep reading" grid: 3 posts from the same site category (falls back to
 * shared tags, then most-recent) via getRelatedPosts().
 */
import { getRelatedPosts, type BlogPost } from "@/lib/blog";
import { BlogCard } from "./BlogCard";

export function RelatedPosts({ post, count = 3 }: { post: BlogPost; count?: number }) {
  const related = getRelatedPosts(post, count);
  if (!related.length) return null;
  return (
    <section aria-labelledby="related-posts-heading" className="mt-16 pt-10 border-t border-gray-700">
      <h2 id="related-posts-heading" className="text-2xl md:text-3xl font-black text-white mb-6">
        Keep <span className="text-ennis-orange">reading</span>
      </h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {related.map((p, i) => (
          // Two columns between sm and lg: drop the third card rather than leave it alone on a row.
          <BlogCard key={p.id} post={p} headingLevel="h3" className={i === 2 ? "sm:max-lg:hidden" : ""} />
        ))}
      </div>
    </section>
  );
}

export default RelatedPosts;

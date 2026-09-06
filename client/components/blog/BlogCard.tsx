/**
 * Post card for /blog/, category pages and RelatedPosts. Hero image via
 * resolveHeroImage() (local prebuilt copy → remote), fixed 16:9 box with
 * explicit width/height so the grid never shifts while images load.
 */
import { Link } from "react-router-dom";
import { getPostUrl, getPostExcerpt, getPrimaryCategory, getReadingTime, type BlogPost } from "@/lib/blog";
import { resolveHeroImage } from "@/lib/blogImages";

export interface BlogCardProps {
  post: BlogPost;
  /** First cards in a list are above the fold — load eagerly. */
  eager?: boolean;
  /** Heading level for the card title (h2 in lists, h3 inside a titled section). */
  headingLevel?: "h2" | "h3";
  className?: string;
}

export function BlogCard({ post, eager = false, headingLevel = "h2", className = "" }: BlogCardProps) {
  const hero = resolveHeroImage(post);
  const category = getPrimaryCategory(post);
  const Heading = headingLevel;
  const date = post.data.pubDate.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  return (
    <article
      className={`group bg-gray-900 border border-gray-700 hover:border-ennis-orange rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-ennis-orange/20 flex flex-col ${className}`}
    >
      {hero && (
        <Link to={getPostUrl(post)} tabIndex={-1} aria-hidden="true" className="block relative overflow-hidden bg-gray-800 aspect-video">
          <img
            src={hero}
            alt=""
            width={800}
            height={450}
            loading={eager ? "eager" : "lazy"}
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>
      )}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-gray-400 text-sm mb-3">
          <time dateTime={post.data.pubDate.toISOString()}>{date}</time>
          <span aria-hidden="true">·</span>
          <span>{getReadingTime(post)} min read</span>
          {category && (
            <>
              <span aria-hidden="true">·</span>
              <Link to={category.path} className="text-ennis-orange hover:text-ennis-orange-bright uppercase tracking-wider text-xs font-semibold">
                {category.name}
              </Link>
            </>
          )}
        </div>
        <Heading className="text-2xl font-bold text-white mb-3 group-hover:text-ennis-orange transition-colors">
          <Link to={getPostUrl(post)} className="focus:outline-none focus-visible:ring-2 focus-visible:ring-ennis-orange rounded">
            {post.data.title}
          </Link>
        </Heading>
        <p className="text-gray-300 line-clamp-3 mb-4 flex-1">{getPostExcerpt(post)}</p>
        <Link to={getPostUrl(post)} className="inline-flex items-center gap-2 text-ennis-orange group-hover:gap-4 transition-all" aria-label={`Read: ${post.data.title}`}>
          Read the post
          <span aria-hidden="true" className="text-lg">→</span>
        </Link>
      </div>
    </article>
  );
}

export default BlogCard;

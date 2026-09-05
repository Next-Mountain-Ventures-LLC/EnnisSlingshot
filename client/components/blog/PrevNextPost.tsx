/**
 * Previous (older) / next (newer) post links by pubDate — getAdjacentPosts().
 */
import { Link } from "react-router-dom";
import { getAdjacentPosts, getPostUrl, type BlogPost } from "@/lib/blog";

export function PrevNextPost({ post }: { post: BlogPost }) {
  const { prev, next } = getAdjacentPosts(post);
  if (!prev && !next) return null;
  const cls = "group flex-1 rounded-lg border border-gray-700 hover:border-ennis-orange p-5 transition-colors";
  return (
    <nav aria-label="Previous and next posts" className="mt-12 flex flex-col sm:flex-row gap-4">
      {prev ? (
        <Link to={getPostUrl(prev)} rel="prev" className={cls}>
          <span className="block text-xs uppercase tracking-widest text-gray-500 mb-1">← Previous post</span>
          <span className="block font-bold text-white group-hover:text-ennis-orange transition-colors">{prev.data.title}</span>
        </Link>
      ) : (
        <div className="flex-1" aria-hidden="true" />
      )}
      {next ? (
        <Link to={getPostUrl(next)} rel="next" className={`${cls} sm:text-right`}>
          <span className="block text-xs uppercase tracking-widest text-gray-500 mb-1">Next post →</span>
          <span className="block font-bold text-white group-hover:text-ennis-orange transition-colors">{next.data.title}</span>
        </Link>
      ) : (
        <div className="flex-1" aria-hidden="true" />
      )}
    </nav>
  );
}

export default PrevNextPost;

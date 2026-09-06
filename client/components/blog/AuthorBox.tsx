/**
 * Author byline box at the end of a post (E-E-A-T). Falls back to the
 * DEFAULT_AUTHOR from shared/author.ts when the WordPress sync sent no bio /
 * image. Never renders an email address.
 */
import { resolveAuthor, type Author } from "@shared/author";
import type { BlogPost } from "@/lib/blog";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

function isInternal(url: string): boolean {
  return url.startsWith("/") || url.startsWith("https://ennisslingshot.com");
}

export function AuthorBox({ post, author }: { post?: BlogPost; author?: Author }) {
  const a = author ?? resolveAuthor(post?.data ?? {});
  const href = a.url.replace(/^https:\/\/ennisslingshot\.com/, "") || "/";
  const internal = isInternal(a.url);

  return (
    <aside aria-label="About the author" className="mt-12 rounded-lg border border-gray-700 bg-gray-900/60 p-6 flex gap-5 items-start">
      {a.image ? (
        <img
          src={a.image}
          alt={a.name}
          width={72}
          height={72}
          loading="lazy"
          decoding="async"
          className="w-[72px] h-[72px] rounded-full object-cover flex-shrink-0 border border-gray-700"
        />
      ) : (
        <div
          aria-hidden="true"
          className="w-[72px] h-[72px] rounded-full flex-shrink-0 bg-ennis-orange/20 border border-ennis-orange text-ennis-orange font-black text-xl flex items-center justify-center"
        >
          {initials(a.name)}
        </div>
      )}
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">Written by</p>
        <p className="text-lg font-bold text-white">
          {internal ? (
            <a href={href} className="hover:text-ennis-orange transition-colors">{a.name}</a>
          ) : (
            <a href={a.url} rel="author noopener" target="_blank" className="hover:text-ennis-orange transition-colors">
              {a.name}
            </a>
          )}
        </p>
        {a.bio && <p className="text-gray-300 mt-2 leading-relaxed">{a.bio}</p>}
      </div>
    </aside>
  );
}

export default AuthorBox;

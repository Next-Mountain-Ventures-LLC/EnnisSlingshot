/**
 * Default blog author. The WordPress sync writes `author`, `authorUrl`,
 * `authorBio`, `authorImage` per post; anything missing falls back to this so
 * every post always renders an AuthorBox and a Person entity in JSON-LD.
 *
 * TODO(owner): confirm the bio wording and supply a headshot URL + a public
 * profile URL (authorUrl on posts currently points at the WordPress staging
 * host and is ignored — see isPublicAuthorUrl()).
 */
import { SITE_URL } from "./business";

export interface Author {
  name: string;
  /** Public profile page (site path or absolute URL). */
  url: string;
  bio: string;
  /** Absolute URL of a square headshot; undefined → initials avatar. */
  image?: string;
  email?: string;
}

export const DEFAULT_AUTHOR: Author = {
  name: "Joshua Ford",
  url: `${SITE_URL}/about/`,
  bio: "Joshua writes the Ennis Slingshot Experience blog: what it's like to drive a Polaris Slingshot, how the Ennis Bluebonnet Trails work, and what to do around Ennis and DFW.",
  image: undefined,
  email: undefined,
};

/** Author URLs that must never be linked publicly (WordPress hosts, staging). */
const PRIVATE_AUTHOR_HOSTS = [
  "mystagingwebsite.com",
  "blog.nxtmt.ventures",
  "wordpress.com",
  "wp.com",
];

export function isPublicAuthorUrl(url?: string): url is string {
  if (!url) return false;
  try {
    const host = new URL(url).hostname.toLowerCase();
    return !PRIVATE_AUTHOR_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));
  } catch {
    return false;
  }
}

/** Merge a post's author fields with the default author. */
export function resolveAuthor(post: {
  author?: string;
  authorUrl?: string;
  authorBio?: string;
  authorImage?: string;
  authorEmail?: string;
}): Author {
  const name = post.author?.trim() || DEFAULT_AUTHOR.name;
  const isDefault = name.toLowerCase() === DEFAULT_AUTHOR.name.toLowerCase();
  return {
    name,
    url: isPublicAuthorUrl(post.authorUrl) ? post.authorUrl : isDefault ? DEFAULT_AUTHOR.url : `${SITE_URL}/about/`,
    bio: post.authorBio?.trim() || (isDefault ? DEFAULT_AUTHOR.bio : ""),
    image: post.authorImage || (isDefault ? DEFAULT_AUTHOR.image : undefined),
    email: undefined, // never publish author emails
  };
}

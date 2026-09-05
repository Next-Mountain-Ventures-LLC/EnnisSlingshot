/**
 * /blog/<slug>/ — single post. Everything visible here is prerendered:
 * hero (local prebuilt copy → remote), reading time, visible site categories
 * (the WordPress routing category "EnnisSlingshot.com" is never rendered —
 * see getVisibleCategoryTerms), body, tags, AuthorBox, PrevNextPost,
 * RelatedPosts. JSON-LD: BlogPosting + Person + Organization + BreadcrumbList.
 *
 * `<!-- IMAGE: … -->` notes the writers leave in synced bodies are HTML
 * comments; react-markdown parses them as `html` nodes and, with raw HTML
 * disabled (the default — no rehype-raw), drops them, so they never render.
 */
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock } from 'lucide-react';
import {
  getPostBySlug,
  getPostUrl,
  getVisibleCategoryTerms,
  getTagTerms,
  getPostExcerpt,
  getReadingTime,
  getWordCount,
} from '../../lib/blog';
import { resolveHeroImage, resolveOgImage } from '@/lib/blogImages';
import { resolveAuthor } from '@shared/author';
import { Seo } from '@/components/seo/Seo';
import { Breadcrumbs, breadcrumbTrail, type BreadcrumbItem } from '@/components/layout/Breadcrumbs';
import { MarkdownBody } from '@/components/shared/MarkdownBody';
import { blogPostingStack, organization, breadcrumbList } from '@/lib/schema';
import { AuthorBox } from './AuthorBox';
import { RelatedPosts } from './RelatedPosts';
import { PrevNextPost } from './PrevNextPost';
import NotFound from '@/pages/NotFound';
import { LCP_IMG_PROPS } from '@/lib/media';

export function BlogTemplate() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getPostBySlug(slug) : undefined;

  if (!post) {
    return <NotFound />;
  }

  const formattedDate = post.data.pubDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const updated = post.data.updatedDate && post.data.updatedDate.getTime() - post.data.pubDate.getTime() > 24 * 3600 * 1000
    ? post.data.updatedDate
    : undefined;

  const categories = getVisibleCategoryTerms(post);
  const primary = categories[0];
  const tags = getTagTerms(post);
  const path = getPostUrl(post);
  const hero = resolveHeroImage(post);
  const author = resolveAuthor(post.data);
  const readingTime = getReadingTime(post);

  const crumbs: BreadcrumbItem[] = [
    { label: 'Home', path: '/' },
    { label: 'Blog', path: '/blog/' },
    ...(primary ? [{ label: primary.name, path: primary.path }] : []),
    { label: post.data.title },
  ];

  return (
    <div className="min-h-screen bg-ennis-dark">
      <Seo
        title={post.data.title}
        description={getPostExcerpt(post)}
        canonicalPath={path}
        ogType="article"
        ogImage={resolveOgImage(post)}
        article={{
          publishedTime: post.data.pubDate.toISOString(),
          modifiedTime: (post.data.updatedDate ?? post.data.pubDate).toISOString(),
          author: author.name,
          tags: post.data.tags,
        }}
        jsonLd={[
          ...blogPostingStack({
            data: post.data,
            path,
            body: post.body,
            image: hero,
            fallbackImage: resolveOgImage(post),
            author,
            readingTimeMinutes: readingTime,
            wordCount: getWordCount(post),
          }),
          organization(),
          breadcrumbList(breadcrumbTrail(crumbs)),
        ]}
      />
      <div className="container mx-auto px-4 py-12">
        <Breadcrumbs items={crumbs} withSchema={false} className="mb-6" />
        {/* Back Button */}
        <Link
          to={primary?.path ?? '/blog/'}
          className="inline-flex items-center gap-2 text-ennis-orange hover:text-ennis-orange-bright transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          {primary ? `Back to ${primary.name}` : 'Back to Blog'}
        </Link>

        <article className="max-w-3xl">
          {/* Featured Image — the LCP element on post pages */}
          {hero && (
            <div className="mb-8 rounded-lg overflow-hidden bg-gray-800 aspect-video">
              <img
                src={hero}
                alt={post.data.heroImageAlt || post.data.title}
                width={1200}
                height={675}
                decoding="async"
                {...LCP_IMG_PROPS}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Post Header */}
          <header className="mb-8">
            {categories.length > 0 && (
              <div className="flex gap-2 flex-wrap mb-4">
                {categories.map((cat) => (
                  <Link
                    key={cat.slug}
                    to={cat.path}
                    className="inline-block px-3 py-1 bg-ennis-orange/20 border border-ennis-orange rounded-full text-ennis-orange text-xs font-semibold tracking-widest uppercase hover:bg-ennis-orange hover:text-ennis-dark transition-colors"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}

            <h1 className="text-4xl md:text-5xl font-black text-white mb-4">{post.data.title}</h1>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-gray-400">
              <span>
                By{' '}
                <a href={author.url.replace(/^https:\/\/ennisslingshot\.com/, '') || '/'} className="text-gray-200 hover:text-ennis-orange transition-colors">
                  {author.name}
                </a>
              </span>
              <span aria-hidden="true">•</span>
              <time dateTime={post.data.pubDate.toISOString()}>{formattedDate}</time>
              {updated && (
                <>
                  <span aria-hidden="true">•</span>
                  <span>
                    Updated{' '}
                    <time dateTime={updated.toISOString()}>
                      {updated.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </time>
                  </span>
                </>
              )}
              <span aria-hidden="true">•</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-800 px-3 py-0.5 text-sm text-gray-200">
                <Clock className="w-3.5 h-3.5 text-ennis-orange" aria-hidden="true" />
                {readingTime} min read
              </span>
            </div>
          </header>

          {/* Post Content */}
          <MarkdownBody>{post.body}</MarkdownBody>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-700">
              <h2 className="text-lg font-bold text-white mb-4">Tags</h2>
              <ul className="flex gap-2 flex-wrap">
                {tags.map((tag) => (
                  <li
                    key={tag.slug}
                    className="inline-block px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm"
                  >
                    #{tag.name}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <AuthorBox author={author} />
          <PrevNextPost post={post} />
        </article>

        <div className="max-w-5xl">
          <RelatedPosts post={post} />
        </div>
      </div>
    </div>
  );
}

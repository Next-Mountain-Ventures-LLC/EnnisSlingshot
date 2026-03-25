/**
 * WordPress Blog Build Script
 * Generates static HTML blog pages at build time
 * Runs before the React/Vite build process
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';

// Types matching the WordPress API layer
interface WordPressCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
}

interface ProcessedPost {
  id: number;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  date: string;
  modified: string;
  featuredMedia?: {
    url: string;
    alt: string;
  };
  categories: {
    id: number;
    name: string;
    slug: string;
  }[];
  tags: {
    id: number;
    name: string;
    slug: string;
  }[];
  author?: {
    id: number;
    name: string;
    avatar: string;
  };
}

const WP_API_URL = process.env.WORDPRESS_API_URL || 'https://blog.nxtmt.ventures/wp-json/wp/v2';
const WORDPRESS_CATEGORY_SLUG = process.env.WORDPRESS_CATEGORY_SLUG || 'ennisslingshot.com';
const DIST_DIR = path.join(process.cwd(), 'dist');
const BLOG_DIST_DIR = path.join(DIST_DIR, 'blog');
const CACHE_FILE = path.join(process.cwd(), '.blog-cache.json');

/**
 * Fetch with timeout and retries
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit & { timeout?: number; retries?: number } = {}
): Promise<Response> {
  const { timeout = 15000, retries = 2, ...fetchOptions } = options;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
        headers: {
          ...fetchOptions.headers,
          'User-Agent': 'EnnisSlingshot-Build/1.0',
        },
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      lastError = error as Error;

      if (attempt === retries + 1) {
        throw lastError;
      }

      const backoffMs = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
      console.warn(`  ⚠️ Attempt ${attempt} failed, retrying in ${backoffMs}ms...`);
      await new Promise((resolve) => setTimeout(resolve, backoffMs));
    }
  }

  throw lastError || new Error('Unknown fetch error');
}

/**
 * Get WordPress category ID
 */
async function getCategoryId(): Promise<number | null> {
  try {
    console.log(`📡 Fetching categories...`);
    const response = await fetchWithTimeout(`${WP_API_URL}/categories?per_page=100`);

    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.status}`);
    }

    const categories: WordPressCategory[] = await response.json();
    console.log(`✅ Found ${categories.length} categories`);

    const targetCategory = categories.find(
      (cat) =>
        cat.slug === WORDPRESS_CATEGORY_SLUG ||
        cat.name.toLowerCase().includes(WORDPRESS_CATEGORY_SLUG.replace('-', ' '))
    );

    if (targetCategory) {
      console.log(`✅ Found "${WORDPRESS_CATEGORY_SLUG}" category with ID: ${targetCategory.id}`);
      return targetCategory.id;
    }

    console.warn(`⚠️ Category not found, using fallback ID 6`);
    return 6;
  } catch (error) {
    console.error('❌ Error fetching categories:', error);
    return 6;
  }
}

/**
 * Strip HTML tags from text
 */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .trim();
}

/**
 * Process a WordPress post
 */
function processPost(post: any): ProcessedPost {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title.rendered,
    content: post.content.rendered,
    excerpt: stripHtml(post.excerpt.rendered),
    date: post.date,
    modified: post.modified,
    featuredMedia: post._embedded?.['wp:featuredmedia']?.[0]
      ? {
          url: post._embedded['wp:featuredmedia'][0].source_url,
          alt: post._embedded['wp:featuredmedia'][0].alt_text || '',
        }
      : undefined,
    categories:
      post._embedded?.['wp:term']?.[0]?.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
      })) || [],
    tags:
      post._embedded?.['wp:term']?.[1]?.map((tag: any) => ({
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
      })) || [],
    author: post._embedded?.author?.[0]
      ? {
          id: post._embedded.author[0].id,
          name: post._embedded.author[0].name,
          avatar: post._embedded.author[0].avatar_urls['48'] || '',
        }
      : undefined,
  };
}

/**
 * Fetch all posts from WordPress
 */
async function fetchPosts(categoryId: number): Promise<ProcessedPost[]> {
  try {
    console.log(`📡 Fetching posts from category ID ${categoryId}...`);

    const params = new URLSearchParams({
      categories: String(categoryId),
      per_page: '100',
      _embed: 'true',
    });

    const response = await fetchWithTimeout(`${WP_API_URL}/posts?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch posts: ${response.status}`);
    }

    const posts = await response.json();
    const processedPosts = posts.map(processPost);

    console.log(`✅ Fetched ${processedPosts.length} posts`);
    return processedPosts;
  } catch (error) {
    console.error('❌ Error fetching posts:', error);
    return [];
  }
}

/**
 * Create directory if it doesn't exist
 */
function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Generate HTML for a blog post detail page
 */
function generatePostHTML(post: ProcessedPost): string {
  const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${post.excerpt}">
  <meta property="og:title" content="${post.title}">
  <meta property="og:description" content="${post.excerpt}">
  ${post.featuredMedia ? `<meta property="og:image" content="${post.featuredMedia.url}">` : ''}
  <meta property="og:type" content="article">
  <link rel="canonical" href="https://ennisslingshot.com/blog/${post.slug}/">
  <title>${post.title} - Ennis Slingshot</title>
  <script>
    // Redirect to React app with blog slug
    window.location.href = '/blog/${post.slug}';
  </script>
</head>
<body>
  <p>Redirecting to blog post...</p>
</body>
</html>`;
}

/**
 * Generate HTML for blog index page
 */
function generateIndexHTML(posts: ProcessedPost[]): string {
  const postCards = posts
    .map(
      (post) => `
  <div class="post-card">
    <h3><a href="/blog/${post.slug}/">${post.title}</a></h3>
    <p class="date">${new Date(post.date).toLocaleDateString()}</p>
    <p>${post.excerpt}</p>
  </div>
`
    )
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Blog posts about Slingshot experiences and adventures">
  <title>Blog - Ennis Slingshot</title>
  <script>
    // Redirect to React app blog page
    window.location.href = '/blog';
  </script>
</head>
<body>
  <p>Redirecting to blog...</p>
</body>
</html>`;
}

/**
 * Write static HTML files for blog posts
 */
function generateStaticPages(posts: ProcessedPost[]): void {
  console.log(`📝 Generating static pages...`);

  ensureDir(BLOG_DIST_DIR);

  // Generate individual post pages
  for (const post of posts) {
    const postDir = path.join(BLOG_DIST_DIR, post.slug);
    ensureDir(postDir);

    const html = generatePostHTML(post);
    const filePath = path.join(postDir, 'index.html');

    fs.writeFileSync(filePath, html);
    console.log(`  ✅ Generated /blog/${post.slug}/`);
  }

  // Generate blog index page
  const indexHTML = generateIndexHTML(posts);
  const indexPath = path.join(BLOG_DIST_DIR, 'index.html');
  fs.writeFileSync(indexPath, indexHTML);
  console.log(`  ✅ Generated /blog/`);

  console.log(`✅ Generated ${posts.length} blog pages`);
}

/**
 * Export carousel data for homepage
 */
function exportCarouselData(posts: ProcessedPost[]): void {
  const carouselPosts = posts.slice(0, 4).map((post) => ({
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    date: post.date,
    featuredMedia: post.featuredMedia,
    author: post.author,
  }));

  const dataPath = path.join(BLOG_DIST_DIR, 'carousel-data.json');
  fs.writeFileSync(dataPath, JSON.stringify(carouselPosts, null, 2));

  console.log(`✅ Exported carousel data for homepage`);
}

/**
 * Save cache metadata
 */
function saveCacheMetadata(posts: ProcessedPost[]): void {
  const cacheData = {
    buildTime: new Date().toISOString(),
    postCount: posts.length,
    postIds: posts.map((p) => ({
      id: p.id,
      slug: p.slug,
      modified: p.modified,
    })),
  };

  fs.writeFileSync(CACHE_FILE, JSON.stringify(cacheData, null, 2));
}

/**
 * Main build function
 */
async function build(): Promise<void> {
  console.log('🚀 Starting WordPress blog build...\n');

  try {
    // Get category ID
    const categoryId = await getCategoryId();
    if (!categoryId) {
      throw new Error('Could not determine WordPress category ID');
    }

    // Fetch posts
    const posts = await fetchPosts(categoryId);
    if (posts.length === 0) {
      console.warn('⚠️ No posts found from WordPress. Blog will be empty.');
    }

    // Generate static pages
    if (posts.length > 0) {
      generateStaticPages(posts);
      exportCarouselData(posts);
      saveCacheMetadata(posts);
    }

    console.log('\n✅ WordPress blog build completed successfully!\n');
  } catch (error) {
    console.error('\n❌ WordPress blog build failed:', error);
    console.log('⚠️ Continuing build without blog functionality...\n');
  }
}

// Run the build
build().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

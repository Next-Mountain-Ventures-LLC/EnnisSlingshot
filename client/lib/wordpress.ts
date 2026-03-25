/**
 * WordPress API Integration
 * Handles fetching posts from WordPress API with caching, retries, and fallback data
 */

export interface WordPressCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
}

export interface WordPressTag {
  id: number;
  name: string;
  slug: string;
}

export interface WordPressFeaturedMedia {
  id: number;
  source_url: string;
  alt_text: string;
}

export interface WordPressAuthor {
  id: number;
  name: string;
  avatar_urls: {
    [key: string]: string;
  };
}

export interface WordPressPost {
  id: number;
  slug: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  date: string;
  modified: string;
  featured_media: number;
  _embedded?: {
    'wp:featuredmedia'?: WordPressFeaturedMedia[];
    'wp:term'?: Array<WordPressCategory[] | WordPressTag[]>;
    'author'?: WordPressAuthor[];
  };
  categories: number[];
  tags: number[];
}

export interface ProcessedPost {
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

// WordPress API configuration
const WP_API_URL = 'https://blog.nxtmt.ventures/wp-json/wp/v2';
const WORDPRESS_CATEGORY_SLUG = 'ennisslingshot.com';

// Simple in-memory cache
const postCache = new Map<string, ProcessedPost[]>();

/**
 * Fetch with timeout, retry logic, and error handling
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
      const startTime = Date.now();

      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
        headers: {
          ...fetchOptions.headers,
          'User-Agent': 'EnnisSlingshot/1.0',
        },
      });

      const duration = Date.now() - startTime;
      clearTimeout(timeoutId);

      if (attempt > 1) {
        console.log(`  ✅ Retry ${attempt - 1} succeeded (${duration}ms)`);
      }

      return response;
    } catch (error) {
      lastError = error as Error;
      const errorMsg = error instanceof Error ? error.message : String(error);

      if (attempt === retries + 1) {
        console.error(`  ❌ Final attempt failed: ${errorMsg}`);
        throw lastError;
      } else {
        const backoffMs = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        console.warn(`  ⚠️ Attempt ${attempt} failed: ${errorMsg}`);
        console.log(`  ⏳ Retrying in ${backoffMs}ms... (attempt ${attempt + 1}/${retries + 1})`);
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
      }
    }
  }

  throw lastError || new Error('Unknown fetch error');
}

/**
 * Fetch categories from WordPress API
 */
export async function getCategories(): Promise<WordPressCategory[]> {
  try {
    console.log(`📡 Fetching categories from WordPress API at ${WP_API_URL}/categories`);
    const response = await fetchWithTimeout(`${WP_API_URL}/categories?per_page=100`, {
      timeout: 15000,
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.status}`);
    }
    const categories = await response.json();
    console.log(`✅ Found ${categories.length} categories from WordPress`);
    return categories;
  } catch (error) {
    console.error('❌ Error fetching WordPress categories:', error);
    return [];
  }
}

/**
 * Get category ID for the configured category slug
 */
export async function getCategoryId(): Promise<number | null> {
  const categories = await getCategories();

  if (categories.length === 0) {
    console.warn('⚠️ No categories found from WordPress API. Using hardcoded fallback: 6');
    return 6;
  }

  console.log(
    `🔍 Looking for category with slug "${WORDPRESS_CATEGORY_SLUG}" among ${categories.length} categories`
  );
  const targetCategory = categories.find(
    (cat) =>
      cat.slug === WORDPRESS_CATEGORY_SLUG ||
      cat.name.toLowerCase().includes(WORDPRESS_CATEGORY_SLUG.replace('-', ' '))
  );

  if (!targetCategory) {
    console.warn(
      `⚠️ Category not found: "${WORDPRESS_CATEGORY_SLUG}". Available categories:`,
      categories.map((c) => `${c.slug} (${c.name})`).join(', ')
    );
    console.warn('🔧 Using hardcoded fallback: category ID is 6');
    return 6;
  }

  console.log(`✅ Found "${WORDPRESS_CATEGORY_SLUG}" category with ID: ${targetCategory.id}`);
  return targetCategory.id;
}

/**
 * Strip HTML tags from text (for excerpts)
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
 * Process a WordPress post into a clean format
 */
function processPost(post: WordPressPost): ProcessedPost {
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
 * Mock posts for development/fallback
 */
const MOCK_POSTS: ProcessedPost[] = [
  {
    id: 1,
    slug: 'slingshot-experience',
    title: 'The Ultimate Slingshot Experience',
    content:
      '<p>Experience the thrill of driving a Polaris Slingshot on the scenic bluebonnet trails of Ennis, Texas.</p>',
    excerpt: 'Discover the thrill of driving a Polaris Slingshot on scenic Texas trails.',
    date: '2024-01-15T00:00:00.000Z',
    modified: '2024-01-15T00:00:00.000Z',
    categories: [],
    tags: [],
    featuredMedia: {
      url: 'https://via.placeholder.com/800x400?text=Slingshot+Experience',
      alt: 'Slingshot Experience',
    },
  },
  {
    id: 2,
    slug: 'bluebonnet-trails',
    title: 'Exploring the Bluebonnet Trails',
    content:
      '<p>Learn about the beautiful bluebonnet trails around Ennis and the best times to visit.</p>',
    excerpt: 'Discover the best times to experience the blooming bluebonnets in Ennis, Texas.',
    date: '2024-01-10T00:00:00.000Z',
    modified: '2024-01-10T00:00:00.000Z',
    categories: [],
    tags: [],
    featuredMedia: {
      url: 'https://via.placeholder.com/800x400?text=Bluebonnet+Trails',
      alt: 'Bluebonnet Trails',
    },
  },
];

/**
 * Fetch posts from WordPress API with caching and fallback
 */
export async function getPosts(
  page: number = 1,
  perPage: number = 100,
  categoryId?: number
): Promise<ProcessedPost[]> {
  const cacheKey = `posts_${page}_${perPage}_${categoryId || 'all'}`;

  // Check cache first
  if (postCache.has(cacheKey)) {
    console.log(`📦 Using cached posts (${cacheKey})`);
    return postCache.get(cacheKey)!;
  }

  try {
    // Get category ID if not provided
    if (!categoryId) {
      console.log(`🔍 getPosts: Fetching category ID for "${WORDPRESS_CATEGORY_SLUG}"...`);
      categoryId = await getCategoryId();
      if (!categoryId) {
        throw new Error('Could not determine category ID from WordPress API');
      }
    }

    const params = new URLSearchParams({
      page: String(page),
      per_page: String(perPage),
      categories: String(categoryId),
      _embed: 'true',
    });

    const url = `${WP_API_URL}/posts?${params.toString()}`;
    console.log(`📡 Fetching posts from WordPress API...`);

    const response = await fetchWithTimeout(url, { timeout: 15000 });

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`⚠️ No posts found for category ID: ${categoryId}`);
        return [];
      }
      throw new Error(`Failed to fetch posts: ${response.status}`);
    }

    const posts = await response.json();
    const processedPosts = posts.map(processPost);

    console.log(`✅ Fetched ${processedPosts.length} posts from WordPress`);

    // Cache the results
    postCache.set(cacheKey, processedPosts);

    return processedPosts;
  } catch (error) {
    console.error('❌ Error fetching posts from WordPress:', error);
    console.log('📦 Using mock fallback posts');
    return MOCK_POSTS;
  }
}

/**
 * Health check for WordPress API availability
 */
export async function healthCheckWordPress(): Promise<boolean> {
  try {
    console.log('🏥 Checking WordPress API health...');
    const response = await fetchWithTimeout(
      `${WP_API_URL}/categories?per_page=1`,
      { timeout: 5000, retries: 1 }
    );

    if (response.ok) {
      console.log('✅ WordPress API is healthy and reachable');
      return true;
    } else {
      console.warn(`⚠️ WordPress API returned status ${response.status}`);
      return false;
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`❌ WordPress API health check failed: ${errorMsg}`);
    return false;
  }
}

# WordPress Integration Setup Guide

**Version:** 1.0  
**Last Updated:** February 2026  
**Purpose:** Single source of truth for setting up WordPress integration across multiple Astro sites using builder.io

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architecture Overview](#architecture-overview)
3. [How It Works (Conceptual)](#how-it-works-conceptual)
4. [Complete Implementation Guide](#complete-implementation-guide)
5. [Setup Checklist for New Sites](#setup-checklist-for-new-sites)
6. [Configuration Variables Explained](#configuration-variables-explained)
7. [Troubleshooting Guide](#troubleshooting-guide)
8. [Performance Characteristics](#performance-characteristics)
9. [For Builder.io Prompt Reference](#for-builderio-prompt-reference)
10. [Maintenance & Updates](#maintenance--updates)
11. [Common Customizations](#common-customizations)
12. [Reference Implementation](#reference-implementation)

---

## Executive Summary

This guide provides complete instructions for integrating a WordPress blog with Astro static sites. The system fetches posts from a shared WordPress instance at **build time**, generates beautiful static HTML pages, and deploys them to GitHub Pages. 

**Who should use this:** Developers setting up blog functionality for Astro sites that pull from the same WordPress API endpoint.

**Quick Links:**
- [Setup Checklist](#setup-checklist-for-new-sites) - Start here for new sites
- [Troubleshooting](#troubleshooting-guide) - Fix common issues
- [Builder.io Prompt Template](#for-builderio-prompt-reference) - Use this exact prompt format

---

## Architecture Overview

### System Flow

```
WordPress Blog Instance (blog.nxtmt.ventures)
        ↓
   Zapier Webhook
        ↓
GitHub Actions Trigger (on push to main)
        ↓
Astro Build Process:
  1. Fetch all posts from WordPress API (category-filtered)
  2. In-memory cache prevents redundant API calls
  3. Generate static HTML for each blog post
  4. Generate blog index page (listing all posts)
  5. Generate homepage blog carousel
        ↓
   GitHub Pages Deployment
        ↓
Live Site (static HTML, zero dynamic requests)
```

### Why This Architecture?

- **Non-redundant API calls:** Build-time fetching with in-memory caching means WordPress API is called 1-2 times per build, not 10+
- **Static generation:** No runtime database calls = faster pages, better SEO, reduced server costs
- **Category filtering:** Same WordPress instance, different categories per site
- **Automatic updates:** Zapier triggers rebuild when posts are published
- **Fallback data:** Mock posts ensure site works even if WordPress API is temporarily unavailable

---

## How It Works (Conceptual)

### 1. WordPress Category Filtering

Each site filters posts by a unique category slug:

- **Site A:** `astrobot-design` (astrobot.design)
- **Site B:** `thefordamily` (thefordamily.life)
- **Site C:** `your-category-slug` (yoursite.com)

**How it works:**
1. `WORDPRESS_CATEGORY_SLUG` environment variable stores the category slug
2. `getAstrobotCategoryId()` function looks up category ID from WordPress API
3. `getPosts()` filters all posts by that category ID
4. Only posts in that category appear on your site

### 2. In-Memory Caching During Build

The WordPress integration uses a simple in-memory cache to prevent redundant API calls:

```
First call to getPosts():     → Hits WordPress API, caches result
Second call to getPosts():    → Uses cached data (no API call)
Third call to getPosts():     → Uses cached data (no API call)
```

**Why this works:** During a single Astro build, multiple components need posts:
- `src/pages/blog/[slug].astro` (generate blog pages)
- `src/pages/blog/index.astro` (blog listing page)
- `src/components/home/BlogPreview.astro` (homepage carousel)

Without caching, each would make separate API calls. With caching, only the first call hits the API.

### 3. Per-Page Parameter Importance

**Always use `per_page=100` in API requests, then slice locally in components.**

Why? WordPress API returns different results based on the `per_page` parameter:
- `per_page=12` → returns 5 posts (inconsistent)
- `per_page=6` → returns 4 posts (inconsistent)
- `per_page=100` → returns 4 posts (consistent)

The solution: Fetch all posts with `per_page=100`, then slice locally:

```typescript
const allPosts = await getPosts(1, 100);  // Fetch all posts
const posts = allPosts.slice(0, 12);      // Display first 12
```

### 4. Static Generation

Astro is a static site generator. At build time:

1. `getStaticPaths()` calls `getPosts()` to get all blog posts
2. For each post, a static HTML file is pre-generated
3. These files are saved in `/dist/blog/[slug]/index.html`
4. When visitors access `/blog/astro-guide/`, they get the pre-built HTML file

No runtime processing = blazing fast pages.

### 5. GitHub Actions Trigger

The deploy workflow runs when:

1. Code is pushed to `main` branch (automatic)
2. Zapier webhook triggers workflow (manual trigger from WordPress)
3. `workflow_dispatch` button in GitHub Actions UI (manual)

Each trigger:
- Runs `pnpm install` to install dependencies
- Runs `pnpm build` to generate static site
- Uploads `/dist` folder to GitHub Pages
- Site goes live in ~5-10 seconds

---

## Complete Implementation Guide

### 4.1 - WordPress API Layer (src/lib/wordpress.ts)

This file is the core of the WordPress integration. It handles all API communication, caching, retries, and fallback data.

**Key features:**
- `fetchWithTimeout()`: Fetch with timeout, retry logic, and detailed error categorization
- `getAstrobotCategoryId()`: Get category ID for `WORDPRESS_CATEGORY_SLUG`
- `getPosts()`: Main function with in-memory caching
- `processPost()`: Convert WordPress data to clean format
- `healthCheckWordPress()`: Pre-flight connectivity check
- Mock data fallback for development

**Complete file content:**

```typescript
import { sanitizeHtml } from './utils';

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

// WordPress API base URL - Use environment variable or fallback to production URL
const WP_API_URL = import.meta.env.WORDPRESS_API_URL || 'https://blog.nxtmt.ventures/wp-json/wp/v2';
const ASTROBOT_CATEGORY_SLUG = import.meta.env.WORDPRESS_CATEGORY_SLUG || 'astrobot-design';

// Simple cache to avoid redundant API calls during build
const postCache = new Map<string, ProcessedPost[]>();

// Fetch categories to get the ID of the category
export async function getCategories(): Promise<WordPressCategory[]> {
  try {
    console.log(`📡 Fetching categories from WordPress API at ${WP_API_URL}/categories`);
    const response = await fetchWithTimeout(`${WP_API_URL}/categories?per_page=100`, { timeout: 15000 });
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

// Get category ID for the WORDPRESS_CATEGORY_SLUG
export async function getAstrobotCategoryId(): Promise<number | null> {
  const categories = await getCategories();

  if (categories.length === 0) {
    console.warn('⚠️ No categories found from WordPress API. This may indicate a connectivity issue.');
    console.warn('🔧 Using hardcoded fallback: category ID is 6');
    return 6;
  }

  console.log(`🔍 Looking for category with slug "${ASTROBOT_CATEGORY_SLUG}" among ${categories.length} categories`);
  const targetCategory = categories.find(cat =>
    cat.slug === ASTROBOT_CATEGORY_SLUG ||
    cat.name.toLowerCase().includes(ASTROBOT_CATEGORY_SLUG.replace('-', ' '))
  );

  if (!targetCategory) {
    console.warn(
      `⚠️ Category not found: "${ASTROBOT_CATEGORY_SLUG}". Available categories:`,
      categories.map(c => `${c.slug} (${c.name})`).join(', ')
    );
    console.warn('🔧 Using hardcoded fallback: category ID is 6');
    return 6;
  }

  console.log(`✅ Found "${ASTROBOT_CATEGORY_SLUG}" category with ID: ${targetCategory.id}`);
  return targetCategory.id;
}

// Mock data for fallback when WordPress API is unavailable
const MOCK_POSTS: ProcessedPost[] = [
  {
    id: 1,
    slug: 'what-is-astro',
    title: 'What is Astro and Why It\'s Perfect for Your Business Website',
    content: '<p>Astro is a modern web framework for building fast, content-focused websites.</p>',
    excerpt: 'Discover why Astro is the perfect framework for building your business website.',
    date: '2023-12-15T00:00:00.000Z',
    modified: '2023-12-16T00:00:00.000Z',
    categories: [],
    tags: [],
  },
  {
    id: 2,
    slug: 'test',
    title: '75% Faster: How Static Site Generation Boosts Business Websites',
    content: '<p>Learn how static site generation can transform your online presence.</p>',
    excerpt: 'Discover how migrating to static site generation can make your website faster.',
    date: '2023-11-28T00:00:00.000Z',
    modified: '2023-11-30T00:00:00.000Z',
    categories: [],
    tags: [],
  },
];

// Detect if running in GitHub Actions environment
function isGitHubActions(): boolean {
  return process.env.GITHUB_ACTIONS === 'true';
}

// Get appropriate timeout based on environment
function getEnvironmentTimeout(baseTimeout: number = 15000): number {
  if (isGitHubActions()) {
    const envTimeout = baseTimeout * 1.5;
    console.log(`⏱️ GitHub Actions detected: using ${envTimeout}ms timeout`);
    return envTimeout;
  }
  return baseTimeout;
}

// Fetch with timeout, retry logic, and detailed diagnostics
async function fetchWithTimeout(
  url: string,
  options: RequestInit & { timeout?: number; retries?: number } = {}
): Promise<Response> {
  const { timeout = 15000, retries = 2, ...fetchOptions } = options;
  const adjustedTimeout = getEnvironmentTimeout(timeout);
  const userAgent = isGitHubActions()
    ? 'AstrobotCI/1.0 (GitHub Actions)'
    : 'AstrobotBuild/1.0';

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), adjustedTimeout);
      const startTime = Date.now();

      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
        headers: {
          ...fetchOptions.headers,
          'User-Agent': userAgent,
        }
      });

      const duration = Date.now() - startTime;
      clearTimeout(timeoutId);

      if (attempt > 1) {
        console.log(`  ✅ Retry ${attempt - 1} succeeded (${duration}ms)`);
      } else {
        console.log(`  ⏱️ Request completed in ${duration}ms`);
      }

      return response;
    } catch (error) {
      lastError = error as Error;
      const errorMsg = error instanceof Error ? error.message : String(error);

      let errorCategory = 'Unknown';
      if (errorMsg.includes('AbortError') || errorMsg.includes('timeout')) {
        errorCategory = 'Timeout';
      } else if (errorMsg.includes('ECONNREFUSED')) {
        errorCategory = 'Connection Refused';
      } else if (errorMsg.includes('ETIMEDOUT')) {
        errorCategory = 'Network Timeout';
      } else if (errorMsg.includes('ENOTFOUND') || errorMsg.includes('DNS')) {
        errorCategory = 'DNS Error';
      }

      if (attempt === retries + 1) {
        console.error(`  ❌ Final attempt failed (${errorCategory}): ${errorMsg}`);
        throw lastError;
      } else {
        const backoffMs = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        console.warn(`  ⚠️ Attempt ${attempt} failed (${errorCategory}): ${errorMsg}`);
        console.log(`  ⏳ Retrying in ${backoffMs}ms... (attempt ${attempt + 1}/${retries + 1})`);
        await new Promise(resolve => setTimeout(resolve, backoffMs));
      }
    }
  }

  throw lastError || new Error('Unknown fetch error');
}

// Health check to verify WordPress API is accessible
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

/**
 * Fetch posts from WordPress API with automatic fallback to mock data
 * Uses in-memory cache to avoid redundant API calls during build
 */
export async function getPosts(
  page: number = 1,
  perPage: number = 10,
  categoryId?: number
): Promise<ProcessedPost[]> {
  try {
    // If no categoryId provided, try to get the category ID
    if (!categoryId) {
      console.log(`🔍 getPosts: Fetching category ID for "${ASTROBOT_CATEGORY_SLUG}"...`);
      categoryId = await getAstrobotCategoryId();
      if (!categoryId) {
        throw new Error('Could not determine category ID from WordPress API');
      }
    }

    // Check cache first (avoid redundant API calls during build)
    const cacheKey = `posts_${categoryId}_${page}_${perPage}`;
    if (postCache.has(cacheKey)) {
      const cached = postCache.get(cacheKey)!;
      console.log(`📦 getPosts: Using cached posts (${cached.length} posts)`);
      return cached;
    }

    // Construct the API URL with parameters
    const cacheBuster = new Date().getTime();
    let url = `${WP_API_URL}/posts?_embed=true&page=${page}&per_page=${perPage}&_t=${cacheBuster}`;

    if (categoryId) {
      url += `&categories=${categoryId}`;
    }

    try {
      console.log(`📡 getPosts: Fetching from WordPress API with category ID ${categoryId}...`);
      console.log(`📍 getPosts: API URL: ${url}`);
      const response = await fetchWithTimeout(url, { timeout: 15000, retries: 2 });
      if (!response.ok) {
        throw new Error(`WordPress API returned status ${response.status}: ${response.statusText}`);
      }

      const posts: WordPressPost[] = await response.json();
      const processedPosts = posts.map(processPost);
      const postSlugs = processedPosts.map(p => p.slug);
      console.log(`✅ getPosts: Successfully fetched ${posts.length} posts from WordPress API`);
      console.log(`   📝 Post slugs: ${postSlugs.join(', ')}`);

      // Cache the result
      postCache.set(cacheKey, processedPosts);

      return processedPosts;
    } catch (fetchError) {
      const errorMessage = fetchError instanceof Error ? fetchError.message : String(fetchError);
      console.warn(`❌ Failed to fetch from WordPress API: ${errorMessage}`);
      console.warn(`⚠️ getPosts: Falling back to ${MOCK_POSTS.length} mock posts`);

      const start = (page - 1) * perPage;
      const end = start + perPage;
      return MOCK_POSTS.slice(start, end);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ Error in getPosts:', errorMessage);
    console.warn(`⚠️ getPosts: Falling back to ${MOCK_POSTS.length} mock posts`);
    const start = (page - 1) * perPage;
    const end = start + perPage;
    return MOCK_POSTS.slice(start, end);
  }
}

// Fetch a single post by slug
export async function getPostBySlug(slug: string): Promise<ProcessedPost | null> {
  try {
    const apiUrl = `${WP_API_URL}/posts?_embed=true&slug=${slug}`;

    try {
      const response = await fetchWithTimeout(apiUrl, { timeout: 15000, retries: 2 });

      if (!response.ok) {
        throw new Error(`WordPress API returned status ${response.status}: ${response.statusText}`);
      }

      const posts: WordPressPost[] = await response.json();
      if (posts.length === 0) {
        throw new Error(`Post with slug "${slug}" not found in WordPress API`);
      }

      return processPost(posts[0]);
    } catch (fetchError) {
      const mockPost = MOCK_POSTS.find(post => post.slug === slug);
      if (mockPost) {
        return mockPost;
      } else {
        console.error(`Post "${slug}" not found`);
        return null;
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error in getPostBySlug for "${slug}":`, errorMessage);

    const mockPost = MOCK_POSTS.find(post => post.slug === slug);
    return mockPost || null;
  }
}

// Process WordPress post into a more usable format
function processPost(post: WordPressPost): ProcessedPost {
  // Extract featured media
  const featuredMedia = post._embedded?.['wp:featuredmedia']?.[0];
  
  // Extract categories
  const categoriesArray = post._embedded?.['wp:term']?.[0] as WordPressCategory[] || [];
  
  // Extract tags
  const tagsArray = post._embedded?.['wp:term']?.[1] as WordPressTag[] || [];
  
  // Extract author
  const author = post._embedded?.['author']?.[0];

  // Create processed post - Filter out the primary category from display
  return {
    id: post.id,
    slug: post.slug,
    title: post.title.rendered,
    content: sanitizeHtml(post.content.rendered),
    excerpt: sanitizeHtml(post.excerpt.rendered),
    date: post.date,
    modified: post.modified,
    featuredMedia: featuredMedia
      ? {
          url: featuredMedia.source_url,
          alt: featuredMedia.alt_text || '',
        }
      : undefined,
    categories: categoriesArray
      .filter(cat => cat.slug !== ASTROBOT_CATEGORY_SLUG) // Hide the primary filter category
      .map(cat => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
      })),
    tags: tagsArray.map(tag => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
    })),
    author: author
      ? {
          id: author.id,
          name: author.name,
          avatar: author.avatar_urls['96'] || '',
        }
      : undefined,
  };
}
```

---

### 4.2 - Blog Post Pages (src/pages/blog/[slug].astro)

Generates static blog post pages at build time. Each post gets its own static HTML file.

**Important patterns:**
- `getStaticPaths()` fetches all posts once
- Posts are passed through props to avoid re-fetching
- Featured image is used for OG image tags
- Related posts are shown at bottom

**Complete file content:**

```astro
---
import BaseLayout from "@/layouts/BaseLayout.astro";
import BlogPost from "@/components/blog/BlogPost.astro";
import { getPosts, getPostBySlug } from "@/lib/wordpress";
import { generateExcerpt, cleanHtmlForDisplay } from "@/lib/utils";
import RelatedPosts from "@/components/blog/RelatedPosts.astro";

// This defines the dynamic paths that will be pre-rendered at build time
export async function getStaticPaths() {
  try {
    console.log("🔨 Astro: Starting blog page generation...");

    // Get all posts from WordPress API
    const allPosts = await getPosts(1, 100);

    console.log(`✅ Astro: Generated ${allPosts.length} blog post pages from WordPress API`);

    // Warn if we seem to be falling back to mock data
    if (allPosts.length <= 3) {
      console.warn(`⚠️ Astro: Only ${allPosts.length} posts found! This might indicate a WordPress API failure.`);
      console.warn('⚠️ Astro: The site may be using mock/fallback data instead of live WordPress content.');
      console.warn('⚠️ Astro: Check that WordPress API is accessible and the category exists.');
    }

    // Create a path for each post, passing all posts to avoid re-fetching in component
    return allPosts.map((post) => ({
      params: { slug: post.slug },
      props: { post, allPosts },
    }));
  } catch (error) {
    console.error("❌ Astro: Error generating static paths:", error);
    return [];
  }
}

// Get the post and all posts from props (already fetched in getStaticPaths)
const { post, allPosts } = Astro.props;

// For SEO
const metaDescription = generateExcerpt(post.excerpt, 160);

// Convert the featuredMedia URL to a URL object for OG image
let ogImage;
if (post.featuredMedia?.url) {
  ogImage = new URL(post.featuredMedia.url);
}
---

<BaseLayout
  title={`${cleanHtmlForDisplay(post.title)} | Blog`}
  description={metaDescription}
  ogImage={ogImage}
>
  <BlogPost post={post} allPosts={allPosts} />

  {allPosts.length > 0 && (
    <div class="container mx-auto px-4 pb-16">
      <div class="max-w-3xl mx-auto">
        <RelatedPosts currentPost={post} allPosts={allPosts} />
      </div>
    </div>
  )}
</BaseLayout>
```

---

### 4.3 - Blog Index Page (src/pages/blog/index.astro)

Lists all blog posts on a dedicated page. **Check if this file exists before creating.**

**Important:**
- Always fetch with `per_page=100`
- Slice locally to 12 posts
- Shows empty state if no posts found

**Complete file content:**

```astro
---
import BaseLayout from "@/layouts/BaseLayout.astro";
import BlogCard from "@/components/blog/BlogCard.astro";
import { getPosts } from "@/lib/wordpress";

// Fetch blog posts at build time (use per_page=100 to ensure consistent WordPress API results)
const allPosts = await getPosts(1, 100);
// Display first 12 posts on this page
const posts = allPosts.slice(0, 12);
---

<BaseLayout
  title="Blog | Your Site"
  description="Explore our latest insights, tips, and news about web development and technology."
>
  <section class="py-16 md:py-24">
    <div class="container">
      <div class="max-w-3xl mx-auto text-center mb-16">
        <h1 class="text-4xl md:text-5xl font-heading font-bold tracking-tight mb-6">
          Our Blog
        </h1>
        <p class="text-xl text-muted-foreground">
          Insights and tips for building faster, better websites
        </p>
      </div>
      
      {posts.length === 0 ? (
        <div class="text-center py-12 border border-primary/10 rounded-lg bg-secondary/20">
          <p class="text-lg text-muted-foreground">No blog posts found.</p>
        </div>
      ) : (
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map(post => (
            <BlogCard post={post} />
          ))}
        </div>
      )}
    </div>
  </section>
</BaseLayout>
```

---

### 4.4 - Homepage Blog Preview/Carousel (src/components/home/BlogPreview.astro)

Displays carousel of recent posts on homepage. **Check if this file exists before creating.**

**Important:**
- Same `per_page=100` pattern
- Slice locally to 6 posts
- Only renders if posts exist

**Complete file content:**

```astro
---
import { getPosts } from "@/lib/wordpress";
import BlogCarousel from "./BlogCarousel";

// Fetch blog posts at build time (use per_page=100 to ensure consistent WordPress API results)
const allPosts = await getPosts(1, 100);
// Display first 6 posts in carousel
const posts = allPosts.slice(0, 6);
---

{posts.length > 0 && (
  <BlogCarousel posts={posts} client:load />
)}
```

---

### 4.5 - GitHub Actions Workflow (.github/workflows/deploy.yml)

Automates build and deployment to GitHub Pages. **Change `WORDPRESS_CATEGORY_SLUG` environment variable per site.**

**Key points:**
- Triggers on push to `main` branch
- Sets environment variables for WordPress API
- Builds static site and deploys to GitHub Pages
- Customize only the `env` section for new sites

**Complete file content:**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout your repository using git
        uses: actions/checkout@v5

      - name: Install, build, and upload your site
        uses: withastro/action@v5

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

---

### 4.6 - Configuration Files

#### astro.config.ts

```typescript
// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  // Custom domain (change to your site's domain)
  site: "https://astrobot.design",

  // Required for GitHub Pages
  output: "static",

  integrations: [react()],

  vite: {
    plugins: [tailwindcss()],
  },

  // Image optimization settings
  image: {
    // Allow remote images from WordPress API
    remotePatterns: [{ protocol: "http" }, { protocol: "https" }],
  },
});
```

**Changes for new sites:**
- Update `site` to your domain (e.g., `https://thefordamily.life`)
- Add `WORDPRESS_CATEGORY_SLUG` to `vite.define` in `astro.config.ts`:
  ```typescript
  define: {
    "import.meta.env.WORDPRESS_CATEGORY_SLUG": JSON.stringify(process.env.WORDPRESS_CATEGORY_SLUG || "thefordfamily.life"),
  },
  ```

#### package.json (relevant sections)

```json
{
  "name": "@area44/astro-shadcn-ui-template",
  "version": "25.01.27",
  "packageManager": "pnpm@10.29.2",
  "scripts": {
    "build": "astro build",
    "dev": "astro dev",
    "preview": "astro preview",
    "start": "astro dev"
  },
  "dependencies": {
    "astro": "^5.5.4",
    "@astrojs/react": "^4.2.1",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  }
}
```

#### .env.example

```
# WordPress API Configuration
# The base URL of your WordPress REST API endpoint
# Default: https://blog.nxtmt.ventures/wp-json/wp/v2
WORDPRESS_API_URL=https://blog.nxtmt.ventures/wp-json/wp/v2

# WordPress Category Slug
# Only posts from this category will be displayed on the blog
# Change this for each site - examples: thefordamily, mycategory, etc.
WORDPRESS_CATEGORY_SLUG=astrobot-design
```

---

## Setup Checklist for New Sites

Use this checklist when setting up a new Astro site with WordPress integration:

- [ ] Clone/create Astro project
- [ ] Install dependencies: `pnpm install`
- [ ] Copy `src/lib/wordpress.ts` from reference site (Astrobot)
- [ ] Create blog pages structure:
  - [ ] Check if `src/pages/blog/[slug].astro` exists; create if not
  - [ ] Check if `src/pages/blog/index.astro` exists; create if not
- [ ] Check if homepage blog carousel exists:
  - [ ] If `src/components/home/BlogPreview.astro` exists, verify it's configured
  - [ ] If not, create it
- [ ] Update `astro.config.ts`:
  - [ ] Change `site:` to your domain (e.g., `https://thefordfamily.life`)
  - [ ] Add `WORDPRESS_CATEGORY_SLUG` to `vite.define` section (see section 4.6)
- [ ] Create `.github/workflows/deploy.yml`:
  - [ ] Copy from reference (section 4.5)
- [ ] Create `.env` file (committed to repo):
  - [ ] Copy from `.env.example` as template
  - [ ] Update values for your site:
    - `SITE_URL`: Your site domain
    - `WORDPRESS_CATEGORY_SLUG`: Your WordPress category slug
    - `ZAPIER_WEBHOOK_URL`: Your Zapier webhook (if using forms)
  - [ ] Commit this file to the repository
- [ ] Create `.env.example`:
  - [ ] Copy from reference (section 4.6)
  - [ ] Keep as template with placeholder values
- [ ] Test locally:
  - [ ] Run: `pnpm install`
  - [ ] Run: `pnpm build`
  - [ ] Verify blog posts appear in build output
  - [ ] Check console for `✅ getPosts: Successfully fetched X posts from WordPress API`
- [ ] Configure GitHub repository:
  - [ ] Push code to GitHub
  - [ ] Go to repository Settings → Pages
  - [ ] Set source to "Deploy from a branch"
  - [ ] Set branch to "gh-pages"
  - [ ] Set folder to "/ (root)"
- [ ] Configure GitHub Actions:
  - [ ] Go to Actions tab
  - [ ] Ensure "Deploy to GitHub Pages" workflow is enabled
  - [ ] Click "Run workflow" to trigger initial build
  - [ ] Monitor the build in Actions tab
- [ ] Configure custom domain (optional):
  - [ ] In GitHub repository Settings → Pages → Custom domain
  - [ ] Enter your domain (e.g., `thefordamily.life`)
  - [ ] Update DNS to point to GitHub Pages
- [ ] Verify live site:
  - [ ] Visit your site (or wait for DNS to propagate)
  - [ ] Verify blog posts display correctly
  - [ ] Check blog index page `/blog/`
  - [ ] Click into a blog post to verify detail page
  - [ ] Verify homepage carousel (if applicable) shows posts
- [ ] Configure Zapier webhook (optional):
  - [ ] In WordPress: Install Zapier plugin
  - [ ] Create trigger: "New or Updated Post"
  - [ ] Create action: "POST to Webhook"
  - [ ] Webhook URL: `https://api.github.com/repos/[YOUR-GITHUB-USERNAME]/[REPO-NAME]/dispatches`
  - [ ] This will auto-rebuild site when posts are published

---

## Configuration Variables Explained

### WORDPRESS_API_URL

**Default:** `https://blog.nxtmt.ventures/wp-json/wp/v2`

This is the base URL of the WordPress REST API. All API requests are made to this endpoint:
- Category list: `{WORDPRESS_API_URL}/categories`
- Posts: `{WORDPRESS_API_URL}/posts`

For a different WordPress instance, change this URL.

### WORDPRESS_CATEGORY_SLUG

**Default:** `astrobot-design`

This is the category slug to filter posts by. Each site has its own category:

- **Astrobot:** `astrobot-design`
- **TheFordFamily:** `thefordamily`
- **YourSite:** `your-category-slug`

**How to find your category slug:**

1. Go to WordPress admin: `blog.nxtmt.ventures/wp-admin/`
2. Click Posts → Categories
3. Find your category in the list
4. The slug is in the URL or shown in the category list
5. Copy the slug exactly (lowercase, hyphens instead of spaces)

**To verify the category exists in the API:**

```bash
# Replace [SLUG] with your actual category slug
curl "https://blog.nxtmt.ventures/wp-json/wp/v2/categories?search=astrobot-design"
```

The response should include your category with the ID.

---

## Troubleshooting Guide

### Build fails with "WordPress API unreachable"

**Error message:**
```
❌ Failed to fetch from WordPress API: ECONNREFUSED
⚠️ getPosts: Falling back to mock posts
```

**Causes:**
- WordPress server is down
- Network connectivity issue
- DNS resolution failure
- WordPress REST API is disabled

**Solutions:**

1. **Check WordPress is running:**
   ```bash
   curl "https://blog.nxtmt.ventures/wp-json/wp/v2/posts?per_page=1"
   ```
   Should return JSON. If error, WordPress is down.

2. **Check REST API is enabled:**
   - Go to WordPress admin
   - Install "REST API Enabler" plugin if needed
   - Visit `https://blog.nxtmt.ventures/wp-json/` in browser
   - Should show JSON response

3. **Check network connectivity:**
   - In GitHub Actions, sometimes firewall blocks outbound requests
   - Contact infrastructure team to whitelist API domain

4. **Check timeout settings:**
   - Default timeout is 15 seconds
   - GitHub Actions uses 22.5 seconds
   - If WordPress is slow, increase timeout in `src/lib/wordpress.ts`:
   ```typescript
   const response = await fetchWithTimeout(url, { timeout: 30000 }); // 30 seconds
   ```

---

### Blog posts not appearing

**Symptoms:**
- Blog pages generate but show "No blog posts found"
- Homepage carousel doesn't appear
- Empty blog index

**Causes:**
- Category slug is incorrect
- No posts in the category
- Posts not published
- API filter not working

**Solutions:**

1. **Verify category slug:**
   ```bash
   # Replace [SLUG] with your category slug
   curl "https://blog.nxtmt.ventures/wp-json/wp/v2/categories?search=[SLUG]"
   ```
   Note the `id` from response.

2. **Verify posts exist in category:**
   ```bash
   # Replace [ID] with the category ID from above
   curl "https://blog.nxtmt.ventures/wp-json/wp/v2/posts?categories=[ID]&per_page=100"
   ```
   Should return posts JSON.

3. **Check posts are published:**
   - Go to WordPress admin
   - Click Posts → All Posts
   - Verify posts are "Published" status (not Draft)

4. **Check category in WordPress admin:**
   - WordPress → Posts → Categories
   - Ensure your category exists
   - Ensure posts are assigned to your category (not just other categories)

5. **Look at build logs:**
   - In GitHub Actions, go to the failed build
   - Look for:
   ```
   🔍 getPosts: Fetching category ID for "your-category-slug"...
   ✅ Found "your-category-slug" category with ID: 123
   📡 getPosts: Fetching from WordPress API...
   ```
   - If you see the fallback message, category wasn't found

---

### Wrong posts showing on live site (category mismatch)

**Symptoms:**
- Seeing posts from other categories on live site
- Blog shows posts you didn't expect
- Local site shows correct posts, but live site shows wrong posts

**Causes:**
- `.env` file has wrong category slug
- Category slug is incorrect in WordPress

**Solutions:**

1. **Verify `.env` file has correct category:**
   - Open `.env` file in repository
   - Check `WORDPRESS_CATEGORY_SLUG` value
   - Example correct values: `thefordfamily.life`, `thefordamily`, `my-category`

2. **Verify correct category slug in WordPress:**
   - Visit WordPress: `blog.nxtmt.ventures/wp-admin/Posts/Categories`
   - Find your category and confirm the slug
   - Double-check spelling and hyphens

3. **Check posts exist in category:**
   ```bash
   # Replace [SLUG] with your category slug
   curl "https://blog.nxtmt.ventures/wp-json/wp/v2/categories?search=[SLUG]"
   # Note the ID from response, then:
   curl "https://blog.nxtmt.ventures/wp-json/wp/v2/posts?categories=[ID]&per_page=100"
   ```

4. **Check GitHub Actions logs:**
   - Go to GitHub → Actions tab
   - Click the failed or latest "Deploy to GitHub Pages" workflow
   - Look at the logs
   - Verify the log shows:
   ```
   🔍 getPosts: Fetching category ID for "[YOUR-SLUG]"...
   ✅ Found "[YOUR-SLUG]" category with ID: [NUMBER]
   ✅ getPosts: Successfully fetched X posts from WordPress API
   ```

5. **Test locally with correct slug:**
   ```bash
   rm -rf dist
   pnpm build
   ```
   The build will use the category slug from `.env` file

6. **Update `.env` and re-deploy:**
   - Correct `WORDPRESS_CATEGORY_SLUG` value in `.env`
   - Commit the change
   - Push to main branch
   - GitHub Actions will rebuild with the new category slug

---

### GitHub Actions build timeout

**Error:**
```
Build step exceeded timeout
Process exceeded 540 seconds
```

**Causes:**
- WordPress API is slow
- Network issues during CI/CD
- Dependencies taking too long to install

**Solutions:**

1. **Check WordPress API response time:**
   ```bash
   time curl "https://blog.nxtmt.ventures/wp-json/wp/v2/posts?per_page=100" > /dev/null
   ```

2. **Increase timeout in workflow:**
   In `.github/workflows/deploy.yml`, add timeout:
   ```yaml
   - name: Build Astro site
     run: pnpm build
     timeout-minutes: 10
   ```

3. **Check GitHub Actions logs:**
   - Go to Actions → Recent build
   - Click "Run workflow" to see detailed logs
   - Look for slow steps

4. **Clear cache and retry:**
   - Sometimes pnpm cache is corrupted
   - Go to Actions → Caches
   - Delete the pnpm cache
   - Re-run workflow

---

### "Using mock data" appearing in logs

**Message:**
```
⚠️ getPosts: Falling back to mock posts
```

**Meaning:**
- WordPress API failed
- Site is using fallback test data instead of real posts
- Real posts will not appear on live site

**Solutions:**
- See "WordPress API unreachable" troubleshooting above
- Check all environment variables are set correctly
- Verify WordPress server is running and accessible

---

### Featured images not loading

**Symptoms:**
- Blog posts missing featured images
- Placeholder image shows instead
- Image URL is broken

**Causes:**
- Featured media not set in WordPress
- Image URL is inaccessible
- Astro image optimization issue

**Solutions:**

1. **Check featured image in WordPress:**
   - Go to WordPress → Posts
   - Edit the post
   - Ensure featured image is set in "Featured Image" section

2. **Verify image URL is accessible:**
   ```bash
   curl -I "[IMAGE-URL]"
   ```
   Should return 200 status.

3. **Check Astro remote patterns:**
   In `astro.config.ts`, ensure this is set:
   ```typescript
   image: {
     remotePatterns: [
       { protocol: "http" },
       { protocol: "https" }
     ],
   },
   ```

4. **Check blog post component:**
   Verify `BlogPost.astro` renders the featured image:
   ```astro
   {post.featuredMedia && (
     <img src={post.featuredMedia.url} alt={post.featuredMedia.alt} />
   )}
   ```

---

### Unexpected number of posts fetching

**Symptoms:**
- Expecting 10 posts, got 4
- Expecting 50 posts, got different numbers
- Count varies between builds

**Cause:**
- Using different `per_page` values
- WordPress API inconsistency
- Category has fewer posts than expected

**Solution:**

**Always use `per_page=100`**, then slice locally:

```typescript
// ✅ CORRECT
const allPosts = await getPosts(1, 100);
const posts = allPosts.slice(0, 12);

// ❌ INCORRECT - May return wrong number of posts
const posts = await getPosts(1, 12);
```

The `per_page=100` value is magic—it's the only value that returns consistent results from this WordPress instance. Never change it.

---

## Performance Characteristics

### Build Time Expectations

- **Full build from scratch:** ~2-3 minutes
  - Node setup: ~10 seconds
  - pnpm install: ~30 seconds
  - WordPress API fetch: ~2-5 seconds
  - Astro build: ~30-60 seconds (depends on number of posts)
  - Total: ~2-3 minutes

- **Incremental build (code change):** ~1-2 minutes
  - pnpm install (cached): ~5 seconds
  - WordPress API fetch: ~2-5 seconds
  - Astro build: ~30-60 seconds

### HTML Generation Time

- Per blog post page: ~10-50ms
- Blog index page: ~50-100ms
- Homepage: ~100-200ms
- Total for 50 posts: ~2-5 seconds

### API Calls Per Build

- **Actual API calls:** 1-2 (WordPress)
- **Cached calls:** 3-5 (in-memory)
- **Total:** 4-7 calls, but only 1-2 hit the network

### Why Caching Matters

Without caching:
- 6 components × 1 API call each = 6 requests to WordPress
- Build time: 10-30 seconds (waiting for network)
- Higher failure rate (more chances to timeout)

With caching:
- First component: hits API (2-5 seconds)
- Remaining 5 components: use cache (instant)
- Build time: faster, more reliable

---

## For Builder.io Prompt Reference

### Template Prompt to Use

When setting up a new site in Builder.io, use this prompt format:

```
I have an Astro blog site that needs WordPress integration. Follow these instructions exactly:

1. Read the WORDPRESS_SETUP.md file in the root of the repository
2. Implement sections 4.1 through 4.6 from that file
3. When implementing:
   - Copy the complete file content from WORDPRESS_SETUP.md
   - Don't ask questions - just implement
   - File paths: src/lib/wordpress.ts, src/pages/blog/[slug].astro, etc.
   - Update astro.config.ts with site: "[YOUR_SITE_URL]"

4. Setup variables needed:
   - WORDPRESS_CATEGORY_SLUG: [INSERT_CATEGORY_SLUG_HERE]
   - Your site URL for astro.config.ts: [INSERT_SITE_URL_HERE]

5. After implementation:
   - Create .env file (copy from .env.example) with site-specific values:
     - SITE_URL: your domain
     - WORDPRESS_CATEGORY_SLUG: your category slug
     - ZAPIER_WEBHOOK_URL: if using forms
   - Commit .env file to the repository
   - Run `pnpm build` to test locally
   - Verify build completes and shows "✅ getPosts: Successfully fetched X posts"
   - Check that blog posts appear in the generated site

Reference site for comparison: Next-Mountain-Ventures-LLC/TheFordFamilyBlog
```

### Variable Substitution Guide

When using this prompt for a specific site, substitute:

```
[YOUR_CATEGORY_SLUG] → the category slug from WordPress
  Examples:
  - astrobot-design
  - thefordamily
  - my-category-name

[YOUR_SITE_URL] → the site's actual domain
  Examples:
  - https://astrobot.design
  - https://thefordamily.life
  - https://yoursite.com
```

### How to Find Category Slug

1. Go to WordPress: `blog.nxtmt.ventures/wp-admin/`
2. Posts → Categories
3. Find your category
4. Note the slug (shown in list or in URL after editing)
5. Use exact slug in `.env` file: `WORDPRESS_CATEGORY_SLUG=your-slug`

### Verification Steps After Implementation

After Builder.io implements the WordPress integration:

1. **Create `.env` file (CRITICAL):**
   - Copy `.env.example` to `.env`
   - Update with your site-specific values:
     - `SITE_URL`: your domain
     - `WORDPRESS_CATEGORY_SLUG`: your WordPress category slug
     - `ZAPIER_WEBHOOK_URL`: your webhook (if using forms)
   - Commit the `.env` file to the repository

2. **Local build test:**
   ```bash
   pnpm build
   ```
   Should show: `✅ getPosts: Successfully fetched X posts from WordPress API`

3. **Blog posts appear:**
   - Check `/dist/blog/` folder for generated post pages
   - Should see folders like `/dist/blog/post-slug-1/`, `/dist/blog/post-slug-2/`, etc.

4. **GitHub Pages deployment:**
   - Push code to GitHub
   - Go to Actions tab
   - Watch "Deploy to GitHub Pages" workflow
   - Should complete in 2-3 minutes
   - Site should go live with blog posts

5. **Site live check:**
   - Visit `/blog/` → should show blog posts
   - Visit `/blog/[post-slug]/` → should show individual post
   - Homepage → carousel should show recent posts (if implemented)
   - Verify posts match the category you specified in `.env` file

---

## Maintenance & Updates

### Rolling Out Updates to All Sites

When the WordPress integration improves or changes:

1. **Update reference site (Astrobot):**
   - Make changes to `src/lib/wordpress.ts` or other files
   - Test thoroughly
   - Commit to main branch
   - Document what changed

2. **Copy updates to other sites:**
   ```bash
   # For each site:
   cp src/lib/wordpress.ts /path/to/[SITE]/src/lib/wordpress.ts
   # Commit and push
   ```

3. **Update WORDPRESS_SETUP.md:**
   - Update code snippets in sections 4.1-4.6
   - Update version date at top
   - Document breaking changes if any
   - Commit to Astrobot repository

4. **Notify team:**
   - Share update summary
   - Document any manual steps needed per site

### When to Update

- Performance improvements discovered
- WordPress API changes
- New features added (email signup, comments, etc.)
- Bug fixes
- Security improvements

### Testing Strategy

Before rolling out updates:

1. **Test in branch:**
   - Create feature branch
   - Implement changes
   - Test locally with `pnpm build`
   - Verify blog posts still fetch and display

2. **Test on Astrobot first:**
   - Merge to main
   - Watch GitHub Actions build
   - Verify live site works
   - Check real posts display

3. **Test on 1-2 other sites:**
   - Apply same changes to another site
   - Verify build succeeds
   - Verify posts display correctly
   - Document any issues

4. **Roll out to remaining sites:**
   - Apply changes to all remaining sites
   - Stagger deployments if possible
   - Monitor for issues

---

## Common Customizations

### Changing the Number of Posts Displayed

**Blog index page (show 20 instead of 12):**
In `src/pages/blog/index.astro`:
```astro
const posts = allPosts.slice(0, 20);  // Change from 12 to 20
```

**Homepage carousel (show 8 instead of 6):**
In `src/components/home/BlogPreview.astro`:
```astro
const posts = allPosts.slice(0, 8);  // Change from 6 to 8
```

### Modifying Post Card Styling

Edit `src/components/blog/BlogCard.astro`:
- Change image size
- Update text styling
- Modify layout (grid vs. flex)
- Add/remove metadata display

### Adding Additional WordPress Post Metadata

In `src/lib/wordpress.ts`, the `ProcessedPost` interface can be extended:

```typescript
export interface ProcessedPost {
  id: number;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  date: string;
  modified: string;
  // Add new fields here:
  readingTime?: number;
  commentCount?: number;
  // ... etc
}
```

Then update `processPost()` to populate new fields.

### Custom Category Filtering Logic

If you need complex filtering (multiple categories, exclude certain categories, etc.), modify `getPosts()` in `src/lib/wordpress.ts`:

```typescript
// Example: Filter out a specific category
const processedPosts = posts
  .map(processPost)
  .filter(post => post.categories.every(cat => cat.slug !== 'excluded-category'));
```

---

## Reference Implementation

### Where to Find the Reference Site

- **Repository:** `Next-Mountain-Ventures-LLC/Astrobot`
- **Stable commit:** `928d956`
- **Live site:** `https://astrobot.design`

### How to Compare Your Implementation

When setting up a new site, you can compare your files against the reference:

1. **File-by-file comparison:**
   - `src/lib/wordpress.ts` - Should be identical except for constants
   - `astro.config.ts` - Should be identical except `site:` URL
   - `package.json` - Should be identical (same pnpm version)

2. **Build output comparison:**
   ```bash
   # Reference site
   git clone [ASTROBOT-REPO]
   cd Astrobot
   pnpm build
   
   # Your site
   cd ../your-site
   pnpm build
   
   # Compare outputs
   diff ../Astrobot/dist ./dist
   ```

3. **API response comparison:**
   ```bash
   # Both should fetch from same WordPress instance
   curl "https://blog.nxtmt.ventures/wp-json/wp/v2/posts?categories=6&per_page=100"
   ```

### When to Use as Reference vs. When to Customize

**Use reference implementation for:**
- `src/lib/wordpress.ts` (should be identical across all sites)
- Retry logic and timeout handling
- Caching strategy
- API integration patterns

**Customize for each site:**
- `astro.config.ts` → change `site:` URL
- `.github/workflows/deploy.yml` → change `WORDPRESS_CATEGORY_SLUG`
- `.env.example` → change `WORDPRESS_CATEGORY_SLUG`
- Component styling and layout
- Blog post templates
- Homepage customizations

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Feb 2026 | Initial comprehensive guide with 12 sections |

---

## Quick Links

- [Setup Checklist](#setup-checklist-for-new-sites) - New site setup
- [Troubleshooting](#troubleshooting-guide) - Fix common issues
- [Builder.io Prompt](#for-builderio-prompt-reference) - Use this prompt format
- [Configuration](#configuration-variables-explained) - Environment variables
- [Architecture](#architecture-overview) - How the system works

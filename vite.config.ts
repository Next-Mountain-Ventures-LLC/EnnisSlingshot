import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import fs from "node:fs";
import path from "path";
import { createServer } from "./server";
import { isPublicAuthorUrl } from "./shared/author";
// Type-only import: augments vite's UserConfig with `ssgOptions`.
import type { ViteReactSSGOptions } from "vite-react-ssg";

/**
 * SSG notes (vite-react-ssg):
 * - `pnpm dev` runs plain `vite` — CSR + the Express middleware below
 *   (`expressPlugin` is `apply: "serve"` so it never touches the build).
 * - `pnpm run build:client` runs `vite-react-ssg build`, which reads this same
 *   config, does the client build into dist/spa, an SSR build into a temp dir,
 *   then prerenders every route from `includedRoutes` (exported by
 *   client/App.tsx, sourced from client/lib/routes.ts). Nothing here needed to
 *   be isolated from the Express plugin.
 * - `dirStyle: "nested"` writes `/blog/` → dist/spa/blog/index.html so Netlify
 *   serves trailing-slash URLs as plain files (no SPA fallback needed).
 */
const ssgOptions: ViteReactSSGOptions = {
  dirStyle: "nested",
  script: "defer",
  // Critical-CSS inlining is opt-in (needs `beasties`); left off for parity.
  beastiesOptions: false,
  concurrency: 8,
  /**
   * vite-react-ssg splices the Helmet output (title, meta, JSON-LD) directly
   * after `<head>`, which pushes `<meta charset>` past the first 1024 bytes.
   * Hoist charset + viewport back to the top of <head> for every route.
   */
  onPageRendered(_route, html) {
    const charset = /<meta charset="[^"]*">/i.exec(html)?.[0] ?? "";
    const viewport = /<meta name="viewport"[^>]*>/i.exec(html)?.[0] ?? "";
    if (!charset && !viewport) return html;
    let out = html;
    if (charset) out = out.replace(charset, "");
    if (viewport) out = out.replace(viewport, "");
    return out.replace(/<head>/i, `<head>${charset}${viewport}`);
  },
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    fs: {
      // public/blog-images/manifest.json is glob-imported by client/lib/blogImages.ts
      // + node_modules: pnpm's real paths (e.g. leaflet/dist/leaflet.css) live under node_modules/.pnpm
      allow: ["./client", "./shared", "./public/blog-images", "./node_modules"],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
    },
  },
  build: {
    outDir: "dist/spa",
  },
  define: {
    // Footer copyright year (client/components/landing/Contact.tsx) — fixed at build time so SSG HTML and hydration agree.
    __BUILD_YEAR__: JSON.stringify(new Date().getFullYear()),
  },
  ssgOptions,
  plugins: [stripPrivateBlogFrontmatter(), react(), expressPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));

/**
 * Frontmatter keys the WordPress sync writes into client/content/blog/*.md that
 * must never reach the public JS bundle (client/lib/blog.ts glob-imports the
 * raw files with `?raw`). Nothing on the site reads them: resolveAuthor() only
 * uses a *public* authorUrl, and postId (hero-image lookup) is kept.
 * scripts/lib/posts.ts reads the files from disk and is unaffected.
 */
const PRIVATE_BLOG_FRONTMATTER_KEYS = new Set(["authorEmail", "authorId", "permalink", "guid"]);

function unquoteYamlScalar(value: string): string {
  const v = value.trim();
  return /^(["']).*\1$/.test(v) ? v.slice(1, -1) : v;
}

/** Remove private keys (and any indented continuation lines) from a markdown file's YAML frontmatter. */
export function stripPrivateFrontmatter(raw: string): string {
  const match = /^(---\r?\n)([\s\S]*?)(\r?\n---(?:\r?\n|$)[\s\S]*)$/.exec(raw);
  if (!match) return raw;
  const [, open, yamlBlock, rest] = match;
  const out: string[] = [];
  let skipping = false;
  for (const line of yamlBlock.split(/\r?\n/)) {
    if (skipping && /^(\s+\S|-\s)/.test(line)) continue;
    skipping = false;
    const key = /^([A-Za-z0-9_]+):(.*)$/.exec(line);
    if (key) {
      const [, name, value] = key;
      const isPrivate =
        PRIVATE_BLOG_FRONTMATTER_KEYS.has(name) || (name === "authorUrl" && !isPublicAuthorUrl(unquoteYamlScalar(value)));
      if (isPrivate) {
        skipping = true;
        continue;
      }
    }
    out.push(line);
  }
  return `${open}${out.join("\n")}${rest}`;
}

/**
 * Serve `client/content/blog/*.md?raw` with the private frontmatter keys
 * removed. Runs before Vite's own `?raw` loader (enforce: "pre"), in dev, in
 * the SSG client/server builds and in vitest.
 */
function stripPrivateBlogFrontmatter(): Plugin {
  return {
    name: "strip-private-blog-frontmatter",
    enforce: "pre",
    async load(id) {
      const [file, query = ""] = id.split("?", 2);
      if (!/(^|&)raw(&|$)/.test(query)) return null;
      if (!/[\\/]client[\\/]content[\\/]blog[\\/][^\\/]+\.md$/.test(file)) return null;
      this.addWatchFile(file);
      const raw = await fs.promises.readFile(file, "utf-8");
      return `export default ${JSON.stringify(stripPrivateFrontmatter(raw))}`;
    },
  };
}

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve", // Only apply during development (serve mode)
    configureServer(server) {
      const app = createServer();

      // Add Express app as middleware to Vite dev server
      server.middlewares.use(app);
    },
  };
}

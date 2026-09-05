import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { createServer } from "./server";
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
      allow: ["./client", "./shared"],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
    },
  },
  build: {
    outDir: "dist/spa",
  },
  ssgOptions,
  plugins: [react(), expressPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));

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

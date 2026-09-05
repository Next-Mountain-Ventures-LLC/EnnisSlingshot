/**
 * App bootstrap — vite-react-ssg.
 *
 * `ViteReactSSG` replaces `createRoot(...).render(<BrowserRouter>…)`. It
 * builds a React Router data router from `routes`, wraps it in
 * `<HelmetProvider>` (react-helmet-async) on both the client and the SSG
 * renderer, hydrates in the browser when the HTML was prerendered, and at
 * build time (`vite-react-ssg build`, see package.json `build:client`) renders
 * every path returned by `includedRoutes` to static HTML in dist/spa.
 *
 * `pnpm dev` still runs plain `vite` (CSR + the Express middleware from
 * vite.config.ts); the same bootstrap simply client-renders.
 */
import "./global.css";

import { ViteReactSSG, type RouteRecord } from "vite-react-ssg";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SiteLayout } from "@/components/layout/SiteLayout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { ContentPage } from "./pages/site/ContentPage";
import { HubPage } from "./pages/site/HubPage";
import { BlogIndexTemplate } from "./components/blog/BlogIndexTemplate";
import { BlogTemplate } from "./components/blog/BlogTemplate";
import { BlogCategoryTemplate } from "./components/blog/BlogCategoryTemplate";
import { getAllPages } from "./lib/pages";
import { includedRoutes as manifestIncludedRoutes } from "./lib/routes";

const queryClient = new QueryClient();

function Root() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <SiteLayout />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

/**
 * Every markdown file under client/content/pages/** becomes a route
 * automatically: `<hub>/index.md` → HubPage, everything else → ContentPage.
 * (React Router ignores trailing slashes when matching, so "/x/" and "/x"
 * both resolve; the manifest + Netlify Pretty URLs canonicalize to "/x/".)
 */
const contentRoutes: RouteRecord[] = getAllPages()
  .filter((p) => p.path !== "/" && !p.path.startsWith("/blog-categories/"))
  .map((p) => ({
    path: p.path.replace(/^\//, "").replace(/\/$/, ""),
    element: p.isHub ? <HubPage /> : <ContentPage />,
  }));

export const routes: RouteRecord[] = [
  {
    path: "/",
    element: <Root />,
    children: [
      { index: true, element: <Index /> },
      { path: "blog", element: <BlogIndexTemplate /> },
      { path: "blog/category/:slug", element: <BlogCategoryTemplate /> },
      { path: "blog/:slug", element: <BlogTemplate /> },
      ...contentRoutes,
      { path: "404", element: <NotFound /> },
      /* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */
      { path: "*", element: <NotFound /> },
    ],
  },
];

/** Consumed by vite-react-ssg at build time (server entry export wins over vite.config `ssgOptions.includedRoutes`). */
export const includedRoutes = manifestIncludedRoutes;

export const createRoot = ViteReactSSG({ routes, basename: import.meta.env.BASE_URL });

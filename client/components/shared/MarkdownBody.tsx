/**
 * Markdown renderer shared by blog posts and site pages (react-markdown +
 * remark-gfm).
 *
 * Links:
 * - Site-relative links and absolute links to ennisslingshot.com (WordPress
 *   writes internal links as https://ennisslingshot.com/...) become <Link>
 *   (client-side navigation, same tab, referrer kept).
 * - An internal link whose path is not a prerendered route (e.g. a post that
 *   is briefed or scheduled but not published yet) renders as plain text, with
 *   a build-time warning, instead of shipping a 404. It relinks automatically
 *   on the first build after the target goes live.
 * - External links open in a new tab with rel="noopener noreferrer".
 *
 * Also: GFM tables get a horizontal-scroll wrapper and real table styling;
 * h2/h3 get stable id slugs (so /terms/#sms-terms works); blockquotes render as
 * callouts. react-markdown's `node` prop is never forwarded to the DOM.
 *
 * HTML comments (`<!-- IMAGE: … -->` production notes the writers leave in
 * synced post bodies) are stripped before rendering: react-markdown v9 has raw
 * HTML disabled and would otherwise print them as escaped literal text.
 */
import type { ComponentPropsWithoutRef } from "react";
import ReactMarkdown, { type Components, type ExtraProps, type Options } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { getPrerenderPaths } from "@/lib/routes";

type MdProps<T extends keyof JSX.IntrinsicElements> = ComponentPropsWithoutRef<T> & ExtraProps;

/* ------------------------------------------------------------------ links */

const SELF_ORIGIN = /^https?:\/\/(?:www\.)?ennisslingshot\.com(?=[/?#]|$)/i;

/** Absolute URLs on this site → site-relative path ("/x/?q#h"); anything else is returned unchanged. */
export function toSitePath(href: string): string {
  if (!SELF_ORIGIN.test(href)) return href;
  const rest = href.replace(SELF_ORIGIN, "");
  return rest.startsWith("/") ? rest : `/${rest}`;
}

let knownPaths: Set<string> | null = null;

/**
 * Is this site path a page that exists in the build? Paths with a file
 * extension (/rss.xml, PDFs, images) are static files, not routes, and are
 * always allowed. Trailing slash is optional ("/faq" and "/faq/" both match).
 */
export function isKnownSitePath(pathname: string): boolean {
  if (/\.[a-z0-9]+$/i.test(pathname)) return true;
  knownPaths ??= new Set(getPrerenderPaths());
  if (knownPaths.has(pathname)) return true;
  return knownPaths.has(pathname.endsWith("/") ? pathname.replace(/\/+$/, "") || "/" : `${pathname}/`);
}

function MarkdownLink({ node: _node, href, children, ...rest }: MdProps<"a">) {
  if (!href) return <a {...rest}>{children}</a>;
  const local = toSitePath(href);
  if (local.startsWith("/") && !local.startsWith("//")) {
    const pathname = local.split(/[?#]/)[0] || "/";
    if (!isKnownSitePath(pathname)) {
      if (import.meta.env.SSR) {
        console.warn(`[markdown] Rendering link to ${href} as plain text — no published page at ${pathname} yet.`);
      }
      return <>{children}</>;
    }
    // Static files (/rss.xml, PDFs, images) must load from the server, not the client router.
    if (/\.[a-z0-9]+$/i.test(pathname)) {
      return (
        <a href={local} {...rest}>
          {children}
        </a>
      );
    }
    // Canonical trailing slash (avoids a Netlify Pretty-URL redirect).
    const to = pathname.endsWith("/") ? local : `${pathname}/${local.slice(pathname.length)}`;
    return (
      <Link to={to} {...rest}>
        {children}
      </Link>
    );
  }
  const external = /^https?:\/\//i.test(href);
  return (
    <a href={href} {...rest} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
      {children}
    </a>
  );
}

/* --------------------------------------------------------------- headings */

/** "Weather & cancellation policy" → "weather-cancellation-policy". */
export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Minimal hast shape (avoids a direct dependency on @types/hast). */
interface HastNode {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
}

function textContent(node: HastNode): string {
  if (node.type === "text") return node.value ?? "";
  return (node.children ?? []).map(textContent).join("");
}

/**
 * Tiny rehype plugin: give every h2/h3 a unique id slug of its text. Runs on
 * the tree (not in a component) so ids are deterministic under StrictMode and
 * identical between the prerendered HTML and hydration.
 */
function rehypeHeadingIds() {
  return (tree: HastNode) => {
    const used = new Map<string, number>();
    const walk = (node: HastNode) => {
      if (node.type === "element" && (node.tagName === "h2" || node.tagName === "h3")) {
        const props = (node.properties ??= {});
        const base = props.id ? "" : slugifyHeading(textContent(node));
        if (base) {
          const seen = used.get(base) ?? 0;
          used.set(base, seen + 1);
          props.id = seen ? `${base}-${seen}` : base;
        }
      }
      node.children?.forEach(walk);
    };
    walk(tree);
  };
}

const REHYPE_PLUGINS = [rehypeHeadingIds] as unknown as NonNullable<Options["rehypePlugins"]>;
const REMARK_PLUGINS: NonNullable<Options["remarkPlugins"]> = [remarkGfm];

/* ----------------------------------------------------------------- tables */

function MarkdownTable({ node: _node, className, ...props }: MdProps<"table">) {
  return (
    <div
      className="not-prose my-8 overflow-x-auto overscroll-x-contain rounded-lg border border-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-ennis-orange"
      role="region"
      aria-label="Table (scroll sideways on small screens)"
      tabIndex={0}
    >
      <table
        {...props}
        className={cn(
          "w-full border-collapse text-left text-sm sm:text-base text-gray-300 leading-snug",
          "[&_thead_tr]:border-t-0 [&_a]:text-ennis-orange [&_a]:underline [&_a:hover]:text-ennis-orange-bright [&_strong]:text-white",
          className,
        )}
      />
    </div>
  );
}

function MarkdownThead({ node: _node, className, ...props }: MdProps<"thead">) {
  return <thead {...props} className={cn("bg-gray-900", className)} />;
}

function MarkdownTr({ node: _node, className, ...props }: MdProps<"tr">) {
  return <tr {...props} className={cn("border-t border-gray-700", className)} />;
}

function MarkdownTh({ node: _node, className, ...props }: MdProps<"th">) {
  return (
    <th
      {...props}
      className={cn("px-4 py-3 font-semibold text-white whitespace-nowrap align-bottom", className)}
    />
  );
}

function MarkdownTd({ node: _node, className, ...props }: MdProps<"td">) {
  return <td {...props} className={cn("px-4 py-3 align-top first:font-semibold first:text-white", className)} />;
}

/* -------------------------------------------------------------- renderer */

const COMPONENTS: Components = {
  a: MarkdownLink,
  table: MarkdownTable,
  thead: MarkdownThead,
  tr: MarkdownTr,
  th: MarkdownTh,
  td: MarkdownTd,
};

/** Remove HTML comments (including multi-line ones) so they never reach the renderer. */
export function stripHtmlComments(markdown: string): string {
  return markdown.replace(/<!--[\s\S]*?-->/g, "").replace(/\n{3,}/g, "\n\n");
}

export function MarkdownBody({ children, className }: { children: string; className?: string }) {
  const source = stripHtmlComments(children);
  return (
    <div
      className={cn(
        "prose prose-invert prose-lg max-w-none text-gray-300 leading-relaxed",
        "prose-headings:font-black prose-headings:text-white prose-a:text-ennis-orange hover:prose-a:text-ennis-orange-bright prose-strong:text-white",
        // `>` blocks are callouts (TL;DR, tips), not quotations.
        "prose-blockquote:not-italic prose-blockquote:font-normal prose-blockquote:text-gray-200 prose-blockquote:border-l-4 prose-blockquote:border-ennis-orange prose-blockquote:bg-white/5 prose-blockquote:rounded-r-lg prose-blockquote:py-1 prose-blockquote:px-5",
        className,
      )}
    >
      <ReactMarkdown remarkPlugins={REMARK_PLUGINS} rehypePlugins={REHYPE_PLUGINS} components={COMPONENTS}>
        {source}
      </ReactMarkdown>
    </div>
  );
}

export default MarkdownBody;

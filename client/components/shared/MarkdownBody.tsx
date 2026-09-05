/**
 * Markdown renderer shared by blog posts and site pages (react-markdown +
 * remark-gfm). Internal links become <Link> (client-side navigation); external
 * links open in a new tab with rel="noopener".
 *
 * HTML comments (`<!-- IMAGE: … -->` production notes the writers leave in
 * synced post bodies) are stripped before rendering: react-markdown v9 has raw
 * HTML disabled and would otherwise print them as escaped literal text.
 */
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

function MarkdownLink({
  href,
  children,
  ...rest
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  if (!href) return <a {...rest}>{children}</a>;
  const internal = href.startsWith("/") && !href.startsWith("//");
  if (internal) {
    return (
      <Link to={href} {...rest}>
        {children}
      </Link>
    );
  }
  const external = /^https?:\/\//i.test(href);
  return (
    <a
      href={href}
      {...rest}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </a>
  );
}

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
        className,
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ a: MarkdownLink }}>
        {source}
      </ReactMarkdown>
    </div>
  );
}

export default MarkdownBody;

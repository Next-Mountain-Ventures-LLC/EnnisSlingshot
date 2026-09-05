/**
 * Markdown renderer shared by blog posts and site pages (react-markdown +
 * remark-gfm). Internal links become <Link> (client-side navigation); external
 * links open in a new tab with rel="noopener".
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

export function MarkdownBody({ children, className }: { children: string; className?: string }) {
  return (
    <div
      className={cn(
        "prose prose-invert prose-lg max-w-none text-gray-300 leading-relaxed",
        "prose-headings:font-black prose-headings:text-white prose-a:text-ennis-orange hover:prose-a:text-ennis-orange-bright prose-strong:text-white",
        className,
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ a: MarkdownLink }}>
        {children}
      </ReactMarkdown>
    </div>
  );
}

export default MarkdownBody;

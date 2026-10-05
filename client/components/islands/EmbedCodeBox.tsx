/**
 * EmbedCodeBox — collapsed "Embed this …" panel with one or more copy-paste
 * snippets (bloom tracker, trail map). Prerenders as plain <details> + <pre>
 * so the code is readable without JS; the Copy buttons appear after mount.
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface EmbedSnippet {
  /** Short label above the code ("Embed widget (recommended)"). */
  label: string;
  code: string;
  /** One line under the label. */
  hint?: ReactNode;
}

export interface EmbedCodeBoxProps {
  /** Summary line of the collapsed box ("Embed this map"). */
  title: string;
  /** Intro paragraph shown when opened. */
  intro?: ReactNode;
  snippets: EmbedSnippet[];
  className?: string;
}

export function EmbedCodeBox({ title, intro, snippets, className }: EmbedCodeBoxProps) {
  return (
    <details className={cn("group rounded-lg border border-gray-800 bg-gray-900/40", className)}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-white hover:text-ennis-orange [&::-webkit-details-marker]:hidden">
        <span>{title}</span>
        <span aria-hidden="true" className="text-ennis-orange transition-transform group-open:rotate-180">
          ▾
        </span>
      </summary>
      <div className="border-t border-gray-800 px-4 pb-4 pt-3">
        {intro && <div className="mb-4 text-sm leading-relaxed text-gray-300">{intro}</div>}
        <div className="space-y-5">
          {snippets.map((s) => (
            <SnippetBlock key={s.label} snippet={s} />
          ))}
        </div>
      </div>
    </details>
  );
}

function SnippetBlock({ snippet }: { snippet: EmbedSnippet }) {
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState<"idle" | "copied" | "selected">("idle");
  const preRef = useRef<HTMLPreElement>(null);
  useEffect(() => setMounted(true), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(snippet.code);
      setCopied("copied");
    } catch {
      // Clipboard blocked (e.g. inside an insecure context): select the code so Ctrl/Cmd+C works.
      const pre = preRef.current;
      const sel = typeof window !== "undefined" ? window.getSelection() : null;
      if (pre && sel) {
        const range = document.createRange();
        range.selectNodeContents(pre);
        sel.removeAllRanges();
        sel.addRange(range);
        setCopied("selected");
      }
    }
    setTimeout(() => setCopied("idle"), 2500);
  };

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-white">{snippet.label}</p>
        {mounted && (
          <button
            type="button"
            onClick={copy}
            className="rounded bg-gray-800 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-gray-700"
          >
            {copied === "copied" ? "Copied!" : copied === "selected" ? "Selected — press Ctrl/⌘+C" : "Copy code"}
          </button>
        )}
      </div>
      {snippet.hint && <p className="mb-2 text-xs leading-relaxed text-gray-400">{snippet.hint}</p>}
      <pre
        ref={preRef}
        className="max-h-64 overflow-auto whitespace-pre-wrap break-all rounded border border-gray-800 bg-black/40 p-3 text-xs text-gray-300"
      >
        <code>{snippet.code}</code>
      </pre>
    </div>
  );
}

export default EmbedCodeBox;

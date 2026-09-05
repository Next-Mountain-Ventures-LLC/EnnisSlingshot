/**
 * BloomTrackerIsland (SITE-REBUILD-PLAN.md §5, T14).
 *
 * Everything here is static build-time content from bloom-status.json —
 * current status badge, updatedAt, per-loop table, weekly entries (newest
 * first, with photos) — so it prerenders fully; the only client-side piece
 * is the copy-to-clipboard button for the "Add this to your site" snippet
 * (progressively enhanced, hidden until mounted).
 */
import { useEffect, useState } from "react";
import { absoluteUrl } from "@shared/business";
import { BloomBadge } from "./BloomBadge";
import {
  BLOOM_STATUSES,
  BLOOM_STATUS_JSON_PATH,
  LOOP_LABELS,
  bloomStatus,
  bloomStatusClasses,
  bloomStatusLabel,
  formatBloomDate,
  weeklyEntriesNewestFirst,
  type BloomStatus,
  type LoopKey,
} from "./bloomData";

const LOOP_KEYS: LoopKey[] = ["north", "south", "west"];

function StatusPill({ status }: { status: BloomStatus | null | undefined }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${bloomStatusClasses(status)}`}>
      {bloomStatusLabel(status)}
    </span>
  );
}

export function BloomTrackerIsland({ className }: { className?: string }) {
  const entries = weeklyEntriesNewestFirst();
  const jsonUrl = absoluteUrl(BLOOM_STATUS_JSON_PATH);

  return (
    <section className={className} aria-labelledby="bloom-tracker-heading">
      <div className="bg-gray-900/60 border border-gray-700 rounded-lg p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h2 id="bloom-tracker-heading" className="text-2xl font-black text-white">
              This week's <span className="text-ennis-orange">bloom status</span>
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              Updated{" "}
              <time dateTime={bloomStatus.updatedAt}>{formatBloomDate(bloomStatus.updatedAt)}</time>
              {" · "}
              {bloomStatus.season} season
            </p>
          </div>
          <BloomBadge detailed={false} />
        </div>

        <p className="text-lg text-white font-semibold mb-1">{bloomStatusLabel(bloomStatus.status)}</p>
        {bloomStatus.statusLabel && <p className="text-gray-300 mb-6">{bloomStatus.statusLabel}</p>}

        <h3 className="text-sm uppercase tracking-widest text-gray-500 mb-3">Status by loop</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700">
                <th scope="col" className="py-2 pr-4 font-semibold">
                  Loop
                </th>
                <th scope="col" className="py-2 pr-4 font-semibold">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {LOOP_KEYS.map((key) => (
                <tr key={key} className="border-b border-gray-800 last:border-0">
                  <th scope="row" className="py-2 pr-4 text-white font-medium">
                    {LOOP_LABELS[key]}
                  </th>
                  <td className="py-2 pr-4">
                    <StatusPill status={bloomStatus.loops?.[key] ?? null} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <details className="mt-4 text-xs text-gray-400">
          <summary className="cursor-pointer text-gray-300">What the statuses mean</summary>
          <ul className="mt-2 space-y-1">
            {BLOOM_STATUSES.map((s) => (
              <li key={s} className="flex items-center gap-2">
                <StatusPill status={s} />
                <span>
                  {s === "not-started" && "no color on the loop yet"}
                  {s === "early" && "first fields showing; patchy"}
                  {s === "peak" && "densest color; best week for photos"}
                  {s === "fading" && "past peak; seed pods forming"}
                  {s === "past" && "season over for that loop"}
                </span>
              </li>
            ))}
          </ul>
        </details>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-bold text-white mb-4">Weekly reports</h3>
        {entries.length === 0 ? (
          <p className="text-gray-400">
            No weekly reports yet — updates begin as the {bloomStatus.season} season approaches. Check back from
            mid-March.
          </p>
        ) : (
          <ol className="space-y-6">
            {entries.map((e) => (
              <li key={e.date} className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_200px] border border-gray-800 rounded-lg p-4">
                <div>
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <time dateTime={e.date} className="text-white font-semibold">
                      {formatBloomDate(e.date)}
                    </time>
                    <StatusPill status={e.status} />
                  </div>
                  {e.note && <p className="text-gray-300 text-sm leading-relaxed">{e.note}</p>}
                  {e.loops && (
                    <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
                      {LOOP_KEYS.filter((k) => e.loops?.[k]).map((k) => (
                        <li key={k}>
                          {LOOP_LABELS[k]}: <span className="text-gray-200">{bloomStatusLabel(e.loops?.[k])}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {e.photoUrl && (
                  <img
                    src={e.photoUrl}
                    alt={e.photoAlt ?? `Bluebonnets on the Ennis trails, ${formatBloomDate(e.date)}`}
                    loading="lazy"
                    width={200}
                    height={150}
                    className="rounded-md object-cover w-full h-auto"
                  />
                )}
              </li>
            ))}
          </ol>
        )}
      </div>

      <EmbedSnippet jsonUrl={jsonUrl} />

      {bloomStatus.sources && bloomStatus.sources.length > 0 && (
        <p className="mt-4 text-xs text-gray-500">
          Sources:{" "}
          {bloomStatus.sources.map((src, i) => (
            <span key={src}>
              {i > 0 && ", "}
              <a href={src} target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-300">
                {src.replace(/^https?:\/\//, "")}
              </a>
            </span>
          ))}
        </p>
      )}
    </section>
  );
}

function EmbedSnippet({ jsonUrl }: { jsonUrl: string }) {
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  useEffect(() => setMounted(true), []);

  const snippet = `<!-- Ennis bluebonnet bloom status (updates weekly in season) -->
<span id="ennis-bloom"></span>
<script>
fetch("${jsonUrl}").then(r => r.json()).then(d => {
  document.getElementById("ennis-bloom").textContent =
    "Ennis bluebonnets: " + d.status.replace("-", " ") + " (updated " + d.updatedAt.slice(0, 10) + ")";
});
</script>`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — user can select the text */
    }
  };

  return (
    <div className="mt-8 border border-gray-800 rounded-lg p-4">
      <h3 className="text-lg font-bold text-white mb-2">Add this to your site</h3>
      <p className="text-gray-400 text-sm mb-3">
        Newsrooms and bloggers can read the same status we publish here from{" "}
        <a href={BLOOM_STATUS_JSON_PATH} className="text-ennis-orange hover:text-ennis-orange-bright break-all">
          {jsonUrl}
        </a>{" "}
        (JSON: <code className="text-gray-300">status</code>, <code className="text-gray-300">updatedAt</code>,{" "}
        <code className="text-gray-300">loops</code>, <code className="text-gray-300">weeklyEntries</code>). Please
        credit Ennis Slingshot Experience and link to this page.
      </p>
      <pre className="overflow-x-auto text-xs bg-black/40 border border-gray-800 rounded p-3 text-gray-300">
        <code>{snippet}</code>
      </pre>
      {mounted && (
        <button
          type="button"
          onClick={copy}
          className="mt-3 text-sm px-3 py-1.5 rounded bg-gray-800 text-white hover:bg-gray-700 transition-colors"
        >
          {copied ? "Copied!" : "Copy snippet"}
        </button>
      )}
    </div>
  );
}

export default BloomTrackerIsland;

/**
 * BloomTrackerIsland (SITE-REBUILD-PLAN.md §5, T14).
 *
 * Everything here is static build-time content from bloom-status.json —
 * current status, updatedAt, per-loop table, weekly entries (newest first,
 * with photos) — so it prerenders fully. At the bottom, a collapsed "Embed
 * the bloom tracker" box offers the /embed/bloom-tracker/ iframe (and a JSON
 * snippet for developers); only its Copy buttons are client-side.
 */
import { absoluteUrl } from "@shared/business";
import { EmbedCodeBox } from "./EmbedCodeBox";
import { BLOOM_EMBED_HEIGHT, bloomIframeSnippet, bloomJsonSnippet } from "./embedSnippets";
import {
  BLOOM_STATUSES,
  BLOOM_STATUS_JSON_PATH,
  LOOP_LABELS,
  bloomStatus,
  bloomStatusClasses,
  bloomStatusColor,
  bloomStatusLabel,
  formatBloomDate,
  loopStatus,
  sourceLinkLabel,
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

  return (
    <section className={className} aria-labelledby="bloom-tracker-heading">
      <div className="bg-gray-900/60 border border-gray-700 rounded-lg p-6">
        <div className="mb-6">
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

        <p className="flex items-center gap-2 text-lg text-white font-semibold mb-1">
          <span
            aria-hidden="true"
            className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ background: bloomStatusColor(bloomStatus.status) }}
          />
          {bloomStatusLabel(bloomStatus.status)}
        </p>
        {bloomStatus.statusLabel && <p className="text-gray-300 mb-6">{bloomStatus.statusLabel}</p>}

        <h3 className="text-sm uppercase tracking-widest text-gray-400 mb-3">Status by loop</h3>
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
                    <StatusPill status={loopStatus(key)} />
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
                  {s === "past" && "blooms are done for the year on that loop"}
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

      {bloomStatus.sources && bloomStatus.sources.length > 0 && (
        <p className="mt-6 text-sm text-gray-400">
          Official trail info:{" "}
          {bloomStatus.sources.map((src, i) => (
            <span key={src}>
              {i > 0 && " · "}
              <a
                href={src}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ennis-orange underline-offset-2 hover:text-ennis-orange-bright hover:underline"
              >
                {sourceLinkLabel(src)} ↗
              </a>
            </span>
          ))}
        </p>
      )}

      <EmbedCodeBox
        className="mt-8"
        title="Embed the bloom tracker"
        intro={
          <p>
            Newsrooms, bloggers and local businesses are welcome to show this week&apos;s Ennis bluebonnet status on
            their own site — it updates automatically whenever we post a new report. Please keep the credit line
            under the widget.
          </p>
        }
        snippets={[
          {
            label: "Embed widget (recommended)",
            hint: `Paste into any page that allows HTML. The widget is ${BLOOM_EMBED_HEIGHT}px tall and fits columns from 300px wide.`,
            code: bloomIframeSnippet(),
          },
          {
            label: "For developers: live JSON",
            hint: (
              <>
                The same data as JSON at{" "}
                <a
                  href={BLOOM_STATUS_JSON_PATH}
                  className="break-all text-ennis-orange hover:text-ennis-orange-bright"
                >
                  {absoluteUrl(BLOOM_STATUS_JSON_PATH)}
                </a>{" "}
                (<code>status</code>, <code>statusLabel</code>, <code>loops</code>, <code>updatedAt</code>,{" "}
                <code>weeklyEntries</code>). This snippet shows a one-line status and links back to this page.
              </>
            ),
            code: bloomJsonSnippet(),
          },
        ]}
      />
    </section>
  );
}

export default BloomTrackerIsland;

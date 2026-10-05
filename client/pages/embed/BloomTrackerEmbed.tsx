/**
 * /embed/bloom-tracker/ — compact bloom-status card for other sites to iframe
 * (snippet: BloomTrackerIsland → "Embed the bloom tracker"). Static from
 * bloom-status.json, so it is fully prerendered and needs no JS. Sized for a
 * 260px-tall frame from 300px wide up to ~900px.
 */
import { Seo } from "@/components/seo/Seo";
import {
  LOOP_LABELS,
  bloomStatus,
  bloomStatusClasses,
  bloomStatusColor,
  bloomStatusLabel,
  formatBloomDate,
  loopStatus,
  type LoopKey,
} from "@/components/islands/bloomData";
import { BLOOM_TRACKER_PATH, embedBacklink } from "@/components/islands/embedSnippets";

const LOOPS: LoopKey[] = ["north", "south", "west"];

export function BloomTrackerEmbed() {
  const s = bloomStatus;
  return (
    // The card fills the frame (any iframe height), footer pinned to the bottom.
    <main className="flex min-h-screen flex-col p-2 sm:p-3">
      <Seo
        title="Ennis Bluebonnet Bloom Status — Ennis Slingshot Experience"
        description="This week's Ennis bluebonnet bloom status by trail loop, from the Ennis Slingshot Experience bloom tracker."
        canonicalPath={BLOOM_TRACKER_PATH}
        noindex
      />
      <div className="mx-auto flex w-full max-w-[900px] flex-1 flex-col rounded-lg border border-gray-700 bg-gray-900/80 p-3 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
          <h1 className="text-base font-black leading-tight tracking-tight text-white sm:text-lg">
            Ennis bluebonnets <span className="text-ennis-orange">{s.season}</span>
          </h1>
          <span
            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${bloomStatusClasses(s.status)}`}
          >
            <span aria-hidden="true" className="h-2 w-2 rounded-full" style={{ background: bloomStatusColor(s.status) }} />
            {bloomStatusLabel(s.status)}
          </span>
        </div>

        {s.statusLabel && <p className="mt-1.5 text-sm leading-snug text-gray-300">{s.statusLabel}</p>}

        <ul className="mt-3 grid grid-cols-3 gap-1.5 text-center sm:gap-2" aria-label="Bloom status by trail loop">
          {LOOPS.map((k) => {
            const loop = loopStatus(k);
            return (
              <li key={k} className="rounded-md bg-black/30 px-1 py-1.5 sm:py-2">
                <span className="block text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                  {LOOP_LABELS[k].replace(" Loop", "")}
                </span>
                <span className="mt-0.5 flex items-center justify-center gap-1 text-xs font-semibold text-white">
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ background: bloomStatusColor(loop) }}
                  />
                  {bloomStatusLabel(loop)}
                </span>
              </li>
            );
          })}
        </ul>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-1 pt-3 text-xs text-gray-400">
          <span>
            Updated <time dateTime={s.updatedAt}>{formatBloomDate(s.updatedAt)}</time> ·{" "}
            <a
              href={embedBacklink(BLOOM_TRACKER_PATH, "bloom-widget")}
              target="_blank"
              rel="noopener"
              className="font-semibold text-ennis-orange hover:text-ennis-orange-bright"
            >
              Full bloom tracker ↗
            </a>
          </span>
          <a
            href={embedBacklink("/", "bloom-widget")}
            target="_blank"
            rel="noopener"
            className="whitespace-nowrap hover:text-white"
          >
            by Ennis Slingshot Experience ↗
          </a>
        </div>
      </div>
    </main>
  );
}

export default BloomTrackerEmbed;

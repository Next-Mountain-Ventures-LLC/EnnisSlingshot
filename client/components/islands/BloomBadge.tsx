/**
 * BloomBadge — compact "current bloom status" pill for the home page and the
 * /bluebonnets/ hub. Fully static (reads bloom-status.json at build time), so
 * it prerenders and needs no ClientOnly. Links to the bloom tracker.
 */
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  bloomStatus,
  bloomStatusClasses,
  bloomStatusColor,
  bloomStatusLabel,
  formatBloomDate,
} from "./bloomData";

export interface BloomBadgeProps {
  className?: string;
  /** Show the season year + "updated" date next to the status. Default true. */
  detailed?: boolean;
}

export function BloomBadge({ className, detailed = true }: BloomBadgeProps) {
  const status = bloomStatus.status;
  return (
    <Link
      to="/bluebonnets/bloom-tracker/"
      className={cn(
        // Phones: status on line 1, "updated …" on its own line (rounded box);
        // from sm: one pill-shaped line.
        "inline-flex max-w-full flex-wrap items-center gap-x-2 gap-y-0.5 rounded-2xl px-3 py-1.5 text-sm font-semibold ring-1 transition-colors hover:ring-ennis-orange sm:rounded-full",
        bloomStatusClasses(status),
        className,
      )}
      aria-label={`Bluebonnet bloom status: ${bloomStatusLabel(status)}. Open the bloom tracker.`}
    >
      <span
        aria-hidden="true"
        className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
        style={{ background: bloomStatusColor(status), boxShadow: `0 0 0 3px ${bloomStatusColor(status)}33` }}
      />
      <span className="min-w-0">
        {bloomStatus.season} bluebonnets: <span className="whitespace-nowrap">{bloomStatusLabel(status)}</span>
      </span>
      {detailed && (
        <span className="basis-full pl-[18px] text-xs font-normal opacity-80 sm:basis-auto sm:pl-0">
          <span className="hidden sm:inline">· </span>updated{" "}
          <span className="whitespace-nowrap">{formatBloomDate(bloomStatus.updatedAt)}</span>
        </span>
      )}
    </Link>
  );
}

export default BloomBadge;

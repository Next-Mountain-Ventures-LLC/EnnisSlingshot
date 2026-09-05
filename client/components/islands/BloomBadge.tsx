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
        "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ring-1 transition-colors hover:ring-ennis-orange",
        bloomStatusClasses(status),
        className,
      )}
      aria-label={`Bluebonnet bloom status: ${bloomStatusLabel(status)}. Open the bloom tracker.`}
    >
      <span
        aria-hidden="true"
        className="inline-block h-2.5 w-2.5 rounded-full"
        style={{ background: bloomStatusColor(status), boxShadow: `0 0 0 3px ${bloomStatusColor(status)}33` }}
      />
      <span>
        {bloomStatus.season} bluebonnets: {bloomStatusLabel(status)}
      </span>
      {detailed && (
        <span className="text-xs font-normal opacity-80">· updated {formatBloomDate(bloomStatus.updatedAt)}</span>
      )}
    </Link>
  );
}

export default BloomBadge;

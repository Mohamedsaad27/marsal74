import type { ApprovalHistoryEntry } from "@/lib/admin/approvals-types";
import {
  actorRoleLabel,
  approvalHistoryActionLabel,
  approvalHistoryActionStyles,
  approvalStatusLabel,
  formatDateTime,
} from "@/lib/admin/approvals-types";
import { cn } from "@/lib/utils";

type Props = {
  entries: ApprovalHistoryEntry[];
  compact?: boolean;
};

export function ApprovalHistoryTimeline({ entries, compact = false }: Props) {
  if (entries.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
        لا يوجد سجل لهذا الطلب
      </p>
    );
  }

  const sorted = [...entries].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <ol className="relative space-y-0">
      {sorted.map((entry, index) => {
        const isLast = index === sorted.length - 1;
        return (
          <li key={entry.id} className={cn("relative flex gap-4", compact ? "pb-4" : "pb-6", isLast && "pb-0")}>
            {!isLast && (
              <span
                className="absolute start-[11px] top-6 h-[calc(100%-12px)] w-0.5 bg-border"
                aria-hidden
              />
            )}
            <span
              className={cn(
                "relative z-10 mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 bg-card",
                index === 0 ? "border-success bg-success/10" : "border-primary",
              )}
            >
              <span className={cn("h-2 w-2 rounded-full", index === 0 ? "bg-success" : "bg-primary")} />
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-bold",
                    approvalHistoryActionStyles[entry.action],
                  )}
                >
                  {approvalHistoryActionLabel(entry.action)}
                </span>
                <span className="text-xs text-muted-foreground">{formatDateTime(entry.created_at)}</span>
              </div>
              <p className="mt-1 text-sm">
                <span className="font-semibold">{entry.actor_name}</span>
                <span className="text-muted-foreground"> · {actorRoleLabel(entry.actor_role)}</span>
              </p>
              {entry.from_status != null && entry.to_status != null && (
                <p className="text-xs text-muted-foreground">
                  {approvalStatusLabel(entry.from_status)} → {approvalStatusLabel(entry.to_status)}
                </p>
              )}
              {entry.note && <p className="mt-1 text-xs text-muted-foreground">{entry.note}</p>}
              {!compact && (
                <p className="mt-0.5 font-mono text-[10px] text-muted-foreground/70">{entry.ref}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

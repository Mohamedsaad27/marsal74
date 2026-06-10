import { StatusBadge, type ShipmentStatus } from "@/components/dashboard/StatusBadge";
import { ORDER_STATUS_TO_KEY, formatDateTime } from "@/lib/admin/orders-types";
import type { OrderStatusHistoryEntry } from "@/lib/admin/orders-types";
import { cn } from "@/lib/utils";

type Props = {
  entries: OrderStatusHistoryEntry[];
};

function statusKey(code: number | null): ShipmentStatus | null {
  if (code == null) return null;
  return ORDER_STATUS_TO_KEY[code as keyof typeof ORDER_STATUS_TO_KEY];
}

export function OrderStatusTimeline({ entries }: Props) {
  const sorted = [...entries].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <h3 className="mb-4 text-base font-bold">سجل تغيير الحالة</h3>
      <ol className="relative space-y-0">
        {sorted.map((entry, index) => {
          const toKey = statusKey(entry.to_status);
          const isLast = index === sorted.length - 1;

          return (
            <li key={entry.id} className="relative flex gap-4 pb-6 last:pb-0">
              {!isLast && (
                <span className="absolute start-[11px] top-6 h-[calc(100%-12px)] w-0.5 bg-border" aria-hidden />
              )}
              <span
                className={cn(
                  "relative z-10 mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-card",
                  index === 0 && "border-success bg-success/10",
                )}
              >
                <span className={cn("h-2 w-2 rounded-full", index === 0 ? "bg-success" : "bg-primary")} />
              </span>
              <div className="min-w-0 flex-1 pt-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  {toKey && <StatusBadge status={toKey} />}
                  <span className="text-xs text-muted-foreground">{formatDateTime(entry.created_at)}</span>
                </div>
                <p className="mt-1 text-sm">
                  <span className="font-semibold">{entry.changed_by_name}</span>
                  {entry.from_status != null && (
                    <span className="text-muted-foreground">
                      {" "}
                      — من {ORDER_STATUS_TO_KEY[entry.from_status]} إلى {ORDER_STATUS_TO_KEY[entry.to_status]}
                    </span>
                  )}
                </p>
                {entry.note && <p className="mt-1 text-xs text-muted-foreground">{entry.note}</p>}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

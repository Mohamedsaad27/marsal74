import { Clock, ShieldCheck } from "lucide-react";
import { ExpiryCountdown } from "@/components/admin/ExpiryCountdown";
import { Button } from "@/components/ui/button";
import type { ApprovalRequest } from "@/lib/admin/approvals-types";
import { approvalTypeLabel, formatAmount } from "@/lib/admin/approvals-types";
import { cn } from "@/lib/utils";

type Props = {
  items: ApprovalRequest[];
  onReview: (item: ApprovalRequest) => void;
};

export function PendingApprovalsPanel({ items, onReview }: Props) {
  if (items.length === 0) {
    return (
      <div className="mb-6 rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-10 text-center">
        <ShieldCheck className="mx-auto h-8 w-8 text-muted-foreground/60" />
        <p className="mt-2 text-sm font-semibold text-muted-foreground">لا توجد طلبات بانتظار الرد</p>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center gap-2">
        <Clock className="h-4 w-4 text-warning" />
        <h2 className="text-sm font-bold">بانتظار الموافقة ({items.length})</h2>
        <span className="text-xs text-muted-foreground">— مرتبة حسب أقرب انتهاء</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => {
          const diff = item.expires_at ? new Date(item.expires_at).getTime() - Date.now() : null;
          const urgent = diff !== null && diff > 0 && diff <= 30 * 60 * 1000;

          return (
            <div
              key={item.approval_request_id}
              className={cn(
                "flex flex-col rounded-2xl border bg-card p-4 shadow-soft transition-colors hover:border-primary/30",
                urgent ? "border-destructive/40 ring-1 ring-destructive/20" : "border-border",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-mono text-xs font-semibold text-primary">{item.ref}</p>
                  <p className="mt-0.5 text-sm font-bold">{item.internal_code}</p>
                </div>
                <ExpiryCountdown expiresAt={item.expires_at} />
              </div>

              <div className="mt-3 space-y-1 text-sm">
                <p>
                  <span className="text-muted-foreground">النوع:</span>{" "}
                  <span className="font-medium">{approvalTypeLabel(item.approval_type)}</span>
                </p>
                <p>
                  <span className="text-muted-foreground">المبلغ:</span>{" "}
                  <span className="font-bold tabular-nums">{formatAmount(item.requested_amount)} ج.م</span>
                  <span className="ms-1 text-xs text-muted-foreground line-through">
                    {formatAmount(item.original_amount)}
                  </span>
                </p>
                <p className="truncate text-xs text-muted-foreground" title={item.reason}>
                  {item.requested_by_name} · {item.company_name}
                </p>
              </div>

              <Button
                size="sm"
                className="mt-4 w-full rounded-xl"
                variant={urgent ? "default" : "outline"}
                onClick={() => onReview(item)}
              >
                <ShieldCheck className="ms-2 h-3.5 w-3.5" />
                مراجعة
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

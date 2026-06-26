import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ShieldCheck, Loader2 } from "lucide-react";
import { AdminDialogShell } from "@/components/admin/AdminDialogShell";
import { ExpiryCountdown } from "@/components/admin/ExpiryCountdown";
import { FormTextarea } from "@/components/admin/AdminFormFields";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ApprovalRequest } from "@/lib/admin/approvals-types";
import {
  approvalStatusLabel,
  approvalTypeLabel,
  formatAmount,
  formatDateTime,
} from "@/lib/admin/approvals-types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: ApprovalRequest | null;
  /** @deprecated — no audit-log endpoint; pass [] or omit */
  history?: never[];
  onApprove?: (note: string) => Promise<void>;
  onReject?: (note: string) => Promise<void>;
  loading?: boolean;
  /** kept for API compat but only "admin" is used now */
  reviewMode?: "admin" | "company";
};

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
      <p className="text-xs font-bold text-muted-foreground">{label}</p>
      <p className="mt-1 break-all font-medium">{value}</p>
    </div>
  );
}

export function ApprovalDetailDialog({
  open,
  onOpenChange,
  item,
  onApprove,
  onReject,
  loading = false,
  reviewMode = "admin",
}: Props) {
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!open) setNote("");
  }, [open]);

  if (!item) return null;

  const pending = item.approval_status === 1;
  const canReview = pending && !!onApprove && !!onReject;

  return (
    <AdminDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title={`طلب ${item.ref}`}
      description="approval_requests — تفاصيل طلب الموافقة"
      icon={ShieldCheck}
      badge={item.internal_code}
      size="2xl"
      footer={
        canReview ? (
          <>
            <Button
              className="rounded-xl bg-success px-6 text-success-foreground hover:bg-success/90"
              onClick={() => onApprove(note.trim())}
              disabled={loading}
            >
              {loading && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
              موافقة
            </Button>
            <Button
              variant="destructive"
              className="rounded-xl px-6"
              onClick={() => onReject(note.trim())}
              disabled={loading}
            >
              رفض
            </Button>
            <Button
              variant="outline"
              className="rounded-xl px-5"
              onClick={() => onOpenChange(false)}
            >
              إلغاء
            </Button>
          </>
        ) : (
          <Button variant="outline" className="rounded-xl px-5" onClick={() => onOpenChange(false)}>
            إغلاق
          </Button>
        )
      }
    >
      <div className="space-y-5">
        {/* Status badges */}
        <div className="flex flex-wrap gap-2">
          <Badge>{approvalTypeLabel(item.approval_type)}</Badge>
          <Badge variant="outline">{approvalStatusLabel(item.approval_status)}</Badge>
          {pending && item.expires_at && (
            <ExpiryCountdown expiresAt={item.expires_at} className="rounded-full px-2.5 py-1" />
          )}
        </div>

        {/* Core fields */}
        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <DetailRow label="رقم الطلب" value={item.ref} />
          <DetailRow label="كود التوصيل" value={item.internal_code} />
          <DetailRow label="الشركة" value={item.company_name} />
          <DetailRow label="المندوب" value={item.agent_name} />
          <DetailRow label="طلبه" value={item.requested_by_name} />
          <DetailRow label="نوع الطلب" value={approvalTypeLabel(item.approval_type)} />
          <DetailRow
            label="المبلغ الأصلي"
            value={
              <span className="tabular-nums text-muted-foreground line-through">
                {formatAmount(item.original_amount)} ج.م
              </span>
            }
          />
          <DetailRow
            label="المبلغ المطلوب"
            value={
              <span className="font-bold tabular-nums">
                {formatAmount(item.requested_amount)} ج.م
              </span>
            }
          />
          <DetailRow label="انتهاء المهلة" value={formatDateTime(item.expires_at)} />
          <DetailRow label="تاريخ الإنشاء" value={formatDateTime(item.created_at)} />

          {/* Order context row */}
          {(item.customer_name !== "—" || item.governorate !== "—") && (
            <>
              <DetailRow label="العميل" value={item.customer_name} />
              <DetailRow
                label="المنطقة"
                value={
                  [item.governorate, item.city].filter((v) => v && v !== "—").join(" — ") || "—"
                }
              />
            </>
          )}

          {/* Resolved info — only if not pending */}
          {item.resolved_by && (
            <>
              <DetailRow label="تمت المراجعة بواسطة" value={item.resolved_by} />
              <DetailRow label="تاريخ المراجعة" value={formatDateTime(item.resolved_at)} />
            </>
          )}

          {/* Reason — full width */}
          <div className="rounded-xl border border-border/70 bg-muted/20 p-3 sm:col-span-2">
            <p className="text-xs font-bold text-muted-foreground">السبب</p>
            <p className="mt-1">{item.reason || "—"}</p>
          </div>

          {/* Review note — full width, only if present */}
          {item.review_notes && (
            <div className="rounded-xl border border-success/30 bg-success/5 p-3 sm:col-span-2">
              <p className="text-xs font-bold text-success">ملاحظة المراجعة</p>
              <p className="mt-1">{item.review_notes}</p>
            </div>
          )}
        </div>

        {/* Order link */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">الطلب:</span>
          <Link
            to="/shipments/$orderId"
            params={{ orderId: item.order_id }}
            className="font-mono text-xs font-semibold text-primary hover:underline"
          >
            {item.internal_code}
          </Link>
        </div>

        {/* Review note input */}
        {canReview && (
          <FormTextarea
            label="ملاحظة المراجعة (اختياري)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="سبب الموافقة أو الرفض..."
          />
        )}
      </div>
    </AdminDialogShell>
  );
}

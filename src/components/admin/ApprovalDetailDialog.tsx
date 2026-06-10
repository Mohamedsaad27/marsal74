import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ShieldCheck, Loader2, Building2 } from "lucide-react";
import { AdminDialogShell } from "@/components/admin/AdminDialogShell";
import { ApprovalHistoryTimeline } from "@/components/admin/ApprovalHistoryTimeline";
import { ExpiryCountdown } from "@/components/admin/ExpiryCountdown";
import { FormTextarea } from "@/components/admin/AdminFormFields";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ApprovalHistoryEntry, ApprovalRequest } from "@/lib/admin/approvals-types";
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
  history: ApprovalHistoryEntry[];
  onApprove?: (note: string) => Promise<void>;
  onReject?: (note: string) => Promise<void>;
  loading?: boolean;
  reviewMode?: "admin" | "company";
};

export function ApprovalDetailDialog({
  open,
  onOpenChange,
  item,
  history,
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
      description="approval_requests — تفاصيل طلب الموافقة وسجل الإجراءات"
      icon={ShieldCheck}
      badge={item.internal_code}
      size="2xl"
      footer={
        canReview ? (
          <>
            <Button
              className="rounded-xl bg-success px-6 text-success-foreground hover:bg-success/90"
              onClick={() => onApprove!(note.trim())}
              disabled={loading}
            >
              {loading && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
              {reviewMode === "company" ? "موافقة الشركة" : "موافقة"}
            </Button>
            <Button variant="destructive" className="rounded-xl px-6" onClick={() => onReject!(note.trim())} disabled={loading}>
              {reviewMode === "company" ? "رفض الشركة" : "رفض"}
            </Button>
            <Button variant="outline" className="rounded-xl px-5" onClick={() => onOpenChange(false)}>
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
        <div className="flex flex-wrap gap-2">
          <Badge>{approvalTypeLabel(item.approval_type)}</Badge>
          <Badge variant="outline">{approvalStatusLabel(item.approval_status)}</Badge>
          {pending && item.expires_at && <ExpiryCountdown expiresAt={item.expires_at} className="rounded-full px-2.5 py-1" />}
          {reviewMode === "company" && (
            <Badge variant="secondary" className="gap-1">
              <Building2 className="h-3 w-3" />
              {item.company_name}
            </Badge>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 text-sm">
          {[
            ["approval_request_id", item.approval_request_id],
            ["ref", item.ref],
            ["order_id", item.order_id],
            ["internal_code", item.internal_code],
            ["shipping_company_id", item.shipping_company_id],
            ["company_name", item.company_name],
            ["approval_type", approvalTypeLabel(item.approval_type)],
            ["approval_status", approvalStatusLabel(item.approval_status)],
            ["requested_by", item.requested_by_name],
            ["original_amount", `${formatAmount(item.original_amount)} ج.م`],
            ["requested_amount", `${formatAmount(item.requested_amount)} ج.م`],
            ["expires_at", formatDateTime(item.expires_at)],
            ["resolved_at", formatDateTime(item.resolved_at)],
            ["resolved_by", item.resolved_by ?? "—"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-border/70 bg-muted/20 p-3">
              <p className="text-xs font-bold text-muted-foreground">{label}</p>
              <p className="mt-1 font-medium break-all">{value}</p>
            </div>
          ))}
          <div className="sm:col-span-2 rounded-xl border border-border/70 bg-muted/20 p-3">
            <p className="text-xs font-bold text-muted-foreground">reason</p>
            <p className="mt-1">{item.reason || "—"}</p>
          </div>
          {item.review_note && (
            <div className="sm:col-span-2 rounded-xl border border-success/30 bg-success/5 p-3">
              <p className="text-xs font-bold text-success">review_note</p>
              <p className="mt-1">{item.review_note}</p>
            </div>
          )}
        </div>

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

        {canReview && (
          <FormTextarea
            label={reviewMode === "company" ? "ملاحظة الشركة (اختياري)" : "ملاحظة المراجعة (اختياري)"}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="سبب الموافقة أو الرفض..."
          />
        )}

        <div className="rounded-2xl border border-border bg-card p-4">
          <h3 className="mb-4 text-sm font-bold">سجل الموافقة</h3>
          <ApprovalHistoryTimeline entries={history} compact />
        </div>
      </div>
    </AdminDialogShell>
  );
}

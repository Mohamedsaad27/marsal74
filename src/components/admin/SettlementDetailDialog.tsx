import { Link } from "@tanstack/react-router";
import { Scale } from "lucide-react";
import { AdminDialogShell } from "@/components/admin/AdminDialogShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getLinkedCollections } from "@/lib/admin/settlements-api";
import type { SettlementRecord } from "@/lib/admin/settlements-types";
import {
  formatAmount,
  formatDate,
  formatDateTime,
  paymentMethodLabel,
  settlementPartyName,
  settlementStatusLabel,
  settlementTypeLabel,
} from "@/lib/admin/settlements-types";
import {
  collectionTypeLabel,
  formatDateTime as formatCollectionDate,
} from "@/lib/admin/collections-types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: SettlementRecord | null;
  onApprove?: () => void;
  onMarkPaid?: () => void;
  onPrint?: () => void;
  showActions?: boolean;
};

export function SettlementDetailDialog({
  open,
  onOpenChange,
  item,
  onApprove,
  onMarkPaid,
  onPrint,
  showActions = true,
}: Props) {
  if (!item) return null;

  const linked = getLinkedCollections(item);

  return (
    <AdminDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title={`تسوية ${item.settlement_ref}`}
      description="settlements — تفاصيل التسوية والتحصيلات المرتبطة"
      icon={Scale}
      size="2xl"
      footer={
        <>
          {showActions && item.settlement_status === 1 && onApprove && (
            <Button
              className="rounded-xl bg-info px-6 text-info-foreground hover:bg-info/90"
              onClick={onApprove}
            >
              اعتماد التسوية
            </Button>
          )}
          {showActions && item.settlement_status === 2 && onMarkPaid && (
            <Button
              className="rounded-xl bg-success px-6 text-success-foreground hover:bg-success/90"
              onClick={onMarkPaid}
            >
              تحديد كمدفوعة
            </Button>
          )}

          <Button variant="outline" className="rounded-xl px-5" onClick={() => onOpenChange(false)}>
            إغلاق
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2">
          <Badge>{settlementTypeLabel(item.settlement_type)}</Badge>
          <Badge variant="outline">{settlementStatusLabel(item.settlement_status)}</Badge>
          {item.payment_method && (
            <Badge variant="secondary">{paymentMethodLabel(item.payment_method)}</Badge>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 text-sm">
          {[
            ["settlement_ref", item.settlement_ref],
            ["settlement_type", settlementTypeLabel(item.settlement_type)],
            ["settlement_status", settlementStatusLabel(item.settlement_status)],
            ["party", settlementPartyName(item)],
            ["initiated_by", item.initiated_by_name],
            ["period_from", formatDate(item.period_from)],
            ["period_to", formatDate(item.period_to)],
            ["total_collections", `${formatAmount(item.total_collections)} ج.م`],
            ["total_commissions", `${formatAmount(item.total_commissions)} ج.م`],
            ["net_amount", `${formatAmount(item.net_amount)} ج.م`],
            ["payment_method", paymentMethodLabel(item.payment_method)],
            ["payment_reference", item.payment_reference ?? "—"],
            ["paid_at", formatDateTime(item.paid_at)],
            ["created_at", formatDateTime(item.created_at)],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-border/70 bg-muted/20 p-3">
              <p className="text-xs font-bold text-muted-foreground">{label}</p>
              <p className="mt-1 font-medium break-all">{value}</p>
            </div>
          ))}
          {item.notes && (
            <div className="sm:col-span-2 rounded-xl border border-border/70 bg-muted/20 p-3">
              <p className="text-xs font-bold text-muted-foreground">notes</p>
              <p className="mt-1">{item.notes}</p>
            </div>
          )}
        </div>

        <div>
          {linked.length === 0 ? (
            <></>
          ) : (
            // <p className="rounded-xl border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
            //   لا توجد تحصيلات مرتبطة في البيانات التجريبية
            // </p>
            <div className="overflow-x-auto rounded-2xl border border-border">
              <p className="mb-3 text-sm font-semibold">التحصيلات المرتبطة ({linked.length})</p>

              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-right text-xs font-semibold text-muted-foreground">
                    <th className="px-4 py-2.5">الطلب</th>
                    <th className="px-4 py-2.5">المندوب</th>
                    <th className="px-4 py-2.5">النوع</th>
                    <th className="px-4 py-2.5">المحصّل</th>
                    <th className="px-4 py-2.5">العمولة</th>
                    <th className="px-4 py-2.5">الصافي</th>
                    <th className="px-4 py-2.5">التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {linked.map((c) => (
                    <tr
                      key={c.collection_id}
                      className="border-b border-border/60 last:border-0 hover:bg-muted/20"
                    >
                      <td className="px-4 py-3">
                        <Link
                          to="/shipments/$orderId"
                          params={{ orderId: c.order_id }}
                          className="font-mono text-xs font-semibold text-primary hover:underline"
                        >
                          {c.internal_code}
                        </Link>
                      </td>
                      <td className="px-4 py-3">{c.agent_name}</td>
                      <td className="px-4 py-3 text-xs">
                        {collectionTypeLabel(c.collection_type)}
                      </td>
                      <td className="px-4 py-3 tabular-nums">{formatAmount(c.collected_amount)}</td>
                      <td className="px-4 py-3 tabular-nums text-muted-foreground">
                        −{formatAmount(c.commission_amount)}
                      </td>
                      <td className="px-4 py-3 font-semibold tabular-nums">
                        {formatAmount(c.net_due_company)}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {formatCollectionDate(c.collected_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminDialogShell>
  );
}

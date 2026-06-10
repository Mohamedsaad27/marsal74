import { Printer } from "lucide-react";
import { AdminDialogShell } from "@/components/admin/AdminDialogShell";
import { Button } from "@/components/ui/button";
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
import { collectionTypeLabel } from "@/lib/admin/collections-types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: SettlementRecord | null;
};

export function SettlementStatementDialog({ open, onOpenChange, item }: Props) {
  if (!item) return null;

  const linked = getLinkedCollections(item);

  const handlePrint = () => {
    window.print();
  };

  return (
    <AdminDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title="كشف التسوية"
      description="Settlement statement — معاينة قبل الطباعة"
      icon={Printer}
      badge="print preview"
      size="2xl"
      footer={
        <>
          <Button className="rounded-xl gradient-brand px-6 shadow-glow" onClick={handlePrint}>
            <Printer className="ms-2 h-4 w-4" />
            طباعة
          </Button>
          <Button variant="outline" className="rounded-xl px-5" onClick={() => onOpenChange(false)}>
            إغلاق
          </Button>
        </>
      }
    >
      <div className="rounded-2xl border-2 border-dashed border-primary/30 bg-white p-6 text-foreground print:border-solid">
        <div className="mb-6 flex items-start justify-between gap-4 border-b border-border pb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary">MARSAL ShipOps</p>
            <p className="mt-1 text-lg font-extrabold">كشف تسوية مالية</p>
            <p className="font-mono text-2xl font-extrabold">{item.settlement_ref}</p>
          </div>
          <div className="text-end text-sm">
            <p className="font-semibold">{settlementStatusLabel(item.settlement_status)}</p>
            <p className="text-xs text-muted-foreground">{formatDateTime(item.created_at)}</p>
          </div>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 text-sm">
          <div>
            <p className="text-xs font-bold text-muted-foreground">نوع التسوية</p>
            <p>{settlementTypeLabel(item.settlement_type)}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground">الطرف</p>
            <p className="font-semibold">{settlementPartyName(item)}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground">الفترة</p>
            <p className="tabular-nums">{formatDate(item.period_from)} — {formatDate(item.period_to)}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground">أنشأها</p>
            <p>{item.initiated_by_name}</p>
          </div>
          {item.payment_method && (
            <>
              <div>
                <p className="text-xs font-bold text-muted-foreground">طريقة الدفع</p>
                <p>{paymentMethodLabel(item.payment_method)}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground">مرجع الدفع</p>
                <p className="font-mono text-xs">{item.payment_reference ?? "—"}</p>
              </div>
            </>
          )}
        </div>

        {linked.length > 0 && (
          <div className="mb-6">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">التحصيلات المرتبطة</p>
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-right text-xs text-muted-foreground">
                  <th className="py-2 pe-2">الطلب</th>
                  <th className="py-2 pe-2">النوع</th>
                  <th className="py-2 pe-2">المحصّل</th>
                  <th className="py-2 pe-2">العمولة</th>
                  <th className="py-2">الصافي</th>
                </tr>
              </thead>
              <tbody>
                {linked.map((c) => (
                  <tr key={c.collection_id} className="border-b border-border/50">
                    <td className="py-2 pe-2 font-mono text-xs">{c.internal_code}</td>
                    <td className="py-2 pe-2 text-xs">{collectionTypeLabel(c.collection_type)}</td>
                    <td className="py-2 pe-2 tabular-nums">{formatAmount(c.collected_amount)}</td>
                    <td className="py-2 pe-2 tabular-nums">−{formatAmount(c.commission_amount)}</td>
                    <td className="py-2 tabular-nums font-semibold">{formatAmount(c.net_due_company)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="rounded-xl border border-border bg-muted/20 p-4">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">إجمالي التحصيل</p>
              <p className="text-lg font-bold tabular-nums">{formatAmount(item.total_collections)} ج.م</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">العمولات</p>
              <p className="text-lg font-bold tabular-nums text-muted-foreground">−{formatAmount(item.total_commissions)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">الصافي المستحق</p>
              <p className="text-xl font-extrabold tabular-nums text-primary">{formatAmount(item.net_amount)} ج.م</p>
            </div>
          </div>
        </div>

        {item.notes && (
          <p className="mt-4 text-xs text-muted-foreground">
            <span className="font-semibold">ملاحظات:</span> {item.notes}
          </p>
        )}

        <div className="mt-8 flex justify-between border-t border-border pt-6 text-xs text-muted-foreground">
          <p>توقيع المستلم: _______________</p>
          <p>توقيع المحاسب: _______________</p>
        </div>
      </div>
    </AdminDialogShell>
  );
}

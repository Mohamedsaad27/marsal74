import { Printer } from "lucide-react";
import { AdminDialogShell } from "@/components/admin/AdminDialogShell";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import type { OrderDetail } from "@/lib/admin/orders-types";
import { formatAmount, formatDateTime } from "@/lib/admin/orders-types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: OrderDetail | null;
};

export function OrderWaybillDialog({ open, onOpenChange, order }: Props) {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <AdminDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title="طباعة بوليصة الشحن"
      description="Waybill / order label — معاينة قبل الطباعة"
      icon={Printer}
      badge="print preview"
      size="lg"
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
        <div className="mb-4 flex items-start justify-between gap-4 border-b border-border pb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary">MARSAL ShipOps</p>
            <p className="mt-1 font-mono text-2xl font-extrabold">{order.order.internal_code}</p>
            <p className="text-xs text-muted-foreground">ref: {order.order.reference_no}</p>
          </div>
          <StatusBadge status={order.status_key} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 text-sm">
          <div>
            <p className="text-xs font-bold text-muted-foreground">المستلم</p>
            <p className="font-semibold">{order.customer_info.customer_name}</p>
            <p className="font-mono tabular-nums">{order.customer_info.customer_phone}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground">العنوان</p>
            <p>{order.governorate_name} / {order.city_name}</p>
            <p className="text-muted-foreground">{order.address.address_line}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground">شركة الشحن</p>
            <p>{order.company_name}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground">المندوب</p>
            <p>{order.agent_name ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground">المبلغ (COD)</p>
            <p className="text-lg font-bold tabular-nums">{formatAmount(order.financials.original_amount)} ج.م</p>
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground">created_at</p>
            <p className="text-xs">{formatDateTime(order.order.created_at)}</p>
          </div>
        </div>

        <div className="mt-6 flex h-16 items-end justify-center border border-border bg-muted/20">
          <p className="pb-2 font-mono text-xs tracking-[0.3em] text-muted-foreground">|||| {order.order.internal_code} ||||</p>
        </div>
      </div>
    </AdminDialogShell>
  );
}

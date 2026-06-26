import { PackageCheck, Undo2 } from "lucide-react";
import { AdminDialogShell } from "@/components/admin/AdminDialogShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ReturnRecord } from "@/lib/admin/returns-types";
import { formatDateTime, returnStatusLabel } from "@/lib/admin/returns-types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: ReturnRecord | null;
};

export function ReturnDetailDialog({ open, onOpenChange, item }: Props) {
  if (!item) return null;

  return (
    <AdminDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title="تفاصيل المرتجع"
      description="returns — تفاصيل سجل المرتجع"
      icon={Undo2}
      badge={item.return_id}
      size="lg"
      footer={
        <Button variant="outline" className="rounded-xl px-5" onClick={() => onOpenChange(false)}>
          إغلاق
        </Button>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2 text-sm">
        {(
          [
            ["المعرّف", item.return_id],
            ["الطلب", item.order_id],
            ["المندوب", item.agent_name],
            ["معرّف المندوب", item.delivery_agent_id],
            ["الشركة", item.company_name],
            ["معرّف الشركة", item.shipping_company_id],
            ["الكمية المرتجعة", String(item.returned_quantity)],
            ["سبب الإرجاع", item.return_reason],
            ["ملاحظات", item.notes ?? "—"],
            ["الحالة", returnStatusLabel(item.return_status)],
            ["تاريخ الاستلام", formatDateTime(item.received_at)],
            ["تاريخ التسليم للشركة", formatDateTime(item.returned_to_company_at)],
            ["تاريخ الإنشاء", formatDateTime(item.created_at)],
          ] as [string, string][]
        ).map(([label, value]) => (
          <div key={label} className="rounded-xl border border-border/70 bg-muted/20 p-3">
            <p className="text-xs font-bold text-muted-foreground">{label}</p>
            <p className="mt-1 font-medium break-all">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <Badge variant="outline">{returnStatusLabel(item.return_status)}</Badge>
        {item.return_status === 2 && (
          <span className="inline-flex items-center gap-1 text-xs text-info">
            <PackageCheck className="h-3.5 w-3.5" />
            جاهز للتسليم للشركة
          </span>
        )}
      </div>
    </AdminDialogShell>
  );
}

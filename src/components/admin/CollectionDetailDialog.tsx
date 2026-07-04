import { Wallet } from "lucide-react";
import { AdminDialogShell } from "@/components/admin/AdminDialogShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { CollectionRecord } from "@/lib/admin/collections-types";
import { collectionTypeLabel, formatAmount, formatDateTime } from "@/lib/admin/collections-types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: CollectionRecord | null;
};

export function CollectionDetailDialog({ open, onOpenChange, item }: Props) {
  if (!item) return null;

  return (
    <AdminDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title={`تحصيل ${item.internal_code}`}
      description="نحصيلات — تفاصيل عملية التحصيل"
      icon={Wallet}
      size="lg"
      footer={
        <Button variant="outline" className="rounded-xl px-5" onClick={() => onOpenChange(false)}>
          إغلاق
        </Button>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2 text-sm">
        {[
          ["اسم المندوب", item.agent_name],
          ["اسم الشركة", item.company_name],
          ["نوع التحصيل", collectionTypeLabel(item.collection_type)],
          ["المبلغ المحصل", `${formatAmount(item.collected_amount)} ج.م`],
          ["عمولة التحصيل", `${formatAmount(item.commission_amount)} ج.م`],
          ["الدين الصافي للشركة", `${formatAmount(item.net_due_company)} ج.م`],
          ["الحالة", item.is_settled === 1 ? "مسوّاة" : "معلّقة"],
          ["تم استلام النقد", item.cash_received_by_admin === 1 ? "نعم" : "لا"],
          ["تاريخ استلام النقد", formatDateTime(item.cash_received_at)],
          ["تاريخ التحصيل", formatDateTime(item.collected_at)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-border/70 bg-muted/20 p-3">
            <p className="text-xs font-bold text-muted-foreground">{label}</p>
            <p className="mt-1 font-medium break-all">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Badge variant={item.is_settled === 1 ? "default" : "secondary"}>
          {item.is_settled === 1 ? "مسوّاة" : "تسوية معلّقة"}
        </Badge>
        <Badge variant={item.cash_received_by_admin === 1 ? "default" : "outline"}>
          {item.cash_received_by_admin === 1 ? "تم استلام النقد" : "بانتظار التسليم للإدارة"}
        </Badge>
      </div>
    </AdminDialogShell>
  );
}

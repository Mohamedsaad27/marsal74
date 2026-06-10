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
      title={`مرتجع ${item.return_ref}`}
      description="returns — تفاصيل سجل المرتجع"
      icon={Undo2}
      badge={item.internal_code}
      size="lg"
      footer={
        <Button variant="outline" className="rounded-xl px-5" onClick={() => onOpenChange(false)}>
          إغلاق
        </Button>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2 text-sm">
        {[
          ["return_id", item.return_id],
          ["return_ref", item.return_ref],
          ["order_id", item.order_id],
          ["internal_code", item.internal_code],
          ["delivery_agent_id", item.delivery_agent_id],
          ["agent_name", item.agent_name],
          ["shipping_company_id", item.shipping_company_id],
          ["company_name", item.company_name],
          ["returned_quantity", String(item.returned_quantity)],
          ["return_reason", item.return_reason],
          ["return_status", returnStatusLabel(item.return_status)],
          ["received_at", formatDateTime(item.received_at)],
          ["returned_to_company_at", formatDateTime(item.returned_to_company_at)],
          ["created_at", formatDateTime(item.created_at)],
        ].map(([label, value]) => (
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

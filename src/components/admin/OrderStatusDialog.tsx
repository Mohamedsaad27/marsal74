import { useEffect, useState } from "react";
import { RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AdminDialogShell } from "@/components/admin/AdminDialogShell";
import { FormSelect, FormTextarea } from "@/components/admin/AdminFormFields";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { ORDER_STATUS_OPTIONS } from "@/lib/admin/orders-types";
import type { OrderListItem } from "@/lib/admin/orders-types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: OrderListItem | null;
  onSave: (status: number, note: string) => Promise<void>;
  loading?: boolean;
};

export function OrderStatusDialog({ open, onOpenChange, order, onSave, loading = false }: Props) {
  const [status, setStatus] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (open && order) {
      setStatus(String(order.order.status));
      setNote("");
    } else if (!open) {
      setStatus("");
      setNote("");
    }
  }, [open, order]);

  const handleSave = async () => {
    if (!status) {
      toast.error("يرجى اختيار الحالة");
      return;
    }
    await onSave(Number(status), note.trim());
  };

  if (!order) return null;

  return (
    <AdminDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title="تغيير حالة الطلب"
      description={`orders.status — ${order.order.internal_code}`}
      icon={RefreshCw}
      badge="status update"
      size="md"
      footer={
        <>
          <Button className="rounded-xl gradient-brand px-6 shadow-glow" onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
            تحديث الحالة
          </Button>
          <Button variant="outline" className="rounded-xl px-5" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/30 p-3">
          <span className="text-sm text-muted-foreground">الحالة الحالية</span>
          <StatusBadge status={order.status_key} />
        </div>
        <FormSelect
          label="status"
          required
          value={status}
          onValueChange={setStatus}
          options={ORDER_STATUS_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
          placeholder="اختر الحالة الجديدة"
        />
        <FormTextarea
          label="ملاحظة (سجل الحالة)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="سبب تغيير الحالة..."
        />
      </div>
    </AdminDialogShell>
  );
}

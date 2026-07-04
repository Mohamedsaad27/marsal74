import { useEffect, useState } from "react";
import { RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AdminDialogShell } from "@/components/admin/AdminDialogShell";
import { FormSelect, FormTextarea, FormInput } from "@/components/admin/AdminFormFields";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { ORDER_STATUS_OPTIONS } from "@/lib/admin/orders-types";
import type { OrderListItem, OrderStatusPayload } from "@/lib/admin/orders-types";

// من القسم 7 في الدليل
const COLLECTION_TYPE_OPTIONS = [
  { value: "1", label: "COD — المبلغ الكامل" },
  { value: "2", label: "رسوم الشحن فقط" },
  { value: "3", label: "تحصيل جزئي" },
];

type ExtraField = "collected_amount" | "collection_type" | "new_cod_amount" | "postponed_date";

type StatusConfig = {
  fields: ExtraField[];
  lockedCollectionType?: string; // partial=3, refused_paid_shipping=2
};

const STATUS_CONFIG: Record<number, StatusConfig> = {
  5: { fields: ["collected_amount", "collection_type"] }, // Delivered
  6: { fields: ["new_cod_amount", "collected_amount", "collection_type"] }, // Delivered Price Changed
  7: { fields: ["collected_amount", "collection_type"], lockedCollectionType: "3" }, // Partial
  8: { fields: ["collected_amount", "collection_type"], lockedCollectionType: "2" }, // Refused Paid Shipping
  15: { fields: ["postponed_date"] }, // Postponed
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: OrderListItem | null;
  onSave: (payload: OrderStatusPayload) => Promise<void>;
  loading?: boolean;
};

const getTomorrowISO = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
};

export function OrderStatusDialog({ open, onOpenChange, order, onSave, loading = false }: Props) {
  const [status, setStatus] = useState("");
  const [note, setNote] = useState("");
  const [collectedAmount, setCollectedAmount] = useState("");
  const [collectionType, setCollectionType] = useState("");
  const [newCodAmount, setNewCodAmount] = useState("");
  const [postponedDate, setPostponedDate] = useState("");

  const statusId = status ? Number(status) : null;
  const config = statusId ? STATUS_CONFIG[statusId] : undefined;
  const showField = (f: ExtraField) => config?.fields.includes(f) ?? false;

  const resetExtras = () => {
    setCollectedAmount("");
    setCollectionType("");
    setNewCodAmount("");
    setPostponedDate("");
  };

  useEffect(() => {
    if (open && order) {
      setStatus(String(order.order.status));
      setNote("");
      resetExtras();
    } else if (!open) {
      setStatus("");
      setNote("");
      resetExtras();
    }
  }, [open, order]);

  useEffect(() => {
    resetExtras();
    if (config?.lockedCollectionType) setCollectionType(config.lockedCollectionType);
  }, [statusId]); // eslint-disable-line react-hooks/exhaustive-deps

  const validate = (): string | null => {
    if (!status) return "يرجى اختيار الحالة";
    if (showField("collected_amount") && (!collectedAmount || Number(collectedAmount) < 0)) {
      return "يرجى إدخال المبلغ المحصّل";
    }
    if (showField("collection_type") && !collectionType) {
      return "يرجى اختيار نوع التحصيل";
    }
    if (showField("new_cod_amount") && (!newCodAmount || Number(newCodAmount) < 0)) {
      return "يرجى إدخال السعر الجديد";
    }
    if (showField("postponed_date")) {
      if (!postponedDate) return "يرجى تحديد تاريخ التأجيل";
      if (postponedDate < getTomorrowISO()) return "تاريخ التأجيل يجب أن يكون بعد اليوم";
    }
    return null;
  };

  const handleSave = async () => {
    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }
    const payload: OrderStatusPayload = { status_id: Number(status), notes: note.trim() };
    if (showField("collected_amount")) payload.collected_amount = Number(collectedAmount);
    if (showField("collection_type")) payload.collection_type = Number(collectionType);
    if (showField("new_cod_amount")) payload.new_cod_amount = Number(newCodAmount);
    if (showField("postponed_date")) payload.postponed_date = postponedDate;
    await onSave(payload);
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
          <Button
            className="rounded-xl gradient-brand px-6 shadow-glow"
            onClick={handleSave}
            disabled={loading}
          >
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
          label="الحالة الجديدة"
          required
          value={status}
          onValueChange={setStatus}
          options={ORDER_STATUS_OPTIONS.filter((o) => o.code !== null).map((o) => ({
            value: o.value,
            label: o.label,
          }))}
          placeholder="اختر الحالة الجديدة"
        />

        {showField("new_cod_amount") && (
          <FormInput
            label="السعر الجديد "
            required
            type="number"
            value={newCodAmount}
            onChange={(e) => setNewCodAmount(e.target.value)}
            placeholder="مثال: 720.00"
          />
        )}

        {showField("collected_amount") && (
          <FormInput
            label="المبلغ المحصّل"
            required
            type="number"
            value={collectedAmount}
            onChange={(e) => setCollectedAmount(e.target.value)}
            placeholder="مثال: 850.00"
          />
        )}

        {showField("collection_type") &&
          (config?.lockedCollectionType ? (
            <div className="space-y-1.5">
              <Label>نوع التحصيل </Label>
              <div className="rounded-lg border border-border/70 bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                {
                  COLLECTION_TYPE_OPTIONS.find((o) => o.value === config.lockedCollectionType)
                    ?.label
                }
                <span className="ms-2 text-xs">(محدد تلقائيًا حسب الحالة)</span>
              </div>
            </div>
          ) : (
            <FormSelect
              label="نوع التحصيل"
              required
              value={collectionType}
              onValueChange={setCollectionType}
              options={COLLECTION_TYPE_OPTIONS}
              placeholder="اختر نوع التحصيل"
            />
          ))}

        {showField("postponed_date") && (
          <FormInput
            label="تاريخ التأجيل"
            required
            type="date"
            min={getTomorrowISO()}
            value={postponedDate}
            onChange={(e) => setPostponedDate(e.target.value)}
          />
        )}

        {statusId === 6 && (
          <p className="text-xs text-muted-foreground rounded-lg bg-amber-500/10 border border-amber-500/30 p-2">
            ملاحظة: هذه الحالة تُخزَّن فعليًا كـ "بانتظار الموافقة " لحين مراجعة الأدمن.
          </p>
        )}

        <FormTextarea
          label={statusId === 9 || statusId === 10 ? "ملاحظة (اختياري)" : "ملاحظة (سجل الحالة)"}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="سبب تغيير الحالة..."
        />
      </div>
    </AdminDialogShell>
  );
}

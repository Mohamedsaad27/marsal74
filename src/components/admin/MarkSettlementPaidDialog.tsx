import { useEffect, useState } from "react";
import { CircleDollarSign, Loader2 } from "lucide-react";
import { AdminDialogShell } from "@/components/admin/AdminDialogShell";
import { FormInput, FormSelect } from "@/components/admin/AdminFormFields";
import { Button } from "@/components/ui/button";
import type { MarkSettlementPaidInput, SettlementRecord } from "@/lib/admin/settlements-types";
import {
  PAYMENT_METHOD_OPTIONS,
  formatAmount,
  settlementPartyName,
} from "@/lib/admin/settlements-types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: SettlementRecord | null;
  onSave: (input: MarkSettlementPaidInput) => Promise<void>;
  loading?: boolean;
};

export function MarkSettlementPaidDialog({
  open,
  onOpenChange,
  item,
  onSave,
  loading = false,
}: Props) {
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [paymentReference, setPaymentReference] = useState("");

  useEffect(() => {
    if (open) {
      setPaymentMethod("bank_transfer");
      setPaymentReference("");
    }
  }, [open]);

  if (!item) return null;

  const handleSave = async () => {
    await onSave({
      payment_method: paymentMethod,
      payment_reference: paymentReference.trim(),
    });
  };

  return (
    <AdminDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title="تحديد التسوية كمدفوعة"
      description="تسويات — تسجيل طريقة الدفع والمرجع"
      icon={CircleDollarSign}
      badge={item.settlement_ref}
      tone="success"
      footer={
        <>
          <Button
            className="rounded-xl bg-success px-6 text-success-foreground hover:bg-success/90"
            onClick={handleSave}
            disabled={loading}
          >
            {loading && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
            تأكيد الدفع
          </Button>
          <Button variant="outline" className="rounded-xl px-5" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="rounded-2xl border border-border bg-muted/30 p-4 text-sm">
          <p>
            <span className="text-muted-foreground">الطرف:</span>{" "}
            <span className="font-semibold">{settlementPartyName(item)}</span>
          </p>
          <p className="mt-1">
            <span className="text-muted-foreground">المبلغ</span>{" "}
            <span className="text-lg font-bold tabular-nums text-success">
              {formatAmount(item.net_amount)} ج.م
            </span>
          </p>
        </div>

        <FormSelect
          label="نوع الدفع"
          value={paymentMethod}
          onValueChange={setPaymentMethod}
          options={PAYMENT_METHOD_OPTIONS}
          required
        />
        <FormInput
          label="مرجع الدفع"
          value={paymentReference}
          onChange={(e) => setPaymentReference(e.target.value)}
          placeholder="رقم التحويل أو المرجع..."
        />
      </div>
    </AdminDialogShell>
  );
}

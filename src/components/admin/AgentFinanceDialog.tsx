import { useEffect, useState } from "react";
import { Coins, Loader2, Percent } from "lucide-react";
import { toast } from "sonner";
import { AdminDialogShell } from "@/components/admin/AdminDialogShell";
import { FormInput, FormSelect } from "@/components/admin/AdminFormFields";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type {
  CommissionType,
  DeliveryAgent,
  UpdateAgentFinancePayload,
} from "@/lib/admin/delivery-agents-types";
import { COMMISSION_TYPE_LABELS, formatCommission } from "@/lib/admin/delivery-agents-types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent: DeliveryAgent | null;
  onSave: (payload: UpdateAgentFinancePayload) => Promise<void>;
  loading?: boolean;
};

export function AgentFinanceDialog({ open, onOpenChange, agent, onSave, loading = false }: Props) {
  const [commissionType, setCommissionType] = useState<CommissionType>(1);
  const [commissionValue, setCommissionValue] = useState("");

  useEffect(() => {
    if (!open || !agent) return;
    setCommissionType(agent.commission_type);
    setCommissionValue(String(agent.commission_value));
  }, [open, agent]);

  const handleSave = async () => {
    const value = Number(commissionValue);
    if (!commissionValue || Number.isNaN(value) || value <= 0) {
      toast.error("قيمة العمولة غير صالحة");
      return;
    }
    await onSave({ commission_type: commissionType, commission_value: value });
  };

  return (
    <AdminDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title={agent ? `الرصيد والعمولة — ${agent.name}` : "الرصيد والعمولة"}
      description="عرض رصيد المندوب وتعديل إعدادات العمولة"
      icon={Coins}
      badge="مالي"
      size="lg"
      footer={
        <>
          <Button
            className="rounded-xl gradient-brand px-6 shadow-glow"
            onClick={handleSave}
            disabled={loading || !agent}
          >
            {loading && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
            حفظ إعدادات العمولة
          </Button>
          <Button variant="outline" className="rounded-xl px-5" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
        </>
      }
    >
      {agent && (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-warning/30 bg-warning/5 p-4">
              <p className="text-xs font-bold text-muted-foreground">الرصيد الحالي</p>
              <p className="mt-2 text-3xl font-extrabold tabular-nums text-warning">
                {agent.balance.toLocaleString("", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
                <span className="ms-1 text-sm font-medium text-muted-foreground">ج.م</span>
              </p>
              <p className="mt-2 text-xs text-muted-foreground">يُحدّث من التحصيلات والتسويات</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-soft">
              <p className="text-xs font-bold text-muted-foreground">العمولة الحالية</p>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant="secondary" className="rounded-md">
                  {COMMISSION_TYPE_LABELS[agent.commission_type]}
                </Badge>
                <span className="text-xl font-bold">
                  {formatCommission(agent.commission_type, agent.commission_value)}
                </span>
              </div>
            </div>
          </div>

          <section className="rounded-2xl border border-border/70 bg-card p-4 shadow-soft">
            <div className="mb-4 flex items-center gap-2">
              <Percent className="h-4 w-4 text-primary" />
              <h3 className="font-bold">تعديل إعدادات العمولة</h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormSelect
                label="نوع العمولة"
                value={String(commissionType)}
                onValueChange={(value) => setCommissionType(Number(value) as CommissionType)}
                options={[
                  { value: "1", label: "نسبة مئوية %" },
                  { value: "2", label: "مبلغ ثابت (ج.م)" },
                ]}
              />
              <FormInput
                label="قيمة العمولة"
                type="number"
                required
                value={commissionValue}
                onChange={(e) => setCommissionValue(e.target.value)}
                dir="ltr"
              />
            </div>
            <p className="mt-3 rounded-xl bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
              المعاينة: {formatCommission(commissionType, Number(commissionValue) || 0)}
            </p>
          </section>
        </div>
      )}
    </AdminDialogShell>
  );
}

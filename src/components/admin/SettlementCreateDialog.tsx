import { useEffect, useState } from "react";
import { Scale, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AdminDialogShell } from "@/components/admin/AdminDialogShell";
import { FormInput, FormSelect, FormTextarea } from "@/components/admin/AdminFormFields";
import { Button } from "@/components/ui/button";
import { fetchAgentOptions, fetchCompanyOptions } from "@/lib/admin/orders-api";
import type { AgentOption, CompanyOption } from "@/lib/admin/orders-api";
import type { CreateSettlementInput, SettlementTypeCode } from "@/lib/admin/settlements-types";
import { SETTLEMENT_TYPE_OPTIONS } from "@/lib/admin/settlements-types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (input: CreateSettlementInput) => Promise<void>;
  loading?: boolean;
};

export function SettlementCreateDialog({ open, onOpenChange, onSave, loading = false }: Props) {
  const [settlementType, setSettlementType] = useState<string>("2");
  const [partyId, setPartyId] = useState("");
  const [periodFrom, setPeriodFrom] = useState("");
  const [periodTo, setPeriodTo] = useState("");
  const [notes, setNotes] = useState("");

  const [agentOptions, setAgentOptions] = useState<AgentOption[]>([]);
  const [companyOptions, setCompanyOptions] = useState<CompanyOption[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(false);

  const typeCode = Number(settlementType) as SettlementTypeCode;
  const partyOptions = typeCode === 1 ? agentOptions : companyOptions;

  useEffect(() => {
    setOptionsLoading(true);
    Promise.all([fetchAgentOptions(), fetchCompanyOptions()])
      .then(([agents, companies]) => {
        if (agents.isSuccess) setAgentOptions(agents.data);
        if (companies.isSuccess) setCompanyOptions(companies.data);
      })
      .catch(() => toast.error("فشل تحميل خيارات المندوبين والشركات"))
      .finally(() => setOptionsLoading(false));
  }, []);

  useEffect(() => {
    if (open) {
      setSettlementType("2");
      setPartyId("");
      setPeriodFrom("");
      setPeriodTo("");
      setNotes("");
    }
  }, [open]);

  useEffect(() => {
    setPartyId("");
  }, [settlementType]);

  const handleSave = async () => {
    if (!partyId) {
      toast.error("يرجى اختيار الطرف");
      return;
    }
    if (!periodFrom || !periodTo) {
      toast.error("يرجى تحديد الفترة");
      return;
    }
    await onSave({
      settlement_type: typeCode,
      party_id: partyId,
      period_from: periodFrom,
      period_to: periodTo,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <AdminDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title="إنشاء تسوية"
      description="settlements — تسوية مندوب أو شركة شحن لفترة محددة"
      icon={Scale}
      size="2xl"
      footer={
        <>
          <Button
            className="rounded-xl gradient-brand px-6 shadow-glow"
            onClick={handleSave}
            disabled={loading || optionsLoading}
          >
            {loading && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
            حفظ
          </Button>
          <Button variant="outline" className="rounded-xl px-5" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormSelect
            label="نوع التسوية"
            value={settlementType}
            onValueChange={setSettlementType}
            options={SETTLEMENT_TYPE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
            required
          />
          <FormSelect
            label={typeCode === 1 ? "مندوب التوصيل" : "شركة الشحن"}
            value={partyId}
            onValueChange={setPartyId}
            options={partyOptions}
            placeholder={
              optionsLoading
                ? "جاري التحميل..."
                : typeCode === 1
                  ? "اختر المندوب..."
                  : "اختر الشركة..."
            }
            required
          />
          <FormInput
            label="من"
            type="date"
            value={periodFrom}
            onChange={(e) => setPeriodFrom(e.target.value)}
            required
          />
          <FormInput
            label="إلى"
            type="date"
            value={periodTo}
            onChange={(e) => setPeriodTo(e.target.value)}
            required
          />
        </div>
        <FormTextarea
          label="ملاحظات"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="ملاحظات اختيارية..."
        />
      </div>
    </AdminDialogShell>
  );
}

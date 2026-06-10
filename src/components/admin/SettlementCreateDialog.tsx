import { useEffect, useMemo, useState } from "react";
import { Scale, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AdminDialogShell } from "@/components/admin/AdminDialogShell";
import { FormInput, FormSelect, FormTextarea } from "@/components/admin/AdminFormFields";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { getEligibleCollections } from "@/lib/admin/settlements-api";
import { SETTLEMENT_AGENT_OPTIONS, SETTLEMENT_COMPANY_OPTIONS } from "@/lib/admin/settlements-data";
import type { CreateSettlementInput, SettlementTypeCode } from "@/lib/admin/settlements-types";
import { SETTLEMENT_TYPE_OPTIONS, formatAmount } from "@/lib/admin/settlements-types";
import { collectionTypeLabel } from "@/lib/admin/collections-types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (input: CreateSettlementInput) => Promise<void>;
  loading?: boolean;
};

export function SettlementCreateDialog({ open, onOpenChange, onSave, loading = false }: Props) {
  const [settlementType, setSettlementType] = useState<string>("2");
  const [partyId, setPartyId] = useState("");
  const [periodFrom, setPeriodFrom] = useState("2026-05-01");
  const [periodTo, setPeriodTo] = useState("2026-05-24");
  const [notes, setNotes] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const typeCode = Number(settlementType) as SettlementTypeCode;
  const partyOptions = typeCode === 1 ? SETTLEMENT_AGENT_OPTIONS : SETTLEMENT_COMPANY_OPTIONS;

  const eligible = useMemo(() => {
    if (!partyId || !periodFrom || !periodTo) return [];
    return getEligibleCollections(typeCode, partyId, periodFrom, periodTo);
  }, [typeCode, partyId, periodFrom, periodTo]);

  useEffect(() => {
    if (open) {
      setSettlementType("2");
      setPartyId("");
      setPeriodFrom("2026-05-01");
      setPeriodTo("2026-05-24");
      setNotes("");
      setSelected(new Set());
    }
  }, [open]);

  useEffect(() => {
    setSelected(new Set(eligible.map((c) => c.collection_id)));
  }, [eligible]);

  useEffect(() => {
    setPartyId("");
  }, [settlementType]);

  const totals = useMemo(() => {
    const items = eligible.filter((c) => selected.has(c.collection_id));
    const totalCollections = items.reduce((sum, c) => sum + c.collected_amount, 0);
    const totalCommissions = items.reduce((sum, c) => sum + c.commission_amount, 0);
    return { count: items.length, totalCollections, totalCommissions, net: totalCollections - totalCommissions };
  }, [eligible, selected]);

  const handleSave = async () => {
    if (!partyId) {
      toast.error("يرجى اختيار الطرف");
      return;
    }
    if (!periodFrom || !periodTo) {
      toast.error("يرجى تحديد الفترة");
      return;
    }
    if (selected.size === 0) {
      toast.error("لا توجد تحصيلات مؤهلة في هذه الفترة");
      return;
    }

    await onSave({
      settlement_type: typeCode,
      party_id: partyId,
      period_from: periodFrom,
      period_to: periodTo,
      collection_ids: Array.from(selected),
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
      badge="draft"
      size="2xl"
      footer={
        <>
          <Button className="rounded-xl gradient-brand px-6 shadow-glow" onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
            حفظ كمسودة
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
            label="settlement_type"
            value={settlementType}
            onValueChange={setSettlementType}
            options={SETTLEMENT_TYPE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
            required
          />
          <FormSelect
            label={typeCode === 1 ? "delivery_agent_id" : "shipping_company_id"}
            value={partyId}
            onValueChange={setPartyId}
            options={partyOptions}
            placeholder={typeCode === 1 ? "اختر المندوب..." : "اختر الشركة..."}
            required
          />
          <FormInput label="period_from" type="date" value={periodFrom} onChange={(e) => setPeriodFrom(e.target.value)} required />
          <FormInput label="period_to" type="date" value={periodTo} onChange={(e) => setPeriodTo(e.target.value)} required />
        </div>

        <FormTextarea label="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="ملاحظات اختيارية..." />

        <div className="rounded-2xl border border-border bg-muted/20 p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold">التحصيلات المؤهلة ({eligible.length})</p>
            <p className="text-xs text-muted-foreground">
              الصافي: <span className="font-bold tabular-nums text-primary">{formatAmount(totals.net)} ج.م</span>
              <span className="mx-1">·</span>
              {totals.count} عملية
            </p>
          </div>

          {eligible.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {partyId ? "لا توجد تحصيلات غير مسوّاة في هذه الفترة" : "اختر الطرف والفترة لعرض التحصيلات"}
            </p>
          ) : (
            <div className="max-h-56 space-y-2 overflow-y-auto">
              {eligible.map((item) => (
                <label
                  key={item.collection_id}
                  className="flex cursor-pointer items-start gap-3 rounded-xl border border-border/70 bg-background p-3 text-sm hover:bg-muted/30"
                >
                  <Checkbox
                    checked={selected.has(item.collection_id)}
                    onCheckedChange={(checked) => {
                      setSelected((prev) => {
                        const next = new Set(prev);
                        if (checked) next.add(item.collection_id);
                        else next.delete(item.collection_id);
                        return next;
                      });
                    }}
                    className="mt-0.5"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-primary">{item.internal_code}</span>
                      <span className="text-xs text-muted-foreground">{collectionTypeLabel(item.collection_type)}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {item.agent_name} · {item.company_name}
                    </p>
                  </div>
                  <div className="text-end">
                    <p className="font-bold tabular-nums">{formatAmount(item.collected_amount)}</p>
                    <p className="text-[10px] tabular-nums text-muted-foreground">−{formatAmount(item.commission_amount)}</p>
                  </div>
                </label>
              ))}
            </div>
          )}

          <div className="mt-4 grid grid-cols-3 gap-3 border-t border-border pt-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">total_collections</p>
              <p className="font-bold tabular-nums">{formatAmount(totals.totalCollections)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">total_commissions</p>
              <p className="font-bold tabular-nums text-muted-foreground">−{formatAmount(totals.totalCommissions)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">net_amount</p>
              <p className="font-bold tabular-nums text-primary">{formatAmount(totals.net)} ج.م</p>
            </div>
          </div>
        </div>
      </div>
    </AdminDialogShell>
  );
}

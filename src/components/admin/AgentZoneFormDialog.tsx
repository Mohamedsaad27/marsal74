import { useEffect, useMemo, useState } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { AdminDialogShell } from "@/components/admin/AdminDialogShell";
import { FormSelect, FormSwitch } from "@/components/admin/AdminFormFields";
import { Button } from "@/components/ui/button";
import {
  AGENT_ZONE_AGENT_OPTIONS,
  AGENT_ZONE_GOVERNORATE_OPTIONS,
  getAgentZoneCityOptions,
} from "@/lib/admin/agent-zones-data";
import type { AgentZoneRecord, CreateAgentZonePayload } from "@/lib/admin/agent-zones-types";
import type { CrudMode } from "@/components/admin/use-admin-crud";

type FormState = {
  delivery_agent_id: string;
  governorate_id: string;
  city_id: string;
  is_primary: boolean;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: CrudMode;
  item: AgentZoneRecord | null;
  onSave: (payload: CreateAgentZonePayload & { zone_row_id?: number }) => Promise<void>;
  loading?: boolean;
};

function emptyForm(): FormState {
  const defaultGov = AGENT_ZONE_GOVERNORATE_OPTIONS[0]?.value ?? "";
  const defaultCity = getAgentZoneCityOptions(defaultGov)[0]?.value ?? "";
  return {
    delivery_agent_id: "",
    governorate_id: defaultGov,
    city_id: defaultCity,
    is_primary: false,
  };
}

export function AgentZoneFormDialog({ open, onOpenChange, mode, item, onSave, loading = false }: Props) {
  const [form, setForm] = useState<FormState>(emptyForm);

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && item) {
      setForm({
        delivery_agent_id: String(item.delivery_agent_id),
        governorate_id: String(item.governorate_id ?? ""),
        city_id: String(item.city_id ?? ""),
        is_primary: item.is_primary === 1,
      });
    } else {
      setForm(emptyForm());
    }
  }, [open, mode, item]);

  const cityOptions = useMemo(() => getAgentZoneCityOptions(form.governorate_id), [form.governorate_id]);

  const handleSave = async () => {
    if (!form.delivery_agent_id || !form.governorate_id || !form.city_id) return;
    await onSave({
      delivery_agent_id: Number(form.delivery_agent_id),
      governorate_id: Number(form.governorate_id),
      city_id: Number(form.city_id),
      is_primary: form.is_primary ? 1 : 0,
      zone_row_id: item?.zone_row_id,
    });
  };

  return (
    <AdminDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title={mode === "edit" ? "تعديل منطقة مندوب" : "إضافة منطقة مندوب"}
      description="agent_zones — ربط المندوب بالمحافظة والمدينة"
      icon={MapPin}
      badge={item?.agent_zone_id ?? "new"}
      size="lg"
      footer={
        <>
          <Button className="rounded-xl gradient-brand px-6 shadow-glow" onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
            حفظ
          </Button>
          <Button variant="outline" className="rounded-xl px-5" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
        </>
      }
    >
      <div className="grid gap-4">
        {mode === "edit" && item ? (
          <div className="rounded-xl border border-border/70 bg-muted/20 p-3 text-sm">
            <p className="text-xs font-bold text-muted-foreground">delivery_agent_id</p>
            <p className="mt-1 font-semibold">{item.delivery_agent_name}</p>
          </div>
        ) : (
          <FormSelect
            label="delivery_agent_id"
            value={form.delivery_agent_id}
            onValueChange={(v) => setForm((prev) => ({ ...prev, delivery_agent_id: v }))}
            options={AGENT_ZONE_AGENT_OPTIONS}
            placeholder="اختر المندوب..."
            required
          />
        )}
        <FormSelect
          label="governorate_id"
          value={form.governorate_id}
          onValueChange={(v) => {
            const firstCity = getAgentZoneCityOptions(v)[0]?.value ?? "";
            setForm((prev) => ({ ...prev, governorate_id: v, city_id: firstCity }));
          }}
          options={AGENT_ZONE_GOVERNORATE_OPTIONS}
          required
        />
        <FormSelect
          label="city_id"
          value={form.city_id}
          onValueChange={(v) => setForm((prev) => ({ ...prev, city_id: v }))}
          options={cityOptions}
          placeholder={cityOptions.length ? "اختر المدينة..." : "لا توجد مدن"}
          required
        />
        <FormSwitch
          label="is_primary — منطقة أساسية"
          checked={form.is_primary}
          onCheckedChange={(v) => setForm((prev) => ({ ...prev, is_primary: v }))}
        />
      </div>
    </AdminDialogShell>
  );
}

import { useEffect, useMemo, useState } from "react";
import { Loader2, MapPin, Plus, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminDialogShell } from "@/components/admin/AdminDialogShell";
import { FormSelect, FormSwitch } from "@/components/admin/AdminFormFields";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MOCK_CITIES, MOCK_GOVERNORATES } from "@/lib/admin/mock-data";
import type { AgentZone, DeliveryAgent } from "@/lib/admin/delivery-agents-types";
import { cn } from "@/lib/utils";

type ZoneDraft = Omit<AgentZone, "id" | "delivery_agent_id"> & { id?: number };

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent: DeliveryAgent | null;
  onSave: (zones: AgentZone[]) => Promise<void>;
  loading?: boolean;
};

function emptyZone(): ZoneDraft {
  const governorate = MOCK_GOVERNORATES[0];
  const city = MOCK_CITIES.find((item) => item.governorate_id === governorate.id) ?? MOCK_CITIES[0];
  return {
    governorate_id: governorate.id,
    governorate_name: governorate.name_ar,
    city_id: city.id,
    city_name: city.name_ar,
    is_primary: 0,
  };
}

export function AgentZonesDialog({ open, onOpenChange, agent, onSave, loading = false }: Props) {
  const [zones, setZones] = useState<ZoneDraft[]>([]);

  useEffect(() => {
    if (!open || !agent) return;
    setZones(
      agent.zones.length > 0
        ? agent.zones.map(({ id, delivery_agent_id: _agentId, ...rest }) => ({ id, ...rest }))
        : [{ ...emptyZone(), is_primary: 1 }],
    );
  }, [open, agent]);

  const updateZone = (index: number, patch: Partial<ZoneDraft>) => {
    setZones((prev) => prev.map((zone, i) => (i === index ? { ...zone, ...patch } : zone)));
  };

  const setPrimaryZone = (index: number) => {
    setZones((prev) => prev.map((zone, i) => ({ ...zone, is_primary: i === index ? 1 : 0 })));
  };

  const addZone = () => setZones((prev) => [...prev, emptyZone()]);

  const removeZone = (index: number) => {
    setZones((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length === 0) return [{ ...emptyZone(), is_primary: 1 }];
      if (!next.some((zone) => zone.is_primary === 1)) next[0] = { ...next[0], is_primary: 1 };
      return next;
    });
  };

  const cityOptionsFor = (governorateId: number) =>
    MOCK_CITIES.filter((city) => city.governorate_id === governorateId).map((city) => ({
      value: String(city.id),
      label: city.name_ar,
    }));

  const handleSave = async () => {
    if (!agent) return;
    if (zones.some((zone) => !zone.city_id || !zone.governorate_id)) {
      toast.error("يرجى اختيار المحافظة والمدينة لكل منطقة");
      return;
    }

    const normalized: AgentZone[] = zones.map((zone, index) => ({
      id: zone.id ?? 0,
      delivery_agent_id: agent.id,
      governorate_id: zone.governorate_id,
      governorate_name: zone.governorate_name,
      city_id: zone.city_id,
      city_name: zone.city_name,
      is_primary: zones.some((item) => item.is_primary === 1) ? zone.is_primary : index === 0 ? 1 : 0,
    }));

    await onSave(normalized);
  };

  const governorateOptions = useMemo(
    () => MOCK_GOVERNORATES.map((governorate) => ({ value: String(governorate.id), label: governorate.name_ar })),
    [],
  );

  return (
    <AdminDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title={agent ? `مناطق ${agent.name}` : "مناطق التوصيل"}
      description="تحديد المحافظات والمدن التي يغطيها المندوب"
      icon={MapPin}
      badge={`${zones.length} منطقة`}
      size="xl"
      footer={
        <>
          <Button className="rounded-xl gradient-brand px-6 shadow-glow" onClick={handleSave} disabled={loading || !agent}>
            {loading && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
            حفظ المناطق
          </Button>
          <Button variant="outline" className="rounded-xl px-5" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {zones.map((zone, index) => (
          <section
            key={index}
            className={cn(
              "rounded-2xl border p-4 shadow-soft",
              zone.is_primary === 1 ? "border-primary/30 bg-primary/5" : "border-border/70 bg-card",
            )}
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <h3 className="font-bold">المنطقة {index + 1}</h3>
                {zone.is_primary === 1 && (
                  <Badge className="rounded-md text-[10px]">
                    <Star className="ms-1 h-3 w-3" />
                    أساسية
                  </Badge>
                )}
              </div>
              <div className="flex gap-2">
                {zone.is_primary !== 1 && (
                  <Button type="button" variant="outline" size="sm" className="rounded-lg text-xs" onClick={() => setPrimaryZone(index)}>
                    تعيين كأساسية
                  </Button>
                )}
                {zones.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeZone(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormSelect
                label="المحافظة"
                value={String(zone.governorate_id)}
                onValueChange={(value) => {
                  const governorate = MOCK_GOVERNORATES.find((item) => String(item.id) === value);
                  const firstCity = MOCK_CITIES.find((city) => city.governorate_id === Number(value));
                  updateZone(index, {
                    governorate_id: Number(value),
                    governorate_name: governorate?.name_ar ?? "",
                    city_id: firstCity?.id ?? 0,
                    city_name: firstCity?.name_ar ?? "",
                  });
                }}
                options={governorateOptions}
                required
              />
              <FormSelect
                label="المدينة"
                value={String(zone.city_id)}
                onValueChange={(value) => {
                  const city = MOCK_CITIES.find((item) => String(item.id) === value);
                  updateZone(index, { city_id: Number(value), city_name: city?.name_ar ?? "" });
                }}
                options={cityOptionsFor(zone.governorate_id)}
                required
              />
              <FormSwitch
                label="منطقة أساسية"
                checked={zone.is_primary === 1}
                onCheckedChange={(checked) => (checked ? setPrimaryZone(index) : updateZone(index, { is_primary: 0 }))}
              />
            </div>
          </section>
        ))}

        <Button type="button" variant="outline" className="w-full rounded-xl border-dashed" onClick={addZone}>
          <Plus className="ms-2 h-4 w-4" />
          إضافة منطقة أخرى
        </Button>
      </div>
    </AdminDialogShell>
  );
}

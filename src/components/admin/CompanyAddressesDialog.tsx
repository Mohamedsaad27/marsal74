import { useEffect, useState } from "react";
import { Loader2, MapPin, Plus, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminDialogShell } from "@/components/admin/AdminDialogShell";
import { FormInput, FormSelect, FormSwitch } from "@/components/admin/AdminFormFields";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MOCK_CITY_OPTIONS } from "@/lib/admin/mock-data";
import type { CompanyAddress, ShippingCompany } from "@/lib/admin/shipping-companies-types";
import { cn } from "@/lib/utils";

type AddressDraft = Omit<CompanyAddress, "id" | "company_id"> & { id?: number };

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company: ShippingCompany | null;
  onSave: (addresses: CompanyAddress[]) => Promise<void>;
  loading?: boolean;
};

function emptyAddress(): AddressDraft {
  return {
    city_id: Number(MOCK_CITY_OPTIONS[0]?.value ?? 1),
    city_name: MOCK_CITY_OPTIONS[0]?.label ?? "",
    address_line: "",
    landmark: "",
    street: "",
    building_number: "",
    floor_number: "",
    apartment_number: "",
    is_default: 0,
  };
}

export function CompanyAddressesDialog({ open, onOpenChange, company, onSave, loading = false }: Props) {
  const [addresses, setAddresses] = useState<AddressDraft[]>([]);

  useEffect(() => {
    if (!open || !company) return;
    setAddresses(
      company.addresses.length > 0
        ? company.addresses.map(({ id, company_id: _companyId, ...rest }) => ({ id, ...rest }))
        : [emptyAddress()],
    );
  }, [open, company]);

  const updateAddress = (index: number, patch: Partial<AddressDraft>) => {
    setAddresses((prev) => prev.map((address, i) => (i === index ? { ...address, ...patch } : address)));
  };

  const setDefaultAddress = (index: number) => {
    setAddresses((prev) => prev.map((address, i) => ({ ...address, is_default: i === index ? 1 : 0 })));
  };

  const addAddress = () => setAddresses((prev) => [...prev, emptyAddress()]);

  const removeAddress = (index: number) => {
    setAddresses((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length === 0) return [emptyAddress()];
      if (!next.some((address) => address.is_default === 1)) {
        next[0] = { ...next[0], is_default: 1 };
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (!company) return;

    const invalid = addresses.some((address) => !address.address_line.trim() || !address.city_name.trim());
    if (invalid) {
      toast.error("يرجى إكمال العنوان والمدينة لكل سجل");
      return;
    }

    const normalized: CompanyAddress[] = addresses.map((address, index) => ({
      id: address.id ?? 0,
      company_id: company.id,
      city_id: address.city_id,
      city_name: address.city_name,
      address_line: address.address_line.trim(),
      landmark: address.landmark?.trim(),
      street: address.street?.trim(),
      building_number: address.building_number?.trim(),
      floor_number: address.floor_number?.trim(),
      apartment_number: address.apartment_number?.trim(),
      is_default: addresses.some((item) => item.is_default === 1) ? address.is_default : index === 0 ? 1 : 0,
    }));

    await onSave(normalized);
  };

  return (
    <AdminDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title={company ? `عناوين ${company.company_name}` : "عناوين الشركة"}
      description="إدارة عناوين الشركة وتحديد العنوان الافتراضي"
      icon={MapPin}
      badge={`${addresses.length} عنوان`}
      size="xl"
      footer={
        <>
          <Button className="rounded-xl gradient-brand px-6 shadow-glow" onClick={handleSave} disabled={loading || !company}>
            {loading && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
            حفظ العناوين
          </Button>
          <Button variant="outline" className="rounded-xl px-5" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {addresses.map((address, index) => (
          <section
            key={index}
            className={cn(
              "rounded-2xl border p-4 shadow-soft",
              address.is_default === 1 ? "border-primary/30 bg-primary/5" : "border-border/70 bg-card",
            )}
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <h3 className="font-bold">العنوان {index + 1}</h3>
                {address.is_default === 1 && (
                  <Badge className="rounded-md text-[10px]">
                    <Star className="ms-1 h-3 w-3" />
                    افتراضي
                  </Badge>
                )}
              </div>
              <div className="flex gap-2">
                {address.is_default !== 1 && (
                  <Button type="button" variant="outline" size="sm" className="rounded-lg text-xs" onClick={() => setDefaultAddress(index)}>
                    تعيين كافتراضي
                  </Button>
                )}
                {addresses.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeAddress(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormSelect
                label="المدينة"
                value={String(address.city_id)}
                onValueChange={(value) => {
                  const city = MOCK_CITY_OPTIONS.find((option) => option.value === value);
                  updateAddress(index, { city_id: Number(value), city_name: city?.label ?? "" });
                }}
                options={MOCK_CITY_OPTIONS}
                required
              />
              <FormInput
                label="سطر العنوان"
                required
                value={address.address_line}
                onChange={(e) => updateAddress(index, { address_line: e.target.value })}
              />
              <FormInput label="علامة مميزة" value={address.landmark ?? ""} onChange={(e) => updateAddress(index, { landmark: e.target.value })} />
              <FormInput label="الشارع" value={address.street ?? ""} onChange={(e) => updateAddress(index, { street: e.target.value })} />
              <FormInput label="رقم المبنى" value={address.building_number ?? ""} onChange={(e) => updateAddress(index, { building_number: e.target.value })} />
              <FormInput label="الدور" value={address.floor_number ?? ""} onChange={(e) => updateAddress(index, { floor_number: e.target.value })} />
              <FormInput label="الشقة" value={address.apartment_number ?? ""} onChange={(e) => updateAddress(index, { apartment_number: e.target.value })} />
              <FormSwitch
                label="عنوان افتراضي"
                checked={address.is_default === 1}
                onCheckedChange={(checked) => (checked ? setDefaultAddress(index) : updateAddress(index, { is_default: 0 }))}
              />
            </div>
          </section>
        ))}

        <Button type="button" variant="outline" className="w-full rounded-xl border-dashed" onClick={addAddress}>
          <Plus className="ms-2 h-4 w-4" />
          إضافة عنوان آخر
        </Button>
      </div>
    </AdminDialogShell>
  );
}

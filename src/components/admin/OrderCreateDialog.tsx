import { useEffect, useState } from "react";
import { PackagePlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AdminDialogShell } from "@/components/admin/AdminDialogShell";
import { FormInput, FormSelect, FormTextarea } from "@/components/admin/AdminFormFields";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { COMPANY_OPTIONS, ZONE_OPTIONS } from "@/lib/admin/orders-data";
import type { CreateOrderPayload } from "@/lib/admin/orders-types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (payload: CreateOrderPayload) => Promise<void>;
  loading?: boolean;
};

export function OrderCreateDialog({ open, onOpenChange, onSave, loading = false }: Props) {
  const [referenceNo, setReferenceNo] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [phoneAlt, setPhoneAlt] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [amount, setAmount] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [quantity, setQuantity] = useState("1");

  useEffect(() => {
    if (!open) {
      setReferenceNo("");
      setCompanyId("");
      setCustomerName("");
      setCustomerPhone("");
      setPhoneAlt("");
      setZoneId("");
      setAddressLine("");
      setAmount("");
      setItemDescription("");
      setQuantity("1");
    }
  }, [open]);

  const selectedZone = ZONE_OPTIONS.find((zone) => zone.value === zoneId);

  const handleSave = async () => {
    if (!referenceNo.trim() || !companyId || !customerName.trim() || !customerPhone.trim() || !zoneId || !addressLine.trim() || !amount.trim()) {
      toast.error("يرجى إكمال الحقول المطلوبة");
      return;
    }

    const parsedAmount = Number(amount);
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("المبلغ غير صالح");
      return;
    }

    await onSave({
      reference_no: referenceNo.trim(),
      shipping_company_id: companyId,
      customer_name: customerName.trim(),
      customer_phone: customerPhone.trim(),
      phone_alt: phoneAlt.trim() || undefined,
      governorate_id: selectedZone?.governorate ?? "",
      city_id: zoneId,
      address_line: addressLine.trim(),
      original_amount: parsedAmount,
      item_description: itemDescription.trim() || undefined,
      total_quantity: Number(quantity) || 1,
    });
  };

  return (
    <AdminDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title="إنشاء طلب يدوي"
      description="إدخال بيانات الطلب في جداول orders و order_customer_info و order_addresses و order_financials و order_items"
      icon={PackagePlus}
      badge="orders + child tables"
      size="xl"
      footer={
        <>
          <Button className="rounded-xl gradient-brand px-6 shadow-glow" onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
            حفظ الطلب
          </Button>
          <Button variant="outline" className="rounded-xl px-5" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <section className="rounded-2xl border border-border/70 bg-card p-4 shadow-soft">
          <h3 className="mb-4 font-bold">orders</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput label="reference_no" required value={referenceNo} onChange={(e) => setReferenceNo(e.target.value)} placeholder="REF-91205" />
            <FormSelect
              label="shipping_company_id"
              required
              value={companyId}
              onValueChange={setCompanyId}
              options={COMPANY_OPTIONS}
              placeholder="اختر الشركة"
            />
          </div>
        </section>

        <section className="rounded-2xl border border-border/70 bg-card p-4 shadow-soft">
          <h3 className="mb-4 font-bold">order_customer_info</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput label="customer_name" required value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
            <FormInput label="customer_phone" required value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} dir="ltr" />
            <FormInput label="phone_alt" value={phoneAlt} onChange={(e) => setPhoneAlt(e.target.value)} dir="ltr" />
          </div>
        </section>

        <section className="rounded-2xl border border-border/70 bg-card p-4 shadow-soft">
          <h3 className="mb-4 font-bold">order_addresses</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormSelect
              label="city_id / governorate_id"
              required
              value={zoneId}
              onValueChange={setZoneId}
              options={ZONE_OPTIONS.map((zone) => ({ value: zone.value, label: zone.label }))}
              placeholder="اختر المنطقة"
            />
            <FormTextarea label="address_line" required value={addressLine} onChange={(e) => setAddressLine(e.target.value)} rows={2} />
          </div>
        </section>

        <Separator />

        <section className="rounded-2xl border border-border/70 bg-card p-4 shadow-soft">
          <h3 className="mb-4 font-bold">order_financials + order_items</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput label="original_amount" required value={amount} onChange={(e) => setAmount(e.target.value)} dir="ltr" placeholder="0.00" />
            <FormInput label="total_quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} dir="ltr" />
            <div className="sm:col-span-2">
              <FormTextarea label="item_description" value={itemDescription} onChange={(e) => setItemDescription(e.target.value)} rows={2} />
            </div>
          </div>
        </section>
      </div>
    </AdminDialogShell>
  );
}

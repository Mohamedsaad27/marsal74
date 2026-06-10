import { useEffect, useState } from "react";
import { Building2, Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { AdminDialogShell } from "@/components/admin/AdminDialogShell";
import { FormInput, FormSelect } from "@/components/admin/AdminFormFields";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { CreateShippingCompanyPayload, CommissionType } from "@/lib/admin/shipping-companies-types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (payload: CreateShippingCompanyPayload) => Promise<void>;
  loading?: boolean;
};

export function CompanyCreateDialog({ open, onOpenChange, onSave, loading = false }: Props) {
  const [companyName, setCompanyName] = useState("");
  const [commercialReg, setCommercialReg] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [commissionType, setCommissionType] = useState<CommissionType>(1);
  const [commissionValue, setCommissionValue] = useState("");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!open) {
      setCompanyName("");
      setCommercialReg("");
      setContactPhone("");
      setContactEmail("");
      setCommissionType(1);
      setCommissionValue("");
      setUserName("");
      setUserEmail("");
      setUserPhone("");
      setPassword("");
    }
  }, [open]);

  const handleSave = async () => {
    if (!companyName.trim() || !commercialReg.trim() || !userName.trim() || !userEmail.trim() || !password.trim()) {
      toast.error("يرجى إكمال الحقول المطلوبة");
      return;
    }

    const value = Number(commissionValue);
    if (!commissionValue || Number.isNaN(value) || value <= 0) {
      toast.error("قيمة العمولة غير صالحة");
      return;
    }

    await onSave({
      company_name: companyName.trim(),
      commercial_reg: commercialReg.trim(),
      contact_phone: contactPhone.trim(),
      contact_email: contactEmail.trim(),
      commission_type: commissionType,
      commission_value: value,
      user_account: {
        name: userName.trim(),
        email: userEmail.trim(),
        phone: userPhone.trim(),
      },
      password,
    });
  };

  return (
    <AdminDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title="إضافة شركة شحن"
      description="إنشاء شركة جديدة مع حساب مستخدم للدخول إلى المنصة"
      icon={Building2}
      badge="شركة + حساب"
      size="xl"
      footer={
        <>
          <Button className="rounded-xl gradient-brand px-6 shadow-glow" onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
            إنشاء الشركة والحساب
          </Button>
          <Button variant="outline" className="rounded-xl px-5" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <section className="rounded-2xl border border-border/70 bg-card p-4 shadow-soft">
          <div className="mb-4 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            <h3 className="font-bold">بيانات الشركة</h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput label="اسم الشركة" required value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
            <FormInput
              label="السجل التجاري"
              required
              value={commercialReg}
              onChange={(e) => setCommercialReg(e.target.value)}
              dir="ltr"
              className="font-mono"
            />
            <FormInput
              label="هاتف الشركة"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              dir="ltr"
              className="tabular-nums"
            />
            <FormInput
              label="بريد الشركة"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              dir="ltr"
            />
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
        </section>

        <Separator />

        <section className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
          <div className="mb-4 flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-primary" />
            <h3 className="font-bold">حساب المستخدم (مدير الشركة)</h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput label="اسم المسؤول" required value={userName} onChange={(e) => setUserName(e.target.value)} />
            <FormInput
              label="البريد الإلكتروني"
              type="email"
              required
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              dir="ltr"
            />
            <FormInput
              label="رقم الهاتف"
              value={userPhone}
              onChange={(e) => setUserPhone(e.target.value)}
              dir="ltr"
              className="tabular-nums"
            />
            <FormInput
              label="كلمة المرور"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              dir="ltr"
            />
          </div>
        </section>
      </div>
    </AdminDialogShell>
  );
}

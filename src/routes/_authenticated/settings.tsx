import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/Logo";
import { toast } from "sonner";
import { settingsApi } from "../../lib/admin/settings.api";
import { useRef } from "react";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    platform_name: "",
    org_name: "",
    commercial_reg: "",
    official_email: "",
    contact_phone: "",
    address: "",
  });

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      setLoading(true);

      const res = await settingsApi.get();

      setForm({
        platform_name: res.data.identity.platform_name ?? "",
        org_name: res.data.organization.org_name ?? "",
        commercial_reg: res.data.organization.commercial_reg ?? "",
        official_email: res.data.organization.official_email ?? "",
        contact_phone: res.data.organization.contact_phone ?? "",
        address: res.data.organization.address ?? "",
      });

      setLogoUrl(res.data.identity.logo_url);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      setSaving(true);

      const formData = new FormData();

      formData.append("platform_name", form.platform_name);
      formData.append("org_name", form.org_name);
      formData.append("commercial_reg", form.commercial_reg);
      formData.append("official_email", form.official_email);
      formData.append("contact_phone", form.contact_phone);
      formData.append("address", form.address);

      if (logoFile) {
        formData.append("logo_url", logoFile);
      }

      const res = await settingsApi.update(formData);

      toast.success(res.message);

      await loadSettings();
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center py-20">جاري تحميل البيانات...</div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">الإعدادات</h1>

        <p className="mt-1 text-sm text-muted-foreground">تخصيص ملف منشأتك وتفضيلات النظام</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft lg:col-span-2">
          <h3 className="text-base font-bold">معلومات المنشأة</h3>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>اسم المنصة</Label>
              <Input
                value={form.platform_name}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    platform_name: e.target.value,
                  }))
                }
                className="h-11 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label>اسم المنشأة</Label>
              <Input
                value={form.org_name}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    org_name: e.target.value,
                  }))
                }
                className="h-11 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label>السجل التجاري</Label>
              <Input
                value={form.commercial_reg}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    commercial_reg: e.target.value,
                  }))
                }
                className="h-11 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label>البريد الرسمي</Label>
              <Input
                type="email"
                value={form.official_email}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    official_email: e.target.value,
                  }))
                }
                className="h-11 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label>رقم التواصل</Label>
              <Input
                value={form.contact_phone}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    contact_phone: e.target.value,
                  }))
                }
                className="h-11 rounded-xl"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label>العنوان</Label>
              <Input
                value={form.address}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    address: e.target.value,
                  }))
                }
                className="h-11 rounded-xl"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" className="rounded-xl" onClick={loadSettings}>
              إعادة تعيين
            </Button>

            <Button
              onClick={handleSave}
              disabled={saving}
              className="rounded-xl gradient-brand shadow-glow"
            >
              {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h3 className="text-base font-bold">هوية المنصة</h3>

          <div className="mt-5 flex flex-col items-center gap-4 rounded-2xl bg-muted/40 p-6">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-20 w-auto object-contain" />
            ) : (
              <Logo className="h-20" />
            )}

            <p className="text-center text-xs text-muted-foreground">
              شعار المنصة — يُعرض في تطبيقات الويب والجوال
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];

              if (!file) return;

              setLogoFile(file);
              setLogoUrl(URL.createObjectURL(file));
            }}
          />

          <Button
            variant="outline"
            className="mt-4 w-full rounded-xl"
            onClick={() => fileInputRef.current?.click()}
          >
            تحديث الشعار
          </Button>
        </div>
      </div>
    </AppShell>
  );
}

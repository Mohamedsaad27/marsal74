import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/Logo";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
});

function SettingsPage() {
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
            <div className="space-y-1.5"><Label>اسم المنشأة</Label><Input defaultValue="مرسال للخدمات اللوجستية" className="h-11 rounded-xl" /></div>
            <div className="space-y-1.5"><Label>السجل التجاري</Label><Input defaultValue="1010234567" className="h-11 rounded-xl" /></div>
            <div className="space-y-1.5"><Label>البريد الرسمي</Label><Input defaultValue="ops@mursal.sa" className="h-11 rounded-xl" /></div>
            <div className="space-y-1.5"><Label>رقم التواصل</Label><Input defaultValue="0112345678" className="h-11 rounded-xl" /></div>
            <div className="space-y-1.5 sm:col-span-2"><Label>العنوان</Label><Input defaultValue="الرياض، حي العليا، طريق الملك فهد" className="h-11 rounded-xl" /></div>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" className="rounded-xl">إلغاء</Button>
            <Button className="rounded-xl gradient-brand shadow-glow">حفظ التغييرات</Button>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h3 className="text-base font-bold">هوية المنصة</h3>
          <div className="mt-5 flex flex-col items-center gap-4 rounded-2xl bg-muted/40 p-6">
            <Logo className="h-20" />
            <p className="text-xs text-muted-foreground text-center">شعار مرسال — يُعرض في تطبيقات الويب والجوال</p>
          </div>
          <Button variant="outline" className="mt-4 w-full rounded-xl">تحديث الشعار</Button>
        </div>
      </div>
    </AppShell>
  );
}

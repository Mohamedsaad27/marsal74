import { createFileRoute } from "@tanstack/react-router";
import {
  Home,
  Package,
  MapPin,
  User,
  Bell,
  ChevronLeft,
  CheckCircle2,
  Truck,
  QrCode,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";

export const Route = createFileRoute("/_authenticated/mobile")({
  component: MobilePreview,
});

function MobilePreview() {
  return (
    <div
      dir="rtl"
      className="min-h-screen bg-gradient-to-br from-[oklch(0.95_0.02_265)] to-[oklch(0.9_0.04_265)] px-6 py-12"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <Logo variant="wordmark" className="mx-auto justify-center" />
          <h1 className="mt-6 text-3xl font-extrabold">تطبيق المندوب</h1>
          <p className="mt-2 text-muted-foreground">شاشات تطبيق الجوال الخاص بالمناديب</p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <Phone label="الرئيسية">
            <HomeScreen />
          </Phone>
          <Phone label="تفاصيل الشحنة">
            <ShipmentScreen />
          </Phone>
          <Phone label="الملف الشخصي">
            <ProfileScreen />
          </Phone>
        </div>
      </div>
    </div>
  );
}

function Phone({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative h-[640px] w-[310px] rounded-[40px] border-[10px] border-[oklch(0.15_0.02_265)] bg-background shadow-elevated overflow-hidden">
        <div className="absolute left-1/2 top-2 z-20 h-5 w-24 -translate-x-1/2 rounded-full bg-[oklch(0.15_0.02_265)]" />
        <div className="h-full overflow-y-auto">{children}</div>
      </div>
      <p className="mt-4 text-sm font-semibold text-muted-foreground">{label}</p>
    </div>
  );
}

function HomeScreen() {
  return (
    <div className="flex h-full flex-col">
      <div className="gradient-brand px-5 pb-8 pt-12 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs opacity-80">مرحباً</p>
            <p className="text-lg font-bold">خالد العتيبي</p>
          </div>
          <button className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-warning" />
          </button>
        </div>
        <div className="mt-5 rounded-2xl bg-white/15 p-4 backdrop-blur">
          <p className="text-xs opacity-80">شحنات اليوم</p>
          <p className="mt-1 text-3xl font-extrabold">
            12 <span className="text-sm opacity-80">شحنة نشطة</span>
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-lg bg-white/15 py-2">
              <p className="font-bold text-base">8</p>
              <p className="opacity-80">منتظرة</p>
            </div>
            <div className="rounded-lg bg-white/15 py-2">
              <p className="font-bold text-base">3</p>
              <p className="opacity-80">جارية</p>
            </div>
            <div className="rounded-lg bg-white/15 py-2">
              <p className="font-bold text-base">1</p>
              <p className="opacity-80">مؤجلة</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 -mt-4 rounded-t-3xl bg-background p-5">
        <h3 className="text-sm font-bold">الشحنات القادمة</h3>
        <ul className="mt-3 space-y-3">
          {[
            { id: "SHP-2841", to: "حي العليا", price: "275" },
            { id: "SHP-2842", to: "حي الملقا", price: "180" },
            { id: "SHP-2843", to: "حي النخيل", price: "420" },
          ].map((s) => (
            <li key={s.id} className="rounded-2xl border border-border bg-card p-3 shadow-soft">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-primary">#{s.id}</span>
                <span className="rounded-full bg-info/10 px-2 py-0.5 text-[10px] font-bold text-info">
                  قيد التوصيل
                </span>
              </div>
              <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {s.to}
              </p>
              <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
                <span className="text-sm font-bold">{s.price} ر.س</span>
                <button className="rounded-lg gradient-brand px-3 py-1 text-[11px] font-bold text-white">
                  عرض
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <BottomNav active="home" />
    </div>
  );
}

function ShipmentScreen() {
  return (
    <div className="flex h-full flex-col">
      <div className="gradient-brand px-5 pb-6 pt-12 text-white">
        <div className="flex items-center justify-between">
          <ChevronLeft className="h-6 w-6 rotate-180" />
          <p className="font-bold">تفاصيل الشحنة</p>
          <div className="w-6" />
        </div>
        <div className="mt-5 text-center">
          <p className="font-mono text-xs opacity-80">#SHP-2841</p>
          <p className="mt-1 text-2xl font-extrabold">275.00 ر.س</p>
          <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs backdrop-blur">
            <Truck className="h-3 w-3" /> قيد التوصيل
          </span>
        </div>
      </div>

      <div className="flex-1 space-y-4 p-5">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
          <p className="text-[11px] font-semibold text-muted-foreground">العميل</p>
          <p className="mt-1 font-bold">سارة الحربي</p>
          <p className="mt-0.5 text-xs text-muted-foreground">0555-1024</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
          <p className="text-[11px] font-semibold text-muted-foreground">العنوان</p>
          <p className="mt-1 flex items-start gap-1.5 text-sm">
            <MapPin className="mt-0.5 h-4 w-4 text-primary" />
            الرياض، حي العليا، شارع التحلية، مبنى 142
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
          <p className="text-[11px] font-semibold text-muted-foreground">مراحل التوصيل</p>
          <div className="mt-3 space-y-3">
            {[
              { t: "تم الاستلام", time: "09:12", done: true },
              { t: "في الطريق", time: "10:05", done: true },
              { t: "قرب العميل", time: "—", done: false },
              { t: "تم التسليم", time: "—", done: false },
            ].map((m, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle2
                  className={`h-5 w-5 ${m.done ? "text-success" : "text-muted-foreground/40"}`}
                />
                <div className="flex-1">
                  <p className={`text-sm ${m.done ? "font-semibold" : "text-muted-foreground"}`}>
                    {m.t}
                  </p>
                </div>
                <span className="text-[11px] text-muted-foreground">{m.time}</span>
              </div>
            ))}
          </div>
        </div>

        <button className="flex w-full items-center justify-center gap-2 rounded-2xl gradient-brand py-3.5 font-bold text-white shadow-glow">
          <QrCode className="h-5 w-5" /> تأكيد التسليم
        </button>
      </div>
    </div>
  );
}

function ProfileScreen() {
  return (
    <div className="flex h-full flex-col">
      <div className="gradient-brand px-5 pb-16 pt-12 text-white text-center">
        <p className="text-sm opacity-80">الملف الشخصي</p>
        <div className="mx-auto mt-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 text-2xl font-extrabold backdrop-blur">
          خ
        </div>
        <p className="mt-3 text-lg font-bold">خالد العتيبي</p>
        <p className="text-xs opacity-80">مندوب — الرياض</p>
      </div>

      <div className="flex-1 -mt-10 rounded-t-3xl bg-background p-5">
        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            { l: "شحنات", v: "318" },
            { l: "التقييم", v: "4.9" },
            { l: "التحصيل", v: "12.4K" },
          ].map((s) => (
            <div key={s.l} className="rounded-2xl border border-border bg-card p-3 shadow-soft">
              <p className="text-lg font-extrabold">{s.v}</p>
              <p className="text-[11px] text-muted-foreground">{s.l}</p>
            </div>
          ))}
        </div>

        <ul className="mt-5 divide-y divide-border rounded-2xl border border-border bg-card shadow-soft">
          {["معلوماتي", "سجل الشحنات", "المحفظة", "الإشعارات", "المساعدة", "تسجيل الخروج"].map(
            (t) => (
              <li key={t} className="flex items-center justify-between p-4 text-sm font-semibold">
                {t} <ChevronLeft className="h-4 w-4 text-muted-foreground" />
              </li>
            ),
          )}
        </ul>
      </div>

      <BottomNav active="profile" />
    </div>
  );
}

function BottomNav({ active }: { active: string }) {
  const items = [
    { k: "home", l: "الرئيسية", i: Home },
    { k: "ship", l: "الشحنات", i: Package },
    { k: "map", l: "الخريطة", i: MapPin },
    { k: "profile", l: "حسابي", i: User },
  ];
  return (
    <div className="border-t border-border bg-card px-4 py-2">
      <div className="flex items-center justify-around">
        {items.map((it) => (
          <button
            key={it.k}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 ${active === it.k ? "text-primary" : "text-muted-foreground"}`}
          >
            <it.i className="h-5 w-5" />
            <span className="text-[10px] font-semibold">{it.l}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

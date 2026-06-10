import {
  BarChart3,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";

const features = [
  { icon: BarChart3, title: "تحليلات لحظية", desc: "مؤشرات أداء دقيقة للطلبات والتحصيلات" },
  { icon: ShieldCheck, title: "أمان مؤسسي", desc: "صلاحيات وأدوار مرنة لكل مستخدم" },
  { icon: Sparkles, title: "أتمتة تشغيلية", desc: "موافقات، تتبع، وتسويات في مكان واحد" },
];

const stats = [
  { value: "12K+", label: "شحنة شهرياً" },
  { value: "480+", label: "مندوب نشط" },
  { value: "99.2%", label: "نسبة التسليم" },
];

interface AuthPageLayoutProps {
  badge: string;
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthPageLayout({ badge, title, description, children, footer }: AuthPageLayoutProps) {
  return (
    <div dir="rtl" className="fixed inset-0 h-svh overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 lg:left-0 lg:right-[42%]">
        <div className="absolute -right-20 top-0 h-[420px] w-[420px] rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-[320px] w-[320px] rounded-full bg-info/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "linear-gradient(oklch(0.92 0.01 250) 1px, transparent 1px), linear-gradient(90deg, oklch(0.92 0.01 250) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="relative grid h-full min-h-0 lg:grid-cols-[1fr_1.05fr]">
        <div className="no-scrollbar flex h-full min-h-0 flex-col justify-center overflow-y-auto px-5 py-6 sm:px-8 lg:overflow-hidden lg:px-14 lg:py-8 xl:px-20">
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <Logo variant="wordmark" />
            <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold text-primary">
              لوحة الإدارة
            </span>
          </div>

          <div className="mx-auto w-full max-w-[420px]">
            <div className="hidden lg:block">
              <Logo variant="wordmark" />
            </div>

            <div className="mt-0 lg:mt-10">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-bold text-primary">
                <ShieldCheck className="h-3.5 w-3.5" />
                {badge}
              </span>
              <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-[2rem]">
                {title}
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
            </div>

            <div className="mt-8 rounded-2xl border border-border/80 bg-card/90 p-6 shadow-elevated backdrop-blur-sm sm:p-8">
              {children}
            </div>

            {footer}
          </div>
        </div>

        <div className="relative hidden h-full min-h-0 overflow-hidden gradient-brand lg:flex lg:flex-col">
          <div
            className="pointer-events-none absolute inset-0 opacity-25"
            style={{
              backgroundImage:
                "radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 65%, white 1px, transparent 1px)",
              backgroundSize: "56px 56px, 80px 80px",
            }}
          />
          <div className="pointer-events-none absolute -left-24 -top-24 h-[28rem] w-[28rem] rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -right-24 h-[24rem] w-[24rem] rounded-full bg-white/10 blur-3xl" />

          <div className="no-scrollbar relative flex h-full min-h-0 flex-col justify-between overflow-hidden p-10 xl:p-14">
            <div className="flex items-center justify-between">
              <Logo variant="wordmark" onDark />
            </div>

            <div className="my-8 max-w-lg">
              <h2 className="text-4xl font-extrabold leading-[1.15] tracking-tight text-white xl:text-[2.75rem]">
                منصة الشحن
                <br />
                <span className="text-white/90">الأذكى في المنطقة</span>
              </h2>
              <p className="mt-5 text-base leading-relaxed text-white/75">
                أدر الطلبات والمناديب وشركات الشحن والتحصيلات مع تتبع مباشر وتقارير تشغيلية جاهزة للقرار.
              </p>

              <div className="mt-8 grid grid-cols-3 gap-3">
                {stats.map((s) => (
                  <div
                    key={s.label}
                    className="rounded-2xl border border-white/15 bg-white/10 px-3 py-3 text-center backdrop-blur-md"
                  >
                    <p className="text-xl font-extrabold tabular-nums text-white">{s.value}</p>
                    <p className="mt-0.5 text-[10px] font-medium text-white/65">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-10 space-y-4">
                {features.map((f) => (
                  <div
                    key={f.title}
                    className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm transition-colors hover:bg-white/10"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 shadow-soft">
                      <f.icon className="h-5 w-5 text-white" strokeWidth={1.75} />
                    </div>
                    <div>
                      <p className="font-bold text-white">{f.title}</p>
                      <p className="mt-0.5 text-sm leading-snug text-white/65">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-white/50 xl:text-right">
              © 2026 مرسال. جميع الحقوق محفوظة.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

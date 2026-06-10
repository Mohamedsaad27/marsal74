import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { Package, Wallet, Scale, Truck, Building2, FileBarChart } from "lucide-react";

export const Route = createFileRoute("/reports/")({
  component: ReportsHubPage,
});

const reportCards = [
  { title: "تقرير الطلبات", desc: "حالات الشحن والتسليم", url: "/reports/shipments", icon: Package, tone: "bg-info/10 text-info" },
  { title: "تقرير التحصيلات", desc: "COD والعمولات", url: "/reports/collections", icon: Wallet, tone: "bg-success/10 text-success" },
  { title: "تقرير التسويات", desc: "تسويات المناديب والشركات", url: "/reports/settlements", icon: Scale, tone: "bg-warning/15 text-warning" },
  { title: "تقرير المناديب", desc: "الأداء والتوفر", url: "/reports/couriers", icon: Truck, tone: "bg-primary/10 text-primary" },
  { title: "تقرير شركات الشحن", desc: "الأرصدة والطلبات", url: "/reports/companies", icon: Building2, tone: "bg-accent text-accent-foreground" },
];

function ReportsHubPage() {
  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">التقارير</h1>
        <p className="mt-1 text-sm text-muted-foreground">تقارير تشغيلية ومالية — واجهة تصميمية</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reportCards.map((r) => (
          <Link
            key={r.url}
            to={r.url}
            className="group rounded-2xl border border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-elevated"
          >
            <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${r.tone}`}>
              <r.icon className="h-6 w-6" />
            </div>
            <h3 className="font-bold group-hover:text-primary">{r.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{r.desc}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 flex items-center gap-3 rounded-2xl border border-dashed border-border bg-muted/20 p-6 text-sm text-muted-foreground">
        <FileBarChart className="h-8 w-8 shrink-0 opacity-50" />
        <p>اختر تقريراً من القائمة أو من الشريط الجانبي. التصدير والفلاتر جاهزة للربط بالـ API.</p>
      </div>
    </AppShell>
  );
}

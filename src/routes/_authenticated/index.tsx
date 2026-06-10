import { createFileRoute } from "@tanstack/react-router";
import { Package, Truck, CheckCircle2, Wallet, MapPin, Clock } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { ShipmentsChart } from "@/components/dashboard/ShipmentsChart";
import { ShipmentsTable } from "@/components/dashboard/ShipmentsTable";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useDashboard } from "@/hooks/useDashboard";
export const Route = createFileRoute("/_authenticated/")({
  component: DashboardPage,
});

function DashboardPage() {
  const { user, hydrated } = useCurrentUser();
  const initial = hydrated ? (user?.name?.[0] ?? "") : "";
  const { summary, collections, performance, avgDelivery, topAgentsData, isLoading } =
    useDashboard();
  return (
    <AppShell>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">
            أهلاً، {hydrated ? (user?.name ?? "") : <span className="opacity-0">_</span>} 👋
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            هذه نظرة سريعة على أداء عملياتك اليوم —{" "}
            {new Date().toLocaleDateString("ar-SA", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button className="rounded-xl gradient-brand shadow-glow">+ شحنة جديدة</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="إجمالي الطلبات"
          value={(summary?.total_orders ?? 0).toLocaleString()}
          delta={summary?.total_orders_change_percent ?? 0}
          hint="مقارنة بالأمس"
          icon={Package}
          tone="primary"
        />

        <KpiCard
          label="قيد التوصيل"
          value={(summary?.in_delivery ?? 0).toLocaleString()}
          delta={0}
          hint={summary?.in_delivery_label ?? "نشطة الآن"}
          icon={Truck}
          tone="info"
        />

        <KpiCard
          label="تم تسليمها"
          value={(summary?.delivered_this_week ?? 0).toLocaleString()}
          delta={summary?.delivered_change_percent ?? 0}
          hint="هذا الأسبوع"
          icon={CheckCircle2}
          tone="success"
        />

        <KpiCard
          label="صافي مستحق للشركات"
          value={`${(summary?.net_balance_companies ?? 0).toLocaleString()} ج.م`}
          delta={summary?.net_balance_change_percent ?? 0}
          hint="هذا الشهر"
          icon={Wallet}
          tone="warning"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ShipmentsChart />
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-bold">أفضل المناديب</h3>
            <span className="text-xs text-muted-foreground">اليوم</span>
          </div>

          {isLoading ? (
            <div className="py-6 text-center text-sm text-muted-foreground">جاري التحميل...</div>
          ) : (
            <ul className="space-y-3">
              {topAgentsData?.map((agent) => (
                <li
                  key={agent.delivery_agent_id}
                  className="flex items-center gap-3 rounded-xl p-2 hover:bg-muted/40"
                >
                  <div className="relative">
                    {agent.avatar_url ? (
                      <img
                        src={agent.avatar_url}
                        alt={agent.name}
                        className="h-10 w-10 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-brand text-sm font-bold text-white">
                        {agent.name.charAt(0)}
                      </div>
                    )}

                    <span className="absolute -bottom-1 -left-1 flex h-5 w-5 items-center justify-center rounded-full bg-card text-[10px] font-bold text-primary ring-2 ring-card">
                      {agent.rank}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{agent.name}</p>

                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {agent.city}
                    </p>
                  </div>

                  <div className="text-left">
                    <p className="text-sm font-bold tabular-nums">{agent.shipments_today}</p>

                    <p className="text-[11px] text-muted-foreground">شحنة</p>
                  </div>
                </li>
              ))}

              {!topAgentsData?.length && (
                <li className="py-4 text-center text-sm text-muted-foreground">لا يوجد مناديب</li>
              )}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-info/10 text-info">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">متوسط زمن التوصيل</p>
              <p className="text-xl font-extrabold">
                {avgDelivery?.avg_hours ?? 0}
                <span className="text-sm font-medium text-muted-foreground"> ساعة</span>
              </p>
            </div>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full gradient-brand transition-all"
              style={{
                width: `${Math.min(Math.abs(avgDelivery?.change_percent ?? 0), 100)}%`,
              }}
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {avgDelivery?.comparison_label ?? "لا توجد بيانات للمقارنة"}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <p className="text-xs text-muted-foreground">معدل نجاح التوصيل</p>
          <p className="mt-1 text-3xl font-extrabold text-success">
            {performance?.success_rate ?? 0}%
          </p>

          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-success/10 p-2">
              <p className="text-sm font-bold text-success">{performance?.success_count ?? 0}</p>
              <p className="text-[10px] text-muted-foreground">ناجحة</p>
            </div>

            <div className="rounded-lg bg-warning/15 p-2">
              <p className="text-sm font-bold text-warning">{performance?.pending_count ?? 0}</p>
              <p className="text-[10px] text-muted-foreground">مؤجلة</p>
            </div>

            <div className="rounded-lg bg-destructive/10 p-2">
              <p className="text-sm font-bold text-destructive">{performance?.failed_count ?? 0}</p>
              <p className="text-[10px] text-muted-foreground">فاشلة</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-gradient-to-br from-primary to-[oklch(0.55_0.24_265)] p-5 text-primary-foreground shadow-glow">
          <p className="text-xs font-medium opacity-80">رصيد التحصيلات المستحقة</p>
          <p className="mt-1 text-3xl font-extrabold">
            {(collections?.total_pending ?? 0).toLocaleString()}
            <span className="text-base font-medium opacity-80">
              {" "}
              {collections?.currency ?? "ج.م"}
            </span>
          </p>
          <p className="mt-2 text-xs opacity-70">من {collections?.company_count ?? 0} شركة شحن</p>{" "}
          <Button className="mt-4 w-full rounded-xl bg-white/15 backdrop-blur hover:bg-white/25 text-white border-0">
            مراجعة التسويات
          </Button>
        </div>
      </div>

      <div className="mt-6">
        <ShipmentsTable />
      </div>
    </AppShell>
  );
}

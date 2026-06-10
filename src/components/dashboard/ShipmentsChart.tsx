import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useQuery } from "@tanstack/react-query";
import { getShipmentsChart } from "../../lib/admin/dashboard.ts";

export function ShipmentsChart() {
  const { data, isLoading } = useQuery({
    queryKey: ["shipments-chart", "week"],
    queryFn: () => getShipmentsChart("week"),
  });

  const chartData =
    data?.labels?.map((label, index) => ({
      day: label,
      delivered: data.delivered[index] ?? 0,
      pending: data.pending[index] ?? 0,
    })) ?? [];

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <p className="text-sm text-muted-foreground">جاري تحميل البيانات...</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-base font-bold">أداء الشحنات</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">الأسبوع الحالي</p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-primary" />
            تم التسليم
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-warning" />
            معلقة
          </span>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.55 0.24 265)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="oklch(0.55 0.24 265)" stopOpacity={0} />
              </linearGradient>

              <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.78 0.16 75)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="oklch(0.78 0.16 75)" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 250)" vertical={false} />

            <XAxis
              dataKey="day"
              stroke="oklch(0.5 0.03 260)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              reversed
            />

            <YAxis
              stroke="oklch(0.5 0.03 260)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              orientation="right"
            />

            <Tooltip
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                fontSize: 12,
                boxShadow: "var(--shadow-elevated)",
              }}
            />

            <Area
              type="monotone"
              dataKey="delivered"
              stroke="oklch(0.55 0.24 265)"
              strokeWidth={2.5}
              fill="url(#g1)"
            />

            <Area
              type="monotone"
              dataKey="pending"
              stroke="oklch(0.78 0.16 75)"
              strokeWidth={2}
              fill="url(#g2)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

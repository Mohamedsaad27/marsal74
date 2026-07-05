// reports-config/orders.config.tsx
import { Package, CheckCircle2, Clock, Banknote } from "lucide-react";
import { reportsApi } from "@/lib/admin/reportsApi";
import type { ReportConfig } from "@/lib/types/report-config";
import type { OrderItem, OrderSummary } from "@/lib/types/reports/orders";

// status.color from the API is "green" | "blue" | "orange" (extend if backend adds more)
const STATUS_TONE: Record<string, "success" | "primary" | "warning" | "info"> = {
  green: "success",
  blue: "primary",
  orange: "warning",
};

export const ordersReportConfig: ReportConfig<OrderItem, OrderSummary> = {
  title: "تقرير الطلبات",
  description: "ملخص حالات الشحن والتسليم حسب الفترة",
  tableName: "orders_report",
  queryKey: "orders-report",
  fetcher: reportsApi.orders,
  buildKpis: (s) => [
    { label: "إجمالي الطلبات", value: s.total_orders, icon: Package, tone: "primary" },
    { label: "تم التسليم", value: s.terminal_orders, icon: CheckCircle2, tone: "success" },
    { label: "قيد التنفيذ", value: s.pending_orders, icon: Clock, tone: "warning" },
    {
      label: "إجمالي المحصل",
      value: Number(s.total_collected_amount),
      icon: Banknote,
      tone: "info",
    },
  ],
  columns: [
    { key: "reference_code", label: "الكود" },
    { key: "company", label: "الشركة" },
    { key: "agent", label: "المندوب" },
    { key: "status", label: "الحالة" },
    { key: "amount", label: "المبلغ" },
    { key: "date", label: "التاريخ" },
  ],
  normaliseRow: (item) => ({
    reference_code: item.reference_code,
    company: item.company.name,
    agent: item.agent?.name ?? "—",
    status: item.status.label,
    amount: Number(item.financials.original_amount),
    date: item.created_at.slice(0, 10),
  }),
};

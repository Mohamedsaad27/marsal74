// reports-config/delivery-agents.config.tsx
import { Users, UserCheck, Wallet, Package } from "lucide-react";
import { reportsApi } from "@/lib/admin/reportsApi";
import type { ReportConfig } from "@/lib/types/report-config";
import type { DeliveryAgentItem, DeliveryAgentSummary } from "@/lib/types/reports/delivery-agents";

export const deliveryAgentsReportConfig: ReportConfig<DeliveryAgentItem, DeliveryAgentSummary> = {
  title: "تقرير مندوبي التوصيل",
  description: "أداء المناديب وأرصدتهم حسب الفترة",
  tableName: "delivery_agents_report",
  queryKey: "delivery-agents-report",
  fetcher: reportsApi.deliveryAgents,
  buildKpis: (s) => [
    { label: "إجمالي المناديب", value: s.total_agents, icon: Users, tone: "primary" },
    { label: "المتاحون", value: s.available_agents, icon: UserCheck, tone: "success" },
    {
      label: "إجمالي الرصيد",
      value: Number(s.total_balance),
      icon: Wallet,
      tone: "warning",
    },
    { label: "إجمالي الطلبات", value: s.total_orders, icon: Package, tone: "info" },
  ],
  columns: [
    { key: "name", label: "الاسم" },
    { key: "phone", label: "الهاتف" },
    { key: "orders", label: "الطلبات" },
    { key: "collected", label: "المحصل" },
    { key: "balance", label: "الرصيد" },
    { key: "status", label: "الحالة" },
  ],
  normaliseRow: (item) => ({
    name: item.name,
    phone: item.phone,
    orders: item.metrics.total_orders,
    collected: Number(item.metrics.total_collected_amount),
    balance: Number(item.balance),
    status: item.is_available ? "متاح" : "غير متاح",
  }),
};

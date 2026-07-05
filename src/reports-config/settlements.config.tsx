// reports-config/settlements.config.tsx
import { Wallet, Banknote, Percent, CheckCircle2 } from "lucide-react";
import { reportsApi } from "@/lib/admin/reportsApi";
import type { ReportConfig } from "@/lib/types/report-config";
import type { SettlementItem, SettlementSummary } from "@/lib/types/reports/settlements";

export const settlementsReportConfig: ReportConfig<SettlementItem, SettlementSummary> = {
  title: "تقرير التسويات",
  description: "ملخص التسويات المالية حسب الفترة",
  tableName: "settlements_report",
  queryKey: "settlements-report",
  fetcher: reportsApi.settlements,
  buildKpis: (s) => [
    { label: "إجمالي التسويات", value: s.total_settlements, icon: Wallet, tone: "primary" },
    {
      label: "إجمالي التحصيلات",
      value: s.total_collections,
      icon: Banknote,
      tone: "success",
    },
    {
      label: "إجمالي العمولات",
      value: s.total_commissions,
      icon: Percent,
      tone: "warning",
    },
    {
      label: "الصافي",
      value: s.net_amount,
      icon: CheckCircle2,
      tone: "info",
    },
  ],
  columns: [
    { key: "reference", label: "المرجع" },
    { key: "entity", label: "الجهة" },
    { key: "type", label: "النوع" },
    { key: "status", label: "الحالة" },
    { key: "net_amount", label: "الصافي" },
    { key: "period", label: "الفترة" },
  ],
  normaliseRow: (item) => ({
    reference: item.reference,
    entity: item.entity.name,
    type: item.settlement_type.label,
    status: item.status.label,
    net_amount: Number(item.net_amount),
    period: `${item.period_from} → ${item.period_to}`,
  }),
};

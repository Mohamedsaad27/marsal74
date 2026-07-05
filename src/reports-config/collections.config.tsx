// reports-config/collections.config.tsx
import { Banknote, CheckCircle2, Clock, Percent } from "lucide-react";
import { reportsApi } from "@/lib/admin/reportsApi";
import type { ReportConfig } from "@/lib/types/report-config";
import type { CollectionItem, CollectionSummary } from "@/lib/types/reports/collections";

export const collectionsReportConfig: ReportConfig<CollectionItem, CollectionSummary> = {
  title: "تقرير التحصيلات",
  description: "ملخص التحصيلات النقدية وحالة التسوية حسب الفترة",
  tableName: "collections_report",
  queryKey: "collections-report",
  fetcher: reportsApi.collections,
  buildKpis: (s) => [
    { label: "إجمالي التحصيلات", value: s.total_collections, icon: Banknote, tone: "primary" },
    { label: "تم تسويتها", value: s.settled_count, icon: CheckCircle2, tone: "success" },
    { label: "نقدية معلقة", value: s.pending_cash_count, icon: Clock, tone: "warning" },
    {
      label: "إجمالي العمولات",
      value: Number(s.total_commission_amount),
      icon: Percent,
      tone: "info",
    },
  ],
  columns: [
    { key: "reference_code", label: "كود الطلب" },
    { key: "agent", label: "المندوب" },
    { key: "type", label: "نوع التحصيل" },
    { key: "collected", label: "المحصل" },
    { key: "net_due", label: "الصافي" },
    { key: "settlement_status", label: "حالة التسوية" },
    { key: "date", label: "التاريخ" },
  ],
  normaliseRow: (item) => ({
    reference_code: item.order.reference_code,
    agent: item.agent.name,
    type: item.collection_type.label,
    collected: Number(item.collected_amount),
    net_due: Number(item.net_due),
    settlement_status: item.settlement_id ? "مسواة" : "قيد الانتظار",
    date: item.collected_at.slice(0, 10),
  }),
};

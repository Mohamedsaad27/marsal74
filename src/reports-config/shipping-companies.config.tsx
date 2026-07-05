// reports-config/shipping-companies.config.tsx
import { Building2, CheckCircle2, Wallet, Package } from "lucide-react";
import { reportsApi } from "@/lib/admin/reportsApi";
import type { ReportConfig } from "@/lib/types/report-config";
import type {
  ShippingCompanyItem,
  ShippingCompanySummary,
} from "@/lib/types/reports/shipping-companies";

export const shippingCompaniesReportConfig: ReportConfig<
  ShippingCompanyItem,
  ShippingCompanySummary
> = {
  title: "تقرير شركات الشحن",
  description: "أداء شركات الشحن وأرصدتها حسب الفترة",
  tableName: "shipping_companies_report",
  queryKey: "shipping-companies-report",
  fetcher: reportsApi.shippingCompanies,
  buildKpis: (s) => [
    { label: "إجمالي الشركات", value: s.total_companies, icon: Building2, tone: "primary" },
    { label: "الشركات النشطة", value: s.active_companies, icon: CheckCircle2, tone: "success" },
    {
      label: "إجمالي الرصيد",
      value: Number(s.total_balance),
      icon: Wallet,
      tone: "warning",
    },
    { label: "إجمالي الطلبات", value: s.total_orders, icon: Package, tone: "info" },
  ],
  columns: [
    { key: "company_name", label: "اسم الشركة" },
    { key: "phone", label: "الهاتف" },
    { key: "orders", label: "إجمالي الطلبات" },
    { key: "collected", label: "المحصل" },
    { key: "net_due", label: "الصافي المستحق" },
    { key: "balance", label: "الرصيد" },
    { key: "status", label: "الحالة" },
  ],
  normaliseRow: (item) => ({
    company_name: item.company_name,
    phone: item.phone,
    orders: item.metrics.total_orders,
    collected: Number(item.metrics.total_collected_amount),
    net_due: Number(item.metrics.total_net_due),
    balance: Number(item.balance),
    status: item.is_active ? "نشطة" : "غير نشطة",
  }),
};

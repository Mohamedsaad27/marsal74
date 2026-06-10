import { createFileRoute } from "@tanstack/react-router";
import { ReportPageTemplate } from "@/components/reports/ReportPageTemplate";
import { Truck, UserCheck, Package, Wallet } from "lucide-react";

export const Route = createFileRoute("/reports/couriers")({
  component: CouriersReportPage,
});

function CouriersReportPage() {
  return (
    <ReportPageTemplate
      title="تقرير المناديب"
      description="أداء المناديب والطلبات والأرصدة"
      tableName="delivery_agents_report"
      kpis={[
        { label: "المناديب النشطون", value: "48", icon: Truck, tone: "primary" },
        { label: "متاحون الآن", value: "32", icon: UserCheck, tone: "success" },
        { label: "طلبات منفذة", value: "3,420", icon: Package, tone: "info" },
        { label: "أرصدة مفتوحة", value: "86K", icon: Wallet, tone: "warning" },
      ]}
      columns={["المندوب", "الطلبات", "نسبة التسليم", "الرصيد", "المنطقة", "الفترة"]}
      rows={[
        { المندوب: "خالد العتيبي", الطلبات: "142", "نسبة التسليم": "96%", الرصيد: "1240.50", المنطقة: "مدينة نصر", الفترة: "مايو 2026" },
        { المندوب: "محمد الزهراني", الطلبات: "98", "نسبة التسليم": "94%", الرصيد: "0", المنطقة: "المهندسين", الفترة: "مايو 2026" },
      ]}
    />
  );
}

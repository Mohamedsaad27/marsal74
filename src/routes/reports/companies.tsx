import { createFileRoute } from "@tanstack/react-router";
import { ReportPageTemplate } from "@/components/reports/ReportPageTemplate";
import { Building2, Package, Wallet, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/reports/companies")({
  component: CompaniesReportPage,
});

function CompaniesReportPage() {
  return (
    <ReportPageTemplate
      title="تقرير شركات الشحن"
      description="أداء الشركات والأرصدة والعمولات"
      tableName="shipping_companies_report"
      kpis={[
        { label: "شركات نشطة", value: "12", icon: Building2, tone: "primary" },
        { label: "طلبات نشطة", value: "411", icon: Package, tone: "info" },
        { label: "أرصدة مستحقة", value: "198K", icon: Wallet, tone: "warning" },
        { label: "نمو الشهر", value: "+8%", icon: TrendingUp, tone: "success" },
      ]}
      columns={["الشركة", "طلبات نشطة", "العمولة", "الرصيد", "الحالة", "الفترة"]}
      rows={[
        { الشركة: "أرامكس مصر", "طلبات نشطة": "142", العمولة: "12%", الرصيد: "48200.50", الحالة: "نشطة", الفترة: "مايو 2026" },
        { الشركة: "سمسا للشحن", "طلبات نشطة": "98", العمولة: "10%", الرصيد: "32540.00", الحالة: "نشطة", الفترة: "مايو 2026" },
      ]}
    />
  );
}

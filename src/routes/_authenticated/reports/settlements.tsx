import { createFileRoute } from "@tanstack/react-router";
import { ReportPageTemplate } from "@/components/reports/ReportPageTemplate";
import { Scale, Users, Building2, Clock } from "lucide-react";

export const Route = createFileRoute("/_authenticated/reports/settlements")({
  component: SettlementsReportPage,
});

function SettlementsReportPage() {
  return (
    <ReportPageTemplate
      title="تقرير التسويات"
      description="تسويات المناديب وشركات الشحن"
      tableName="settlements_report"
      kpis={[
        { label: "تسويات مفتوحة", value: "18", icon: Clock, tone: "warning" },
        { label: "مناديب", value: "124", icon: Users, tone: "primary" },
        { label: "شركات", value: "12", icon: Building2, tone: "info" },
        { label: "إجمالي المسوّى", value: "2.1M", icon: Scale, tone: "success" },
      ]}
      columns={["المرجع", "النوع", "الطرف", "المبلغ", "الحالة", "التاريخ"]}
      rows={[
        { المرجع: "STL-8821", النوع: "مندوب", الطرف: "خالد العتيبي", المبلغ: "1240.50", الحالة: "مكتملة", التاريخ: "2026-05-20" },
        { المرجع: "STL-8819", النوع: "شركة", الطرف: "أرامكس مصر", المبلغ: "48200.50", الحالة: "قيد المراجعة", التاريخ: "2026-05-19" },
      ]}
    />
  );
}

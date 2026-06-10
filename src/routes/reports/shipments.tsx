import { createFileRoute } from "@tanstack/react-router";
import { ReportPageTemplate } from "@/components/reports/ReportPageTemplate";
import { Package, CheckCircle2, Clock, XCircle } from "lucide-react";

export const Route = createFileRoute("/reports/shipments")({
  component: ShipmentsReportPage,
});

function ShipmentsReportPage() {
  return (
    <ReportPageTemplate
      title="تقرير الطلبات"
      description="ملخص حالات الشحن والتسليم حسب الفترة"
      tableName="orders_report"
      kpis={[
        { label: "إجمالي الطلبات", value: "1,284", icon: Package, tone: "primary" },
        { label: "تم التسليم", value: "1,102", icon: CheckCircle2, tone: "success" },
        { label: "قيد التنفيذ", value: "142", icon: Clock, tone: "warning" },
        { label: "ملغاة / مرتجعة", value: "40", icon: XCircle, tone: "info" },
      ]}
      columns={["الكود", "الشركة", "المندوب", "الحالة", "المبلغ", "التاريخ"]}
      rows={[
        { الكود: "MR-2841", الشركة: "أرامكس", المندوب: "خالد العتيبي", الحالة: "تم التسليم", المبلغ: "275.00", التاريخ: "2026-05-22" },
        { الكود: "MR-2836", الشركة: "سمسا", المندوب: "محمد الزهراني", الحالة: "قيد التوصيل", المبلغ: "455.00", التاريخ: "2026-05-21" },
        { الكود: "MR-2832", الشركة: "زاجل", المندوب: "ناصر الدوسري", الحالة: "تم التسليم", المبلغ: "980.00", التاريخ: "2026-05-20" },
      ]}
    />
  );
}

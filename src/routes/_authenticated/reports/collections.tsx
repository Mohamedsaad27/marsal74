import { createFileRoute } from "@tanstack/react-router";
import { ReportPageTemplate } from "@/components/reports/ReportPageTemplate";
import { Wallet, Banknote, Coins, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/reports/collections")({
  component: CollectionsReportPage,
});

function CollectionsReportPage() {
  return (
    <ReportPageTemplate
      title="تقرير التحصيلات"
      description="تحصيلات COD والعمولات الصافية"
      tableName="collections_report"
      kpis={[
        { label: "إجمالي المحصّل", value: "842K", icon: Wallet, tone: "primary" },
        { label: "عمولات", value: "68K", icon: Coins, tone: "warning" },
        { label: "صافي مستحق", value: "774K", icon: Banknote, tone: "success" },
        { label: "مسوّاة", value: "612", icon: CheckCircle2, tone: "info" },
      ]}
      columns={["الطلب", "المندوب", "الشركة", "المبلغ", "العمولة", "الصافي", "التاريخ"]}
      rows={[
        {
          الطلب: "MR-2840",
          المندوب: "محمد الزهراني",
          الشركة: "سمسا",
          المبلغ: "1420.50",
          العمولة: "142.05",
          الصافي: "1278.45",
          التاريخ: "2026-05-22",
        },
        {
          الطلب: "MR-2837",
          المندوب: "ناصر الدوسري",
          الشركة: "أرامكس",
          المبلغ: "890.75",
          العمولة: "71.26",
          الصافي: "819.49",
          التاريخ: "2026-05-21",
        },
      ]}
    />
  );
}

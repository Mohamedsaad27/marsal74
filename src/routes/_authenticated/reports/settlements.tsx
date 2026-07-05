// routes/_authenticated/reports/settlements.tsx
import { createFileRoute } from "@tanstack/react-router";
import { ReportPageTemplate } from "@/components/reports/ReportPageTemplate";
import { settlementsReportConfig } from "@/reports-config/settlements.config";

export const Route = createFileRoute("/_authenticated/reports/settlements")({
  component: () => <ReportPageTemplate config={settlementsReportConfig} />,
});

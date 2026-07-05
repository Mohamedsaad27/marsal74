// routes/_authenticated/reports/collections.tsx
import { createFileRoute } from "@tanstack/react-router";
import { ReportPageTemplate } from "@/components/reports/ReportPageTemplate";
import { collectionsReportConfig } from "@/reports-config/collections.config";

export const Route = createFileRoute("/_authenticated/reports/collections")({
  component: () => <ReportPageTemplate config={collectionsReportConfig} />,
});

// routes/_authenticated/reports/shipments.tsx
import { createFileRoute } from "@tanstack/react-router";
import { ReportPageTemplate } from "@/components/reports/ReportPageTemplate";
import { ordersReportConfig } from "@/reports-config/orders.config";

export const Route = createFileRoute("/_authenticated/reports/shipments")({
  component: () => <ReportPageTemplate config={ordersReportConfig} />,
});

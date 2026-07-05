// routes/_authenticated/reports/couriers.tsx
import { createFileRoute } from "@tanstack/react-router";
import { ReportPageTemplate } from "@/components/reports/ReportPageTemplate";
import { deliveryAgentsReportConfig } from "@/reports-config/delivery-agents.config";

export const Route = createFileRoute("/_authenticated/reports/couriers")({
  component: () => <ReportPageTemplate config={deliveryAgentsReportConfig} />,
});

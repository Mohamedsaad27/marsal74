// routes/_authenticated/reports/shipping-companies.tsx
import { createFileRoute } from "@tanstack/react-router";
import { ReportPageTemplate } from "@/components/reports/ReportPageTemplate";
import { shippingCompaniesReportConfig } from "@/reports-config/shipping-companies.config";

export const Route = createFileRoute("/_authenticated/reports/companies")({
  component: () => <ReportPageTemplate config={shippingCompaniesReportConfig} />,
});

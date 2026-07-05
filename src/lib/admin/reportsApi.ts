// services/reportsApi.ts
import { apiFetch } from "@/lib/admin/users.api";
import type { ApiEnvelope, PaginatedReport, ReportQueryParams } from "@/lib/types/reports";
import type { SettlementItem, SettlementSummary } from "@/lib/types/reports/settlements";
import type { DeliveryAgentItem, DeliveryAgentSummary } from "@/lib/types/reports/delivery-agents";
import type {
  ShippingCompanyItem,
  ShippingCompanySummary,
} from "@/lib/types/reports/shipping-companies";
import type { OrderItem, OrderSummary } from "@/lib/types/reports/orders";
import type { CollectionItem, CollectionSummary } from "@/lib/types/reports/collections";

function buildQuery(params: ReportQueryParams): string {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });

  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

async function fetchReport<TItem, TSummary>(
  endpoint: string,
  params: ReportQueryParams,
): Promise<PaginatedReport<TItem, TSummary>> {
  const response = await apiFetch<ApiEnvelope<PaginatedReport<TItem, TSummary>>>(
    `/admin/reports/${endpoint}${buildQuery(params)}`,
  );
  return response.data;
}

export const reportsApi = {
  settlements: (params: ReportQueryParams) =>
    fetchReport<SettlementItem, SettlementSummary>("settlements", params),

  deliveryAgents: (params: ReportQueryParams) =>
    fetchReport<DeliveryAgentItem, DeliveryAgentSummary>("delivery-agents", params),

  shippingCompanies: (params: ReportQueryParams) =>
    fetchReport<ShippingCompanyItem, ShippingCompanySummary>("shipping-companies", params),
  orders: (params: ReportQueryParams) => fetchReport<OrderItem, OrderSummary>("orders", params),

  collections: (params: ReportQueryParams) =>
    fetchReport<CollectionItem, CollectionSummary>("collections", params),
};

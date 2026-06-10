import { apiFetch } from "@/lib/admin/users.api.ts";
import { PROFILE_BASE_URL } from "@/lib/utils";
// src/services/dashboard.ts

type DashboardSummaryResponse = {
  isSuccess: boolean;
  message: string;
  data: {
    total_orders: number;
    total_orders_change_percent: number | null;
    in_delivery: number;
    in_delivery_label: string;
    delivered_this_week: number;
    delivered_change_percent: number | null;
    net_balance_companies: number;
    net_balance_change_percent: number | null;
  };
};

type CollectionsBalanceResponse = {
  isSuccess: boolean;
  message: string;
  data: {
    total_pending: number;
    currency: string;
    company_count: number;
  };
};

type DeliveryPerformanceResponse = {
  isSuccess: boolean;
  message: string;
  data: {
    success_rate: number | null;
    failed_count: number;
    pending_count: number;
    success_count: number;
  };
};

type AvgDeliveryTimeResponse = {
  isSuccess: boolean;
  message: string;
  data: {
    avg_hours: number | null;
    change_percent: number | null;
    change_direction: string | null;
    comparison_label: string | null;
  };
};
type TopAgentsResponse = {
  isSuccess: boolean;
  message: string;
  data: Array<{
    rank: number;
    delivery_agent_id: string;
    name: string;
    city: string;
    avatar_url: string | null;
    shipments_today: number;
  }>;
};

export async function getTopAgents() {
  const response = await apiFetch<TopAgentsResponse>(
    "/api/dashboard/top-agents",
    {
      method: "GET",
    },
    PROFILE_BASE_URL,
  );

  return response.data;
}

export async function getDashboardSummary() {
  const response = await apiFetch<DashboardSummaryResponse>(
    "/api/dashboard/summary",
    {
      method: "GET",
    },
    PROFILE_BASE_URL,
  );

  return response.data;
}

export async function getCollectionsBalance() {
  const response = await apiFetch<CollectionsBalanceResponse>(
    "/api/dashboard/collections-balance",
    {
      method: "GET",
    },
    PROFILE_BASE_URL,
  );

  return response.data;
}

export async function getDeliveryPerformance() {
  const response = await apiFetch<DeliveryPerformanceResponse>(
    "/api/dashboard/delivery-performance",
    {
      method: "GET",
    },
    PROFILE_BASE_URL,
  );

  return response.data;
}

export async function getAvgDeliveryTime() {
  const response = await apiFetch<AvgDeliveryTimeResponse>(
    "/api/dashboard/avg-delivery-time",
    {
      method: "GET",
    },
    PROFILE_BASE_URL,
  );

  return response.data;
}
type ShipmentsChartResponse = {
  isSuccess: boolean;
  message: string;
  data: {
    labels: string[];
    delivered: number[];
    pending: number[];
  };
};

export async function getShipmentsChart(period: "week" | "month" = "week") {
  const res = await apiFetch<ShipmentsChartResponse>(
    `/api/dashboard/shipments-chart?period=${period}`,
    {
      method: "GET",
    },
    PROFILE_BASE_URL,
  );

  return res.data;
}

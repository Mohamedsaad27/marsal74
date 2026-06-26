import { BASE_URL } from "@/lib/utils";
import { getAccessToken } from "@/lib/auth/Auth.api";
import { normaliseListItem, normaliseDetail, ORDER_STATUS_TO_KEY } from "@/lib/admin/orders-types";
import type {
  ApiOrdersListResponse,
  ApiOrderDetailResponse,
  ApiOrderStats,
  ApiResponse,
  CreateOrderPayload,
  OrderDetail,
  OrderListItem,
} from "@/lib/admin/orders-types";

// ─── HTTP helper ──────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAccessToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { message?: string }).message ?? `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// ─── Filter option types ──────────────────────────────────────────────────────

export interface AgentOption {
  value: string; // delivery_agent.id (profile UUID) — matches order.delivery_agent_id
  label: string;
}

export interface CompanyOption {
  value: string; // shipping_company.id — matches order.shipping_company_id
  label: string;
}

export interface GovernorateOption {
  value: string; // governorate UUID
  label: string;
}

// ─── Filter option fetchers ───────────────────────────────────────────────────

export async function fetchAgentOptions(): Promise<ApiResponse<AgentOption[]>> {
  const raw = await apiFetch<{
    isSuccess: boolean;
    message: string;
    data: {
      items: Array<{ name: string; is_active: boolean; delivery_agent: { id: string } }>;
    };
  }>("/admin/delivery-agents?per_page=100&page=1&search=&is_active=&commission_type=");

  if (!raw.isSuccess) return { isSuccess: false, message: raw.message, data: [] };

  return {
    isSuccess: true,
    message: raw.message,
    data: raw.data.items
      .filter((a) => a.is_active)
      .map((a) => ({ value: a.delivery_agent.id, label: a.name })),
  };
}

export async function fetchCompanyOptions(): Promise<ApiResponse<CompanyOption[]>> {
  const raw = await apiFetch<{
    isSuccess: boolean;
    message: string;
    data: {
      items: Array<{
        is_active: boolean;
        shipping_company: { id: string; company_name: string };
      }>;
    };
  }>("/admin/shipping-companies?per_page=100&page=1&search=&is_active=");

  if (!raw.isSuccess) return { isSuccess: false, message: raw.message, data: [] };

  return {
    isSuccess: true,
    message: raw.message,
    data: raw.data.items
      .filter((c) => c.is_active)
      .map((c) => ({ value: c.shipping_company.id, label: c.shipping_company.company_name })),
  };
}

export async function fetchGovernorateOptions(): Promise<ApiResponse<GovernorateOption[]>> {
  const raw = await apiFetch<{
    isSuccess: boolean;
    message: string;
    data: { items: Array<{ governorate_id: string; name_ar: string }> };
  }>("/admin/governorates?per_page=100&search=");

  if (!raw.isSuccess) return { isSuccess: false, message: raw.message, data: [] };

  return {
    isSuccess: true,
    message: raw.message,
    data: raw.data.items.map((g) => ({ value: g.governorate_id, label: g.name_ar })),
  };
}

// ─── Orders params ────────────────────────────────────────────────────────────

export interface FetchOrdersParams {
  page?: number;
  per_page?: number;
  /**
   * Accepted values (directly from the API docs):
   *   "all" | "pending" | "in_delivery" | "delivered" | "postponed_refused" | "returned"
   *   or a numeric status id string e.g. "2"
   */
  status?: string;
  company_id?: string;
  agent_id?: string;
  governorate_id?: string;
  date_from?: string; // YYYY-MM-DD
  date_to?: string; // YYYY-MM-DD
  search?: string;
}

// ─── KPI bucket → API status param ───────────────────────────────────────────

/**
 * The ShipmentStatusKpiGrid uses internal bucket IDs.
 * This maps them to what the API's `status` query param actually accepts.
 *
 * KPI bucket ID        → API status value
 * "all"                → "all"
 * "pending_assignment" → "pending"
 * "in_delivery"        → "in_delivery"
 * "delivered"          → "delivered"
 * "delayed_rejected"   → "postponed_refused"
 * "returned"           → "returned"
 * numeric string       → passed through unchanged (exact status id filter)
 */
export function kpiBucketToApiStatus(bucket: string): string {
  const map: Record<string, string> = {
    all: "all",
    pending_assignment: "pending",
    in_delivery: "in_delivery",
    delivered: "delivered",
    delayed_rejected: "postponed_refused",
    returned: "returned",
  };
  return map[bucket] ?? bucket;
}

// ─── Orders API ───────────────────────────────────────────────────────────────

export async function fetchOrderStats(): Promise<ApiResponse<ApiOrderStats>> {
  return apiFetch<ApiResponse<ApiOrderStats>>("/admin/orders/stats");
}

export async function fetchOrders(params: FetchOrdersParams = {}): Promise<
  ApiResponse<{
    items: OrderListItem[];
    total: number;
    last_page: number;
    current_page: number;
    has_more: boolean;
  }>
> {
  const {
    page = 1,
    per_page = 20,
    status = "all",
    company_id,
    agent_id,
    governorate_id,
    date_from,
    date_to,
    search,
  } = params;

  const qs = new URLSearchParams({
    page: String(page),
    per_page: String(per_page),
    status,
  });

  // Only append optional params when they have a real value — never send empty strings
  if (company_id) qs.set("company_id", company_id);
  if (agent_id) qs.set("agent_id", agent_id);
  if (governorate_id) qs.set("governorate_id", governorate_id);
  if (date_from) qs.set("date_from", date_from);
  if (date_to) qs.set("date_to", date_to);
  if (search?.trim()) qs.set("search", search.trim());

  const raw = await apiFetch<ApiOrdersListResponse>(`/admin/orders?${qs}`);

  if (!raw.isSuccess) {
    return {
      isSuccess: false,
      message: raw.message,
      data: { items: [], total: 0, last_page: 1, current_page: 1, has_more: false },
    };
  }

  return {
    isSuccess: true,
    message: raw.message,
    data: {
      items: raw.data.items.map(normaliseListItem),
      total: raw.data.total,
      last_page: raw.data.last_page,
      current_page: raw.data.current_page,
      has_more: raw.data.has_more,
    },
  };
}

export async function fetchOrderById(orderId: string): Promise<ApiResponse<OrderDetail | null>> {
  const raw = await apiFetch<ApiOrderDetailResponse>(`/admin/orders/${orderId}`);
  if (!raw.isSuccess) return { isSuccess: false, message: raw.message, data: null };
  return { isSuccess: true, message: raw.message, data: normaliseDetail(raw.data) };
}

export async function assignOrderAgent(
  orderId: string,
  agentId: string,
): Promise<ApiResponse<null>> {
  return apiFetch<ApiResponse<null>>(`/admin/orders/${orderId}/assign`, {
    method: "PATCH",
    body: JSON.stringify({ agent_id: agentId }),
  });
}

export async function updateOrderStatus(
  orderId: string,
  status: number,
  note?: string,
): Promise<ApiResponse<null>> {
  return apiFetch<ApiResponse<null>>(`/admin/orders/${orderId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status, note }),
  });
}

export async function createOrder(payload: CreateOrderPayload): Promise<ApiResponse<null>> {
  return apiFetch<ApiResponse<null>>("/admin/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function exportOrdersExcel(): Promise<ApiResponse<{ filename: string }>> {
  return apiFetch<ApiResponse<{ filename: string }>>("/admin/orders/export");
}

export { ORDER_STATUS_TO_KEY };

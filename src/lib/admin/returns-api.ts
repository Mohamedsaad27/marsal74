import { normaliseReturn } from "@/lib/admin/returns-types";
import type {
  ApiResponse,
  ReturnKpis,
  ReturnRecord,
  ReturnRecordWire,
  ReturnStatsWire,
} from "@/lib/admin/returns-types";
import { getAccessToken } from "../auth/Auth.api";

import { BASE_URL } from "@/lib/utils";
function authHeaders(): HeadersInit {
  const token = getAccessToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(res: Response): Promise<ApiResponse<T>> {
  const json = await res.json();
  if (!res.ok) throw new Error(json.message ?? `HTTP ${res.status}`);
  return json as ApiResponse<T>;
}
export type ReturnListResponse = {
  items: ReturnRecord[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
  has_more: boolean;
};
export type ReturnFilters = {
  status?: string;
  company_id?: string;
  agent_id?: string;
  page?: number;
  per_page?: number;
};
export async function fetchReturns(
  filters: ReturnFilters = {},
): Promise<ApiResponse<ReturnListResponse>> {
  const params = new URLSearchParams();

  if (filters.status) params.set("status", filters.status);

  if (filters.company_id) params.set("company_id", filters.company_id);

  if (filters.agent_id) params.set("agent_id", filters.agent_id);

  params.set("page", String(filters.page ?? 1));
  params.set("per_page", String(filters.per_page ?? 20));

  const res = await fetch(`${BASE_URL}/admin/returns?${params}`, {
    headers: authHeaders(),
  });

  const raw = await handleResponse<{
    items: ReturnRecordWire[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    has_more: boolean;
  }>(res);

  return {
    ...raw,
    data: {
      ...raw.data,
      items: raw.data.items.map(normaliseReturn),
    },
  };
}

export async function fetchReturnStats(): Promise<ApiResponse<ReturnKpis>> {
  const res = await fetch(`${BASE_URL}/admin/returns/stats`, {
    headers: authHeaders(),
  });
  const raw = await handleResponse<ReturnStatsWire>(res);
  return {
    ...raw,
    data: {
      total: raw.data.total,
      pending: raw.data.pending,
      received: raw.data.received_by_admin,
      sent: raw.data.sent_to_company,
    },
  };
}

export async function receiveReturn(returnId: string): Promise<ApiResponse<null>> {
  const res = await fetch(`${BASE_URL}/admin/returns/${returnId}/receive`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  return handleResponse<null>(res);
}

export async function sendReturnToCompany(returnId: string): Promise<ApiResponse<null>> {
  const res = await fetch(`${BASE_URL}/admin/returns/${returnId}/return-to-company`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  return handleResponse<null>(res);
}

export async function exportReturnsReport(): Promise<ApiResponse<{ filename: string }>> {
  const res = await fetch(`${BASE_URL}/admin/returns/export`, {
    headers: authHeaders(),
  });
  return handleResponse<{ filename: string }>(res);
}

import {
  type ApiResponse,
  type ApprovalRequest,
  type ApprovalRequestWire,
  type ApprovalStats,
  type ApprovalStatsWire,
  type PaginatedResponse,
  type ReviewPayload,
  normaliseApprovalRequest,
  normaliseStats,
} from "@/lib/admin/approvals-types";
import { getAccessToken } from "../auth/Auth.api";
import { BASE_URL } from "@/lib/utils";

// ─── Shared fetch helper ──────────────────────────────────────────────────────

async function apiFetch<T>(path: string, options?: RequestInit): Promise<ApiResponse<T>> {
  const token = getAccessToken();

  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      // Auth header injected by your axios/fetch interceptor or here:
      Authorization: `Bearer ${token}`,
      ...options?.headers,
    },
    ...options,
  });

  // Surface HTTP errors as isSuccess=false so callers get a consistent shape
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = (await res.json()) as { message?: string };
      if (body.message) message = body.message;
    } catch {
      // ignore JSON parse errors
    }
    return { isSuccess: false, message, data: null as unknown as T };
  }

  return res.json() as Promise<ApiResponse<T>>;
}

// ─── Filters / params ────────────────────────────────────────────────────────

export type ApprovalListFilters = {
  status?: string; // "1" | "2" | "3" | "4" | ""
  type?: string; // "1" | "2" | "3" | ""
  agent_id?: string;
  page?: number;
  per_page?: number;
};

// ─── Stats ───────────────────────────────────────────────────────────────────

export async function fetchApprovalStats(): Promise<ApiResponse<ApprovalStats>> {
  const raw = await apiFetch<ApprovalStatsWire>("/admin/approval-requests/stats");
  if (!raw.isSuccess) return { ...raw, data: null as unknown as ApprovalStats };
  return { ...raw, data: normaliseStats(raw.data) };
}

// ─── List ─────────────────────────────────────────────────────────────────────

export async function fetchApprovalRequests(
  filters: ApprovalListFilters = {},
): Promise<ApiResponse<PaginatedResponse<ApprovalRequest>>> {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.type) params.set("type", filters.type);
  if (filters.agent_id) params.set("agent_id", filters.agent_id);
  params.set("per_page", String(filters.per_page ?? 20));
  if (filters.page && filters.page > 1) params.set("page", String(filters.page));

  const qs = params.toString();
  const raw = await apiFetch<PaginatedResponse<ApprovalRequestWire>>(
    `/admin/approval-requests${qs ? `?${qs}` : ""}`,
  );

  if (!raw.isSuccess) {
    return { ...raw, data: null as unknown as PaginatedResponse<ApprovalRequest> };
  }

  return {
    ...raw,
    data: {
      ...raw.data,
      items: raw.data.items.map(normaliseApprovalRequest),
    },
  };
}

// ─── Detail ───────────────────────────────────────────────────────────────────

export async function fetchApprovalRequest(id: string): Promise<ApiResponse<ApprovalRequest>> {
  const raw = await apiFetch<ApprovalRequestWire>(`/admin/approval-requests/${id}`);
  if (!raw.isSuccess) return { ...raw, data: null as unknown as ApprovalRequest };
  return { ...raw, data: normaliseApprovalRequest(raw.data) };
}

// ─── Review (approve / reject) ────────────────────────────────────────────────

export async function reviewRequest(
  id: string,
  payload: ReviewPayload,
): Promise<ApiResponse<ApprovalRequest>> {
  const raw = await apiFetch<ApprovalRequestWire>(`/admin/approval-requests/${id}/review`, {
    method: "PATCH",
    body: JSON.stringify({
      action: payload.action,
      review_notes: payload.review_notes,
    }),
  });
  if (!raw.isSuccess) return { ...raw, data: null as unknown as ApprovalRequest };
  return { ...raw, data: normaliseApprovalRequest(raw.data) };
}

// ─── Convenience wrappers (keep call-sites readable) ─────────────────────────

export async function approveRequest(
  id: string,
  review_notes: string,
): Promise<ApiResponse<ApprovalRequest>> {
  return reviewRequest(id, { action: "approve", review_notes });
}

export async function rejectRequest(
  id: string,
  review_notes: string,
): Promise<ApiResponse<ApprovalRequest>> {
  return reviewRequest(id, { action: "reject", review_notes });
}

// ─── Client-side helpers (kept from original; operate on normalised data) ─────

export function getPendingApprovals(items: ApprovalRequest[]): ApprovalRequest[] {
  return items
    .filter((i) => i.approval_status === 1)
    .sort((a, b) => {
      const aExp = a.expires_at ? new Date(a.expires_at).getTime() : Infinity;
      const bExp = b.expires_at ? new Date(b.expires_at).getTime() : Infinity;
      return aExp - bExp;
    });
}

export function computeApprovalKpis(stats: ApprovalStats) {
  return {
    pending: stats.pending,
    urgent: stats.urgent,
    approved: stats.approved,
    rejected: stats.rejected,
    expired: stats.expired,
  };
}

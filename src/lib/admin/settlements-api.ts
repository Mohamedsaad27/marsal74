import type { CollectionRecord } from "@/lib/admin/collections-types";
import type {
  ApiResponse,
  CreateSettlementInput,
  MarkSettlementPaidInput,
  PaginatedApiResponse,
  SettlementApiItem,
  SettlementRecord,
  SettlementTypeCode,
  StatsApiResponse,
} from "@/lib/admin/settlements-types";
import { normaliseSettlement } from "@/lib/admin/settlements-types";
import { BASE_URL } from "../utils";
import { getAccessToken } from "../auth/Auth.api";
const BASE = BASE_URL + "/admin/settlements";

// ─── Helpers ───────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getAccessToken();

  const res = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { message?: string }).message ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ─── KPI stats ─────────────────────────────────────────────────────────────

export type SettlementKpis = {
  total: number;
  totalNet: number;
  draftNet: number;
  approvedNet: number;
  paidThisMonth: number;
  draftCount: number;
  approvedCount: number;
  paidCount: number;
};

export async function fetchSettlementStats(): Promise<SettlementKpis> {
  const res = await apiFetch<StatsApiResponse>(`${BASE}/stats`);
  if (!res.isSuccess) throw new Error(res.message);
  const d = res.data;
  return {
    total: 0, // not in stats response; will be filled from list total
    totalNet: parseFloat(d.total_amount),
    draftNet: parseFloat(d.pending_approval),
    approvedNet: parseFloat(d.approved_unpaid),
    paidThisMonth: parseFloat(d.paid_this_month),
    draftCount: 0,
    approvedCount: 0,
    paidCount: 0,
  };
}

// ─── List ──────────────────────────────────────────────────────────────────

export type FetchSettlementsParams = {
  page?: number;
  perPage?: number;
  search?: string;
  type?: string; // "1" | "2" | "all"
  status?: string; // "1" | "2" | "3" | "all"
  date_from?: string; // Y-m-d
  date_to?: string; // Y-m-d
  companyId?: string; // for company-portal tab
};

export type FetchSettlementsResult = {
  items: SettlementRecord[];
  currentPage: number;
  lastPage: number;
  total: number;
};

export async function fetchSettlements(
  params: FetchSettlementsParams = {},
): Promise<FetchSettlementsResult> {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  qs.set("per_page", String(params.perPage ?? 20));
  if (params.search) qs.set("search", params.search);
  if (params.type && params.type !== "all") qs.set("settlement_type", params.type);
  if (params.status && params.status !== "all") qs.set("status", params.status);
  if (params.date_from) qs.set("date_from", params.date_from);
  if (params.date_to) qs.set("date_to", params.date_to);
  if (params.companyId) qs.set("shipping_company_id", params.companyId);

  const res = await apiFetch<PaginatedApiResponse<SettlementApiItem>>(`${BASE}?${qs.toString()}`);
  if (!res.isSuccess) throw new Error(res.message);

  return {
    items: res.data.items.map(normaliseSettlement),
    currentPage: res.data.current_page,
    lastPage: res.data.last_page,
    total: res.data.total,
  };
}

// ─── Create ────────────────────────────────────────────────────────────────

export async function createSettlement(
  input: CreateSettlementInput,
): Promise<ApiResponse<SettlementRecord>> {
  const body = {
    settlement_type: input.settlement_type,
    reference_entity_id: input.party_id,
    period_from: input.period_from,
    period_to: input.period_to,
    notes: input.notes ?? null,
  };

  const res = await apiFetch<{ isSuccess: boolean; message: string; data: SettlementApiItem }>(
    BASE,
    { method: "POST", body: JSON.stringify(body) },
  );

  return {
    isSuccess: res.isSuccess,
    message: res.message,
    data: normaliseSettlement(res.data),
  };
}

// ─── Approve ───────────────────────────────────────────────────────────────

export async function approveSettlement(
  settlementId: string,
): Promise<ApiResponse<SettlementRecord>> {
  const res = await apiFetch<{ isSuccess: boolean; message: string; data: SettlementApiItem }>(
    `${BASE}/${settlementId}/approve`,
    { method: "PATCH" },
  );

  return {
    isSuccess: res.isSuccess,
    message: res.message,
    data: normaliseSettlement(res.data),
  };
}

// ─── Mark paid ─────────────────────────────────────────────────────────────

export async function markSettlementPaid(
  settlementId: string,
  input: MarkSettlementPaidInput,
): Promise<ApiResponse<SettlementRecord>> {
  const res = await apiFetch<{ isSuccess: boolean; message: string; data: SettlementApiItem }>(
    `${BASE}/${settlementId}/mark-paid`,
    { method: "PATCH", body: JSON.stringify(input) },
  );

  return {
    isSuccess: res.isSuccess,
    message: res.message,
    data: normaliseSettlement(res.data),
  };
}

// ─── Export ────────────────────────────────────────────────────────────────

export async function exportSettlements(): Promise<ApiResponse<{ filename: string }>> {
  const res = await apiFetch<ApiResponse<{ filename: string }>>(`${BASE}/export`);
  return res;
}

// ─── These were mock-only helpers; kept as stubs so imports don't break ────

export function getEligibleCollections(
  _type: SettlementTypeCode,
  _partyId: string,
  _periodFrom: string,
  _periodTo: string,
): CollectionRecord[] {
  return [];
}

export function getLinkedCollections(_settlement: SettlementRecord): CollectionRecord[] {
  return [];
}

/** @deprecated use fetchSettlementStats() — kept so old call sites compile */
export function computeSettlementKpis(_items: SettlementRecord[]) {
  return {
    total: 0,
    totalNet: 0,
    draftNet: 0,
    approvedNet: 0,
    paidThisMonth: 0,
    draftCount: 0,
    approvedCount: 0,
    paidCount: 0,
  };
}

export function filterByPeriod(items: SettlementRecord[], _periodFilter: string) {
  return items; // now handled server-side
}

export function filterCompanySettlements(items: SettlementRecord[], _companyId: string) {
  return items; // now handled server-side via shipping_company_id param
}

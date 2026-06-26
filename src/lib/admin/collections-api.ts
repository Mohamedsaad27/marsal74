import type {
  AgentCollectionSummary,
  ApiResponse,
  CollectionRecord,
} from "@/lib/admin/collections-types";
import { getAccessToken } from "../auth/Auth.api";
import { BASE_URL } from "../utils";

// ─── Wire types (API shapes) ──────────────────────────────────────────────────

type WireCollection = {
  id: string;
  agent: { id: string; name: string };
  company: { id: string; name: string };
  collection_type: { code: number; label: string };
  collected_amount: string;
  commission_amount: string;
  net_due: string;
  cash_received_at: string | null;
  settlement_id: string | null;
  collected_at: string;
  order?: { id: string; internal_code: string };
};

type WireListResponse = {
  isSuccess: boolean;
  message: string;
  data: {
    items: WireCollection[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    has_more: boolean;
  };
};


// ─── Normaliser ───────────────────────────────────────────────────────────────

function normaliseCollection(w: WireCollection): CollectionRecord {
  return {
    collection_id: w.id,
    order_id: w.order?.id ?? w.id,
    internal_code: w.order?.internal_code ?? w.id.slice(0, 8).toUpperCase(),
    delivery_agent_id: w.agent.id,
    agent_name: w.agent.name,
    shipping_company_id: w.company.id,
    company_name: w.company.name,
    collection_type: w.collection_type.code as 1 | 2 | 3,
    collected_amount: parseFloat(w.collected_amount),
    commission_amount: parseFloat(w.commission_amount),
    net_due_company: parseFloat(w.net_due),
    is_settled: w.settlement_id !== null ? 1 : 0,
    cash_received_by_admin: w.cash_received_at !== null ? 1 : 0,
    cash_received_at: w.cash_received_at,
    received_by_admin_name: null,
    collected_at: w.collected_at,
    created_at: w.collected_at,
    updated_at: w.collected_at,
  };
}

// ─── API helpers ──────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAccessToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export type FetchCollectionsParams = {
  search?: string;
  collection_type?: string; // "1" | "2" | "3"
  status?: string; // "pending_cash" | "unsettled" | "settled"
  agent_id?: string;
  company_id?: string;
  date_from?: string; // Y-m-d
  date_to?: string; // Y-m-d
  per_page?: number;
  page?: number;
};

export async function fetchCollections(
  params: FetchCollectionsParams = {},
): Promise<ApiResponse<CollectionRecord[]>> {
  const qs = new URLSearchParams();
  qs.set("per_page", String(params.per_page ?? 100));
  if (params.page) qs.set("page", String(params.page));
  if (params.search) qs.set("search", params.search);
  if (params.collection_type && params.collection_type !== "all")
    qs.set("collection_type", params.collection_type);
  if (params.status) qs.set("status", params.status);
  if (params.agent_id) qs.set("agent_id", params.agent_id);
  if (params.company_id) qs.set("company_id", params.company_id);
  if (params.date_from) qs.set("date_from", params.date_from);
  if (params.date_to) qs.set("date_to", params.date_to);

  const wire = await apiFetch<WireListResponse>(`/admin/collections?${qs.toString()}`);

  return {
    isSuccess: wire.isSuccess,
    message: wire.message,
    data: wire.data.items.map(normaliseCollection),
  };
}

// collections-api.ts — replace WireStatsResponse and fetchCollectionStats

// collections-api.ts — replace WireStatsResponse and fetchCollectionStats

type WireStatsResponse = {
  isSuccess: boolean;
  message: string;
  data: {
    total_collected: string;
    total_commissions: string;
    net_due_to_companies: string;
    pending_cash_count: number;
  };
};
type CollectionStatsData = {
  totalCollected: number;
  totalCommission: number;
  totalNetDue: number;
  pendingHandoff: number;
};

export async function fetchCollectionStats(): Promise<ApiResponse<CollectionStatsData>> {
  const wire = await apiFetch<WireStatsResponse>("/admin/collections/stats");
  return {
    isSuccess: wire.isSuccess,
    message: wire.message,
    data: {
      totalCollected: parseFloat(wire.data.total_collected) || 0,
      totalCommission: parseFloat(wire.data.total_commissions) || 0,
      totalNetDue: parseFloat(wire.data.net_due_to_companies) || 0,
      pendingHandoff: wire.data.pending_cash_count ?? 0,
    },
  };
}
export async function receiveCashFromAgent(
  _agentId: string,
  collectionIds: string[],
): Promise<ApiResponse<null>> {
  // The API marks one collection at a time; fan out in parallel
  await Promise.all(
    collectionIds.map((id) =>
      apiFetch(`/admin/collections/${id}/mark-cash-received`, {
        method: "PATCH",
      }),
    ),
  );
  return {
    isSuccess: true,
    message: "تم تسجيل استلام النقد من المندوب",
    data: null,
  };
}

export async function exportCollections(): Promise<ApiResponse<{ filename: string }>> {
  // Adjust if backend returns a blob download instead
  const wire = await apiFetch<{ message: string; data: { filename: string } }>(
    "/admin/collections/export",
    { method: "POST" },
  );
  return { isSuccess: true, message: wire.message, data: wire.data };
}

// ─── Local compute helpers (unchanged) ───────────────────────────────────────

export function computeCollectionKpis(items: CollectionRecord[]) {
  const totalCollected = items.reduce((s, i) => s + i.collected_amount, 0);
  const totalCommission = items.reduce((s, i) => s + i.commission_amount, 0);
  const totalNetDue = items.reduce((s, i) => s + i.net_due_company, 0);
  const settledNet = items
    .filter((i) => i.is_settled === 1)
    .reduce((s, i) => s + i.net_due_company, 0);
  const pendingHandoff = items.filter((i) => i.cash_received_by_admin === 0).length;
  return {
    totalCollected,
    totalCommission,
    totalNetDue,
    settledNet,
    pendingHandoff,
    total: items.length,
  };
}

export function computeAgentSummaries(items: CollectionRecord[]): AgentCollectionSummary[] {
  const map = new Map<string, AgentCollectionSummary>();
  for (const item of items) {
    const pending = item.cash_received_by_admin === 0 ? 1 : 0;
    const pendingAmount = item.cash_received_by_admin === 0 ? item.collected_amount : 0;
    const ex = map.get(item.delivery_agent_id);
    if (ex) {
      ex.collections_count += 1;
      ex.total_collected += item.collected_amount;
      ex.total_commission += item.commission_amount;
      ex.total_net_due += item.net_due_company;
      ex.pending_handoff += pending;
      ex.pending_handoff_amount += pendingAmount;
    } else {
      map.set(item.delivery_agent_id, {
        delivery_agent_id: item.delivery_agent_id,
        agent_name: item.agent_name,
        collections_count: 1,
        total_collected: item.collected_amount,
        total_commission: item.commission_amount,
        total_net_due: item.net_due_company,
        pending_handoff: pending,
        pending_handoff_amount: pendingAmount,
      });
    }
  }
  return Array.from(map.values()).sort(
    (a, b) => b.pending_handoff_amount - a.pending_handoff_amount,
  );
}

export function getPendingCollectionsForAgent(
  items: CollectionRecord[],
  agentId: string,
): CollectionRecord[] {
  return items.filter((i) => i.delivery_agent_id === agentId && i.cash_received_by_admin === 0);
}

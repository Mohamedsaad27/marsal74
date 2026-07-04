export type ApiResponse<T> = {
  isSuccess: boolean;
  message: string;
  data: T;
};

/** settlements.settlement_type */
export type SettlementTypeCode = 1 | 2;

/** settlements.settlement_status */
export type SettlementStatusCode = 1 | 2 | 3;

export type SettlementRecord = {
  settlement_id: string;
  settlement_ref: string;
  settlement_type: SettlementTypeCode;
  settlement_status: SettlementStatusCode;
  delivery_agent_id: string | null;
  agent_name: string | null;
  shipping_company_id: string | null;
  company_name: string | null;
  initiated_by: string;
  initiated_by_name: string;
  total_collections: number;
  total_commissions: number;
  net_amount: number;
  period_from: string;
  period_to: string;
  payment_method: string | null;
  payment_reference: string | null;
  paid_at: string | null;
  notes: string | null;
  collection_ids: string[];
  created_at: string;
  updated_at: string;
};

export type CreateSettlementInput = {
  settlement_type: SettlementTypeCode;
  party_id: string;
  period_from: string;
  period_to: string;
  notes?: string;
};

export type MarkSettlementPaidInput = {
  payment_method: string;
  payment_reference: string;
};

export const SETTLEMENT_TYPE_OPTIONS: { value: string; label: string; code: SettlementTypeCode }[] =
  [
    { value: "1", label: "تسوية مندوب", code: 1 },
    { value: "2", label: "تسوية شركة شحن", code: 2 },
  ];

export const SETTLEMENT_STATUS_OPTIONS: {
  value: string;
  label: string;
  code: SettlementStatusCode;
}[] = [
  { value: "1", label: "مسودة", code: 1 },
  { value: "2", label: "معتمدة", code: 2 },
  { value: "3", label: "مدفوعة", code: 3 },
];

export const PAYMENT_METHOD_OPTIONS = [
  { value: "bank_transfer", label: "تحويل بنكي" },
  { value: "cash", label: "نقداً" },
  { value: "instapay", label: "InstaPay" },
];

export function settlementTypeLabel(type: SettlementTypeCode): string {
  return SETTLEMENT_TYPE_OPTIONS.find((o) => o.code === type)?.label ?? String(type);
}

export function settlementStatusLabel(status: SettlementStatusCode): string {
  return SETTLEMENT_STATUS_OPTIONS.find((o) => o.code === status)?.label ?? String(status);
}

export function paymentMethodLabel(method: string | null): string {
  if (!method) return "—";
  return PAYMENT_METHOD_OPTIONS.find((o) => o.value === method)?.label ?? method;
}

export function formatAmount(value: number): string {
  return value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function settlementPartyName(item: SettlementRecord): string {
  return item.settlement_type === 1 ? (item.agent_name ?? "—") : (item.company_name ?? "—");
}

export const settlementTypeStyles: Record<SettlementTypeCode, string> = {
  1: "bg-accent text-accent-foreground ring-accent/30",
  2: "bg-primary/10 text-primary ring-primary/20",
};

export const settlementStatusStyles: Record<SettlementStatusCode, string> = {
  1: "bg-muted text-muted-foreground ring-border",
  2: "bg-info/10 text-info ring-info/20",
  3: "bg-success/10 text-success ring-success/20",
};
// ─── Wire types (API shapes) ───────────────────────────────────────────────

export type SettlementApiItem = {
  id: string;
  reference: string;
  settlement_type: { code: SettlementTypeCode; label: string };
  status: { code: SettlementStatusCode; label: string };
  entity: { id: string; name: string };
  period_from: string;
  period_to: string;
  collections_count: number;
  total_collections: string;
  total_commissions: string;
  net_amount: string;
  payment_method: string | null;
  payment_reference: string | null;
  paid_at: string | null;
  initiated_by: { id: string; name: string };
  notes: string | null;
  created_at: string;
};

export type SettlementStatsApiResponse = {
  total_amount: string;
  pending_approval: string;
  approved_unpaid: string;
  paid_this_month: string;
};

export type PaginatedApiResponse<T> = {
  isSuccess: boolean;
  message: string;
  data: {
    items: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    has_more: boolean;
  };
};

export type StatsApiResponse = {
  isSuccess: boolean;
  message: string;
  data: SettlementStatsApiResponse;
};

// Normaliser: wire → UI model
export function normaliseSettlement(item: SettlementApiItem): SettlementRecord {
  const isAgent = item.settlement_type.code === 1;
  return {
    settlement_id: item.id,
    settlement_ref: item.reference,
    settlement_type: item.settlement_type.code,
    settlement_status: item.status.code,
    delivery_agent_id: isAgent ? item.entity.id : null,
    agent_name: isAgent ? item.entity.name : null,
    shipping_company_id: isAgent ? null : item.entity.id,
    company_name: isAgent ? null : item.entity.name,
    initiated_by: item.initiated_by.id,
    initiated_by_name: item.initiated_by.name,
    total_collections: parseFloat(item.total_collections),
    total_commissions: parseFloat(item.total_commissions),
    net_amount: parseFloat(item.net_amount),
    period_from: item.period_from,
    period_to: item.period_to,
    payment_method: item.payment_method,
    payment_reference: item.payment_reference,
    paid_at: item.paid_at,
    notes: item.notes,
    collection_ids: [], // not returned in list; detail endpoint can populate if needed
    created_at: item.created_at,
    updated_at: item.created_at, // API doesn't return updated_at on list
  };
}

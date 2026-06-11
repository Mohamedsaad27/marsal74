export type ApiResponse<T> = {
  isSuccess: boolean;
  message: string;
  data: T;
};

/** collections.collection_type */
export type CollectionTypeCode = 1 | 2 | 3;

export type CollectionRecord = {
  collection_id: string;
  order_id: string;
  internal_code: string;
  delivery_agent_id: string;
  agent_name: string;
  shipping_company_id: string;
  company_name: string;
  collection_type: CollectionTypeCode;
  collected_amount: number;
  commission_amount: number;
  net_due_company: number;
  is_settled: 0 | 1;
  cash_received_by_admin: 0 | 1;
  cash_received_at: string | null;
  received_by_admin_name: string | null;
  collected_at: string;
  created_at: string;
  updated_at: string;
};

export type AgentCollectionSummary = {
  delivery_agent_id: string;
  agent_name: string;
  collections_count: number;
  total_collected: number;
  total_commission: number;
  total_net_due: number;
  pending_handoff: number;
  pending_handoff_amount: number;
};

export const COLLECTION_TYPE_OPTIONS: { value: string; label: string; code: CollectionTypeCode }[] =
  [
    { value: "1", label: "تحصيل كامل (COD)", code: 1 },
    { value: "2", label: "رسوم شحن فقط", code: 2 },
    { value: "3", label: "تحصيل جزئي", code: 3 },
  ];

export function collectionTypeLabel(type: CollectionTypeCode): string {
  return COLLECTION_TYPE_OPTIONS.find((o) => o.code === type)?.label ?? String(type);
}

export function formatAmount(value: number): string {
  return value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatDateTime(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const collectionTypeStyles: Record<CollectionTypeCode, string> = {
  1: "bg-success/10 text-success ring-success/20",
  2: "bg-warning/15 text-warning ring-warning/25",
  3: "bg-info/10 text-info ring-info/20",
};

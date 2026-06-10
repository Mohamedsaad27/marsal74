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
  collection_ids: string[];
  notes?: string;
};

export type MarkSettlementPaidInput = {
  payment_method: string;
  payment_reference: string;
};

export const SETTLEMENT_TYPE_OPTIONS: { value: string; label: string; code: SettlementTypeCode }[] = [
  { value: "1", label: "تسوية مندوب", code: 1 },
  { value: "2", label: "تسوية شركة شحن", code: 2 },
];

export const SETTLEMENT_STATUS_OPTIONS: { value: string; label: string; code: SettlementStatusCode }[] = [
  { value: "1", label: "مسودة", code: 1 },
  { value: "2", label: "معتمدة", code: 2 },
  { value: "3", label: "مدفوعة", code: 3 },
];

export const PAYMENT_METHOD_OPTIONS = [
  { value: "bank_transfer", label: "تحويل بنكي" },
  { value: "cash", label: "نقداً" },
  { value: "instapay", label: "InstaPay" },
  { value: "check", label: "شيك" },
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
  return new Date(value).toLocaleDateString("ar-EG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("ar-EG", {
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

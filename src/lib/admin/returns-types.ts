export type ApiResponse<T> = {
  isSuccess: boolean;
  message: string;
  data: T;
};

// ── Wire shape ───────────────────────────────────────────────────────────────

export type ReturnStatusCode = 1 | 2 | 3;

export type ReturnRecordWire = {
  id: string;
  order_id: string;
  return_status: { id: ReturnStatusCode; label: string; color: string };
  returned_quantity: number;
  return_reason: string;
  notes: string | null;
  agent: { id: string; name: string };
  company: { id: string; name: string };
  received_at: string | null;
  returned_to_company_at: string | null;
  created_at: string;
};

export type ReturnStatsWire = {
  total: number;
  pending: number;
  received_by_admin: number;
  sent_to_company: number;
};

// ── UI model ─────────────────────────────────────────────────────────────────

export type ReturnRecord = {
  return_id: string;
  order_id: string;
  return_status: ReturnStatusCode;
  returned_quantity: number;
  return_reason: string;
  notes: string | null;
  delivery_agent_id: string;
  agent_name: string;
  shipping_company_id: string;
  company_name: string;
  received_at: string | null;
  returned_to_company_at: string | null;
  created_at: string;
};

export type ReturnKpis = {
  total: number;
  pending: number;
  received: number;
  sent: number;
};

export function normaliseReturn(w: ReturnRecordWire): ReturnRecord {
  return {
    return_id: w.id,
    order_id: w.order_id,
    return_status: w.return_status.id,
    returned_quantity: w.returned_quantity,
    return_reason: w.return_reason,
    notes: w.notes,
    delivery_agent_id: w.agent.id,
    agent_name: w.agent.name,
    shipping_company_id: w.company.id,
    company_name: w.company.name,
    received_at: w.received_at,
    returned_to_company_at: w.returned_to_company_at,
    created_at: w.created_at,
  };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

export const RETURN_STATUS_OPTIONS: { value: string; label: string; code: ReturnStatusCode }[] = [
  { value: "1", label: "بانتظار الاستلام", code: 1 },
  { value: "2", label: "تم الاستلام من المندوب", code: 2 },
  { value: "3", label: "تم التسليم للشركة", code: 3 },
];

export function returnStatusLabel(status: ReturnStatusCode): string {
  return RETURN_STATUS_OPTIONS.find((o) => o.code === status)?.label ?? String(status);
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

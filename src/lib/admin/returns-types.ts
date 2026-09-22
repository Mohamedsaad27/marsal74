export type ApiResponse<T> = {
  isSuccess: boolean;
  message: string;
  data: T;
};

// ── Wire shape ───────────────────────────────────────────────────────────────

export type ReturnStatusCode = 1 | 2 | 3;

type StatusWire = { id: number; label: string; color: string };

export type ReturnOrderWire = {
  id: string;
  reference_code: string;
  reference_no: string;
  status: StatusWire;
  customer: {
    name: string;
    phone: string;
    phone_alt: string | null;
  };
  address: {
    governorate: string;
    city: string | null;
    address_line: string;
  };
};

export type ReturnRecordWire = {
  id: string;
  order_id: string;
  return_status: { id: ReturnStatusCode; label: string; color: string };
  returned_quantity: number;
  return_reason: string;
  notes: string | null;
  order: ReturnOrderWire;
  agent: { id: string; name: string };
  company: { id: string; name: string };
  received_at: string | null;
  returned_to_company_at: string | null;
  created_at: string;
};

export type ReturnListWire = {
  items: ReturnRecordWire[];
  type: string;
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
  has_more: boolean;
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
  order_reference_code: string;
  order_reference_no: string;
  order_status_label: string;
  customer_name: string;
  customer_phone: string;
  customer_phone_alt: string | null;
  governorate: string;
  city: string | null;
  address_line: string;
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
    order_reference_code: w.order.reference_code,
    order_reference_no: w.order.reference_no,
    order_status_label: w.order.status.label,
    customer_name: w.order.customer.name,
    customer_phone: w.order.customer.phone,
    customer_phone_alt: w.order.customer.phone_alt,
    governorate: w.order.address.governorate,
    city: w.order.address.city,
    address_line: w.order.address.address_line,
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

export function normaliseReturnStats(w: ReturnStatsWire): ReturnKpis {
  return {
    total: w.total,
    pending: w.pending,
    received: w.received_by_admin,
    sent: w.sent_to_company,
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

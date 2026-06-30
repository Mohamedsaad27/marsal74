import type { ShipmentStatus } from "@/components/dashboard/StatusBadge";

export type ApiResponse<T> = {
  isSuccess: boolean;
  message: string;
  data: T;
};

/** orders.status — TINYINT 1–12 */
export type OrderStatusCode = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 15;
export type Order = {
  order_id: string;
  reference_no: string;
  internal_code: string;
  shipping_company_id: string | null;
  delivery_agent_id: string | null;
  status: OrderStatusCode;
  assigned_at: string | null;
  delivered_at: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderCustomerInfo = {
  order_customer_info_id: string;
  order_id: string;
  customer_name: string;
  customer_phone: string;
  phone_alt: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderAddress = {
  order_address_id: string;
  order_id: string;
  governorate_id: string | null;
  city_id: string | null;
  address_line: string;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderApproval = {
  order_approval_id: string;
  order_id: string;
  requires_approval: 0 | 1;
  approval_granted: 0 | 1 | null;
  approved_by: string | null;
  approved_at: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderFinancials = {
  order_financial_id: string;
  order_id: string;
  original_amount: number;
  approved_amount: number | null;
  collected_amount: number | null;
  shipping_fee: number | null;
  commission_amount: number | null;
  net_due_company: number | null;
  is_settled: 0 | 1;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  order_item_id: string;
  order_id: string;
  item_description: string | null;
  total_quantity: number;
  delivered_quantity: number | null;
  returned_quantity: number | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderStatusHistoryEntry = {
  id: string;
  order_id: string;
  from_status: OrderStatusCode | null;
  to_status: OrderStatusCode;
  changed_by: string;
  changed_by_name: string;
  note: string | null;
  created_at: string;
};

export type OrderDeliveryProof = {
  id: string;
  order_id: string;
  proof_type: "signature" | "photo" | "otp";
  label: string;
  captured_at: string;
  captured_by: string;
  thumbnail_url: string | null;
};

/** Denormalized row for list table */
export type OrderListItem = {
  order: Order;
  customer_name: string;
  customer_phone: string;
  governorate_name: string;
  city_name: string;
  company_name: string;
  agent_name: string | null;
  original_amount: number;
  collected_amount: number | null;
  status_key: ShipmentStatus;
};

/** Schedule block returned by the real detail endpoint */
export type OrderDetailSchedule = {
  expected_delivery_date: string | null;
  postponed_date: string | null;
  schedule_notes: string | null;
};

export type OrderDetail = {
  order: Order;
  customer_info: OrderCustomerInfo;
  address: OrderAddress;
  governorate_name: string;
  city_name: string;
  // Extra fields available from the real detail endpoint
  notes: string | null;
  company_name: string;
  company_phone: string;
  agent_name: string | null;
  agent_phone: string | null;
  financials: OrderFinancials;
  items: OrderItem[];
  approval: OrderApproval | null;
  schedule: OrderDetailSchedule;
  status_history: OrderStatusHistoryEntry[];
  delivery_proofs: OrderDeliveryProof[];
  status_key: ShipmentStatus;
  approved_by_name: string | null;
};

export type CreateOrderPayload = {
  reference_no: string;
  shipping_company_id: string;
  customer_name: string;
  customer_phone: string;
  phone_alt?: string;
  governorate_id: string;
  city_id: string;
  address_line: string;
  original_amount: number;
  item_description?: string;
  total_quantity?: number;
};

export const ORDER_STATUS_TO_KEY: Record<OrderStatusCode, ShipmentStatus> = {
  1: "pending",
  2: "assigned",
  3: "in_delivery",
  4: "awaiting_approval",
  5: "delivered",
  6: "delivered_price_changed",
  7: "partial_delivery",
  8: "refused_paid_shipping",
  9: "refused_no_payment",
  10: "customer_cancelled",
  11: "no_answer",
  12: "phone_off",
  15: "postponed",
};

export const ORDER_STATUS_OPTIONS = [
  { value: "1", label: "بانتظار التوزيع", code: 1 },
  { value: "2", label: "تم التعيين", code: 2 },
  { value: "3", label: "قيد التوصيل", code: 3 },
  { value: "4", label: "بانتظار الموافقة", code: 4 },
  { value: "5", label: "تم التسليم", code: 5 },
  { value: "6", label: "تم التسليم بتغيير سعر", code: 6 },
  { value: "7", label: "تسليم جزئي", code: 7 },
  { value: "8", label: "رفض + دفع رسوم الشحن", code: 8 },
  { value: "9", label: "رفض وعدم الدفع", code: 9 },
  { value: "10", label: "عميل ملغي", code: 10 },
  { value: "11", label: "لا يوجد رد", code: 11 },
  { value: "12", label: "الهاتف مغلق", code: 12 },
  { value: "15", label: "مؤجل", code: 15 },

  // Special case: has a return record
  { value: "returned", label: "مرتجع", code: null },
] as const;
export function formatAmount(value: number | null | undefined): string {
  if (value == null) return "—";
  return value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function approvalLabel(granted: 0 | 1 | null): string {
  if (granted === null) return "قيد المراجعة";
  return granted === 1 ? "موافق" : "مرفوض";
}

// ─── Stats endpoint ───────────────────────────────────────────────────────────

export interface OrderStatusStat {
  id: number;
  label_ar: string;
  count: number;
}

export interface ApiOrderStats {
  total: number;
  returned: number;
  statuses: OrderStatusStat[];
}

// ─── List endpoint wire shapes ────────────────────────────────────────────────

export interface ApiOrderStatusField {
  id: OrderStatusCode;
  label: string;
  color: string;
}

export interface ApiOrderListItem {
  order_id: string;
  reference_code: string;
  reference_no: string;
  display_company_name: string;
  notes: string | null;
  status: ApiOrderStatusField;
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
  company: { id: string; name: string };
  agent: { id: string; name: string } | null;
  amount: number;
  assigned_at: string | null;
  created_at: string;
}

export interface ApiOrdersListResponse {
  isSuccess: boolean;
  message: string;
  data: {
    items: ApiOrderListItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    has_more: boolean;
  };
}

// ─── Detail endpoint wire shapes ──────────────────────────────────────────────

export interface ApiOrderDetailStatus extends ApiOrderStatusField {
  is_terminal: boolean;
  requires_collection: boolean;
}

export interface ApiOrderDetailItem {
  description: string | null;
  total_quantity: number;
  delivered_quantity: number | null;
  returned_quantity: number | null;
}

export interface ApiOrderDetailFinancials {
  original_amount: number;
  approved_amount: number | null;
  collected_amount: number | null;
  shipping_fee: number | null;
  commission_amount: number | null;
  net_due_company: number | null;
  is_settled: boolean;
}

export interface ApiOrderDetailStatusHistoryEntry {
  from_status_id: OrderStatusCode | null;
  from_label: string | null;
  to_status_id: OrderStatusCode;
  to_label: string;
  changed_by: string | null;
  notes: string | null;
  changed_at: string;
}

export interface ApiOrderDetailData {
  order_id: string;
  reference_code: string;
  reference_no: string;
  display_company_name: string;
  notes: string | null;
  status: ApiOrderDetailStatus;
  customer: { name: string; phone: string; phone_alt: string | null };
  address: {
    governorate_id: string;
    governorate: string;
    city_id: string | null;
    city: string | null;
    address_line: string;
  };
  financials: ApiOrderDetailFinancials;
  items: ApiOrderDetailItem;
  schedule: OrderDetailSchedule;
  company: { id: string; name: string; phone: string };
  agent: { id: string; name: string; phone: string } | null;
  status_history: ApiOrderDetailStatusHistoryEntry[];
  proofs: OrderDeliveryProof[];
  assigned_at: string | null;
  delivered_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApiOrderDetailResponse {
  isSuccess: boolean;
  message: string;
  data: ApiOrderDetailData;
}

// ─── Normalisers ──────────────────────────────────────────────────────────────

export function normaliseListItem(raw: ApiOrderListItem): OrderListItem {
  return {
    order: {
      order_id: raw.order_id,
      reference_no: raw.reference_no,
      internal_code: raw.reference_code,
      shipping_company_id: raw.company.id,
      delivery_agent_id: raw.agent?.id ?? null,
      status: raw.status.id,
      assigned_at: raw.assigned_at,
      delivered_at: null,
      deleted_at: null,
      created_at: raw.created_at,
      updated_at: raw.created_at,
    },
    customer_name: raw.customer.name,
    customer_phone: raw.customer.phone,
    governorate_name: raw.address.governorate,
    city_name: raw.address.city ?? "—",
    company_name: raw.company.name,
    agent_name: raw.agent?.name ?? null,
    original_amount: raw.amount,
    collected_amount: null,
    status_key: ORDER_STATUS_TO_KEY[raw.status.id],
  };
}

export function normaliseDetail(raw: ApiOrderDetailData): OrderDetail {
  return {
    order: {
      order_id: raw.order_id,
      reference_no: raw.reference_no,
      internal_code: raw.reference_code,
      shipping_company_id: raw.company.id,
      delivery_agent_id: raw.agent?.id ?? null,
      status: raw.status.id,
      assigned_at: raw.assigned_at,
      delivered_at: raw.delivered_at,
      deleted_at: null,
      created_at: raw.created_at,
      updated_at: raw.updated_at,
    },
    customer_info: {
      order_customer_info_id: "",
      order_id: raw.order_id,
      customer_name: raw.customer.name,
      customer_phone: raw.customer.phone,
      phone_alt: raw.customer.phone_alt,
      deleted_at: null,
      created_at: raw.created_at,
      updated_at: raw.updated_at,
    },
    address: {
      order_address_id: "",
      order_id: raw.order_id,
      governorate_id: raw.address.governorate_id,
      city_id: raw.address.city_id,
      address_line: raw.address.address_line,
      deleted_at: null,
      created_at: raw.created_at,
      updated_at: raw.updated_at,
    },
    governorate_name: raw.address.governorate,
    city_name: raw.address.city ?? "—",
    notes: raw.notes,
    company_name: raw.company.name,
    company_phone: raw.company.phone,
    agent_name: raw.agent?.name ?? null,
    agent_phone: raw.agent?.phone ?? null,
    financials: {
      order_financial_id: "",
      order_id: raw.order_id,
      original_amount: raw.financials.original_amount,
      approved_amount: raw.financials.approved_amount,
      collected_amount: raw.financials.collected_amount,
      shipping_fee: raw.financials.shipping_fee,
      commission_amount: raw.financials.commission_amount,
      net_due_company: raw.financials.net_due_company,
      is_settled: raw.financials.is_settled ? 1 : 0,
      deleted_at: null,
      created_at: raw.created_at,
      updated_at: raw.updated_at,
    },
    items: [
      {
        order_item_id: "",
        order_id: raw.order_id,
        item_description: raw.items.description,
        total_quantity: raw.items.total_quantity,
        delivered_quantity: raw.items.delivered_quantity,
        returned_quantity: raw.items.returned_quantity,
        deleted_at: null,
        created_at: raw.created_at,
        updated_at: raw.updated_at,
      },
    ],
    approval: null,
    approved_by_name: null,
    schedule: raw.schedule,
    status_history: raw.status_history.map((h, i) => ({
      id: String(i),
      order_id: raw.order_id,
      from_status: h.from_status_id,
      to_status: h.to_status_id,
      changed_by: h.changed_by ?? "",
      changed_by_name: h.changed_by ?? "—",
      note: h.notes,
      created_at: h.changed_at,
    })),
    delivery_proofs: raw.proofs,
    status_key: ORDER_STATUS_TO_KEY[raw.status.id],
  };
}

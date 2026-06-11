import type { ShipmentStatus } from "@/components/dashboard/StatusBadge";

export type ApiResponse<T> = {
  isSuccess: boolean;
  message: string;
  data: T;
};

/** orders.status — TINYINT 1–12 */
export type OrderStatusCode = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

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

export type OrderDetail = {
  order: Order;
  customer_info: OrderCustomerInfo;
  address: OrderAddress;
  governorate_name: string;
  city_name: string;
  company_name: string;
  agent_name: string | null;
  financials: OrderFinancials;
  items: OrderItem[];
  approval: OrderApproval | null;
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
  3: "in_transit",
  4: "delivered",
  5: "partial_delivered",
  6: "refused_paid_shipping",
  7: "refused_no_payment",
  8: "postponed",
  9: "evading",
  10: "unsafe_area",
  11: "out_of_governorate",
  12: "returned",
};

export const ORDER_STATUS_OPTIONS: { value: string; label: string; code: OrderStatusCode }[] = [
  { value: "1", label: "بانتظار التعيين", code: 1 },
  { value: "2", label: "تم التعيين", code: 2 },
  { value: "3", label: "قيد التوصيل", code: 3 },
  { value: "4", label: "تم التسليم", code: 4 },
  { value: "5", label: "تسليم جزئي", code: 5 },
  { value: "6", label: "رفض + دفع الشحن", code: 6 },
  { value: "7", label: "رفض بدون دفع", code: 7 },
  { value: "8", label: "مؤجل", code: 8 },
  { value: "9", label: "تهرّب / مختفي", code: 9 },
  { value: "10", label: "منطقة غير آمنة", code: 10 },
  { value: "11", label: "خارج المحافظة", code: 11 },
  { value: "12", label: "مرتجع", code: 12 },
];

export function formatAmount(value: number | null | undefined): string {
  if (value == null) return "—";
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

export function approvalLabel(granted: 0 | 1 | null): string {
  if (granted === null) return "قيد المراجعة";
  return granted === 1 ? "موافق" : "مرفوض";
}

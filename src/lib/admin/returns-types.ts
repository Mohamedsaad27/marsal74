export type ApiResponse<T> = {
  isSuccess: boolean;
  message: string;
  data: T;
};

/** returns.return_status */
export type ReturnStatusCode = 1 | 2 | 3;

export type ReturnRecord = {
  return_id: string;
  return_ref: string;
  order_id: string;
  internal_code: string;
  delivery_agent_id: string;
  agent_name: string;
  shipping_company_id: string;
  company_name: string;
  returned_quantity: number;
  return_reason: string;
  return_status: ReturnStatusCode;
  received_at: string | null;
  returned_to_company_at: string | null;
  created_at: string;
  updated_at: string;
};

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
  return new Date(value).toLocaleString("", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

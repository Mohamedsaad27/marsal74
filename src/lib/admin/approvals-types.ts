export type ApiResponse<T> = {
  isSuccess: boolean;
  message: string;
  data: T;
};

export type PaginatedResponse<T> = {
  items: T[];
  type: string;
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
  has_more: boolean;
};

// ─── Wire shapes (from API) ───────────────────────────────────────────────────

export type ApprovalTypeCode = 1 | 2 | 3;
export type ApprovalStatusCode = 1 | 2 | 3 | 4;

/** Shape returned by GET /admin/approval-requests list & detail */
export type ApprovalRequestWire = {
  id: string;
  order_id: string;
  order_code: string;
  approval_type: { id: ApprovalTypeCode; label: string };
  approval_status: { id: ApprovalStatusCode; label: string };
  original_amount: number;
  requested_amount: number;
  reason: string;
  review_notes: string | null;
  expires_at: string | null;
  expires_in_minutes: number | null;
  requested_by: { id: string; name: string };
  reviewed_by: { id: string; name: string } | null;
  reviewed_at: string | null;
  order: {
    reference_code: string;
    company_name: string;
    agent_name: string;
    customer_name?: string;
    governorate?: string;
    city?: string;
  };
  created_at: string;
};

/** Stats from GET /admin/approval-requests/stats */
export type ApprovalStatsWire = {
  awaiting: number;
  urgent: number;
  approved: number;
  rejected: number;
  expired: number;
};

// ─── UI model (normalised) ────────────────────────────────────────────────────

export type ApprovalRequest = {
  approval_request_id: string;
  order_id: string;
  ref: string; // order_code / reference_code
  internal_code: string; // same — order reference
  approval_type: ApprovalTypeCode;
  approval_status: ApprovalStatusCode;
  original_amount: number;
  requested_amount: number;
  reason: string;
  review_notes: string | null;
  expires_at: string | null;
  expires_in_minutes: number | null;
  // requested_by flattened
  requested_by_id: string;
  requested_by_name: string;
  // reviewed_by flattened
  resolved_by: string | null;
  resolved_at: string | null;
  // order context
  company_name: string;
  agent_name: string;
  customer_name: string;
  governorate: string;
  city: string;
  created_at: string;
  updated_at: string;
};

export type ApprovalStats = {
  pending: number;
  urgent: number;
  approved: number;
  rejected: number;
  expired: number;
};

// ─── Normaliser ───────────────────────────────────────────────────────────────

export function normaliseApprovalRequest(w: ApprovalRequestWire): ApprovalRequest {
  return {
    approval_request_id: w.id,
    order_id: w.order_id,
    ref: w.order_code,
    internal_code: w.order?.reference_code ?? w.order_code,
    approval_type: w.approval_type.id,
    approval_status: w.approval_status.id,
    original_amount: w.original_amount,
    requested_amount: w.requested_amount,
    reason: w.reason,
    review_notes: w.review_notes,
    expires_at: w.expires_at,
    expires_in_minutes: w.expires_in_minutes,
    requested_by_id: w.requested_by.id,
    requested_by_name: w.requested_by.name,
    resolved_by: w.reviewed_by?.name ?? null,
    resolved_at: w.reviewed_at,
    company_name: w.order?.company_name ?? "—",
    agent_name: w.order?.agent_name ?? "—",
    customer_name: w.order?.customer_name ?? "—",
    governorate: w.order?.governorate ?? "—",
    city: w.order?.city ?? "—",
    created_at: w.created_at,
    updated_at: w.reviewed_at ?? w.created_at,
  };
}

export function normaliseStats(w: ApprovalStatsWire): ApprovalStats {
  return {
    pending: w.awaiting,
    urgent: w.urgent,
    approved: w.approved,
    rejected: w.rejected,
    expired: w.expired,
  };
}

// ─── Label / style helpers ────────────────────────────────────────────────────

export const APPROVAL_TYPE_OPTIONS: { value: string; label: string; code: ApprovalTypeCode }[] = [
  { value: "1", label: "تعديل سعر", code: 1 },
  { value: "2", label: "رسوم شحن", code: 2 },
  { value: "3", label: "تحصيل جزئي", code: 3 },
];

export const APPROVAL_STATUS_OPTIONS: { value: string; label: string; code: ApprovalStatusCode }[] =
  [
    { value: "1", label: "بانتظار الرد", code: 1 },
    { value: "2", label: "تمت الموافقة", code: 2 },
    { value: "3", label: "مرفوضة", code: 3 },
    { value: "4", label: "منتهية", code: 4 },
  ];

export function approvalTypeLabel(type: ApprovalTypeCode): string {
  return APPROVAL_TYPE_OPTIONS.find((o) => o.code === type)?.label ?? String(type);
}

export function approvalStatusLabel(status: ApprovalStatusCode): string {
  return APPROVAL_STATUS_OPTIONS.find((o) => o.code === status)?.label ?? String(status);
}

export function formatAmount(value: number): string {
  return value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function expiresInMinutes(expiresAt: string | null): number | null {
  if (!expiresAt) return null;
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return 0;
  return Math.ceil(diff / (1000 * 60));
}

export function formatExpiryCountdown(expiresAt: string | null): string {
  if (!expiresAt) return "—";
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return "منتهية";
  const totalMinutes = Math.ceil(diff / (1000 * 60));
  if (totalMinutes < 60) return `${totalMinutes} د`;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes > 0 ? `${hours} س ${minutes} د` : `${hours} س`;
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

export const approvalStatusStyles: Record<ApprovalStatusCode, string> = {
  1: "bg-warning/15 text-warning ring-warning/25",
  2: "bg-success/10 text-success ring-success/20",
  3: "bg-destructive/10 text-destructive ring-destructive/20",
  4: "bg-muted text-muted-foreground ring-border",
};

// ─── Review action payload ────────────────────────────────────────────────────

export type ReviewAction = "approve" | "reject";

export type ReviewPayload = {
  action: ReviewAction;
  review_notes: string;
};

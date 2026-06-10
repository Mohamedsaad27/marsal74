export type ApiResponse<T> = {
  isSuccess: boolean;
  message: string;
  data: T;
};

/** approval_requests.approval_type */
export type ApprovalTypeCode = 1 | 2 | 3;

/** approval_requests.approval_status */
export type ApprovalStatusCode = 1 | 2 | 3 | 4;

export type ApprovalRequest = {
  approval_request_id: string;
  ref: string;
  order_id: string;
  internal_code: string;
  shipping_company_id: string;
  company_name: string;
  approval_type: ApprovalTypeCode;
  original_amount: number;
  requested_amount: number;
  requested_by_id: string;
  requested_by_name: string;
  reason: string;
  approval_status: ApprovalStatusCode;
  expires_at: string | null;
  resolved_at: string | null;
  resolved_by: string | null;
  review_note: string | null;
  created_at: string;
  updated_at: string;
};

export type ApprovalHistoryAction = "created" | "approved" | "rejected" | "expired" | "comment";

export type ApprovalHistoryEntry = {
  id: string;
  approval_request_id: string;
  ref: string;
  action: ApprovalHistoryAction;
  actor_id: string;
  actor_name: string;
  actor_role: "agent" | "company" | "admin";
  note: string | null;
  from_status: ApprovalStatusCode | null;
  to_status: ApprovalStatusCode | null;
  created_at: string;
};

export const APPROVAL_TYPE_OPTIONS: { value: string; label: string; code: ApprovalTypeCode }[] = [
  { value: "1", label: "تعديل سعر", code: 1 },
  { value: "2", label: "رسوم شحن", code: 2 },
  { value: "3", label: "تحصيل جزئي", code: 3 },
];

export const APPROVAL_STATUS_OPTIONS: { value: string; label: string; code: ApprovalStatusCode }[] = [
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

export function approvalHistoryActionLabel(action: ApprovalHistoryAction): string {
  const map: Record<ApprovalHistoryAction, string> = {
    created: "إنشاء الطلب",
    approved: "موافقة",
    rejected: "رفض",
    expired: "انتهاء المهلة",
    comment: "ملاحظة",
  };
  return map[action];
}

export function actorRoleLabel(role: ApprovalHistoryEntry["actor_role"]): string {
  const map = { agent: "مندوب", company: "شركة شحن", admin: "إدارة" };
  return map[role];
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
  return new Date(value).toLocaleString("ar-EG", {
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

export const approvalHistoryActionStyles: Record<ApprovalHistoryAction, string> = {
  created: "bg-info/10 text-info",
  approved: "bg-success/10 text-success",
  rejected: "bg-destructive/10 text-destructive",
  expired: "bg-muted text-muted-foreground",
  comment: "bg-primary/10 text-primary",
};

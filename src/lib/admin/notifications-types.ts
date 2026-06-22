export type ApiResponse<T> = {
  isSuccess: boolean;
  message: string;
  data: T;
};

export type NotificationTypeCode = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type NotificationRecord = {
  id: string; // real API uses "id"
  type: { code: NotificationTypeCode; label: string };
  title_ar: string;
  body_ar: string;
  data: { order_id?: string } | null;
  is_read: boolean; // real API: boolean, not 0|1
  sent_via_fcm: boolean;
  created_at: string;
};

export type NotificationKpis = {
  approvals: number;
  collections: number;
  shipments: number;
  unread: number;
};

export type NotificationsListResponse = {
  kpis: NotificationKpis;
  items: NotificationRecord[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  has_more: boolean;
};

export type NotificationPreference = {
  notification_type: NotificationTypeCode;
  in_app_enabled: boolean;
  push_enabled: boolean;
  email_enabled: boolean;
};

export type NotificationPreferencesState = {
  preferences: NotificationPreference[];
  quiet_hours_enabled: boolean;
  quiet_hours_from: string;
  quiet_hours_to: string;
  sound_enabled: boolean;
  digest_enabled: boolean;
};

export const NOTIFICATION_TYPE_OPTIONS: {
  value: string;
  label: string;
  code: NotificationTypeCode;
}[] = [
  { value: "1", label: "طلب توصيل جديد", code: 1 },
  { value: "2", label: "تحديث حالة الطلب", code: 2 },
  { value: "3", label: "طلب موافقة على تغيير السعر", code: 3 },
  { value: "4", label: "بدأ توقيت رفض الاستلام", code: 4 },
  { value: "5", label: "انتهى وقت رفض الاستلام", code: 5 },
  { value: "6", label: "رسالة جديدة", code: 6 },
  { value: "7", label: "تم تحديث رقم الهاتف", code: 7 },
  { value: "8", label: "تذكير بموعد تأجيل التسليم", code: 8 },
];

export function notificationTypeLabel(code: NotificationTypeCode): string {
  return NOTIFICATION_TYPE_OPTIONS.find((o) => o.code === code)?.label ?? String(code);
}

export function formatDateTime(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-US", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  if (minutes < 1) return "الآن";
  if (minutes < 60) return `قبل ${minutes} دقيقة`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours === 1 ? "قبل ساعة" : `قبل ${hours} ساعة`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "أمس";
  if (days < 7) return `قبل ${days} أيام`;
  return formatDateTime(iso);
}

export const notificationTypeStyles: Record<
  NotificationTypeCode,
  { iconTone: string; badge: string }
> = {
  1: { iconTone: "bg-info text-white", badge: "bg-info/10 text-info" },
  2: { iconTone: "bg-primary text-white", badge: "bg-primary/10 text-primary" },
  3: { iconTone: "bg-success text-white", badge: "bg-success/10 text-success" },
  4: { iconTone: "bg-warning text-warning-foreground", badge: "bg-warning/15 text-warning" },
  5: { iconTone: "bg-accent text-accent-foreground", badge: "bg-accent text-accent-foreground" },
  6: {
    iconTone: "bg-destructive/90 text-destructive-foreground",
    badge: "bg-destructive/10 text-destructive",
  },
  7: { iconTone: "bg-muted-foreground text-white", badge: "bg-muted text-muted-foreground" },
  8: { iconTone: "bg-orange-500 text-white", badge: "bg-orange-100 text-orange-600" },
};

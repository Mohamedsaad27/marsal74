export type ApiResponse<T> = {
  isSuccess: boolean;
  message: string;
  data: T;
};

/** notifications.notification_type */
export type NotificationTypeCode = 1 | 2 | 3 | 4 | 5 | 6 | 7;

/** notifications.channel */
export type NotificationChannel = "in_app" | "push";

export type PushDeliveryStatus = "queued" | "sent" | "delivered" | "failed";

export type NotificationRecord = {
  notification_id: string;
  notification_type: NotificationTypeCode;
  channel: NotificationChannel;
  title: string;
  body: string;
  reference_code: string | null;
  action_url: string | null;
  action_label: string | null;
  is_read: 0 | 1;
  read_at: string | null;
  sent_at: string;
  push_status: PushDeliveryStatus | null;
  device_hint: string | null;
  created_at: string;
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
  filterKey: string;
}[] = [
  { value: "1", label: "شحنات", code: 1, filterKey: "shipment" },
  { value: "2", label: "مناديب", code: 2, filterKey: "courier" },
  { value: "3", label: "تحصيلات", code: 3, filterKey: "payment" },
  { value: "4", label: "موافقات", code: 4, filterKey: "approval" },
  { value: "5", label: "تسويات", code: 5, filterKey: "settlement" },
  { value: "6", label: "مرتجعات", code: 6, filterKey: "return" },
  { value: "7", label: "نظام", code: 7, filterKey: "system" },
];

export function notificationTypeLabel(type: NotificationTypeCode): string {
  return NOTIFICATION_TYPE_OPTIONS.find((o) => o.code === type)?.label ?? String(type);
}

export function pushStatusLabel(status: PushDeliveryStatus): string {
  const map: Record<PushDeliveryStatus, string> = {
    queued: "في الانتظار",
    sent: "تم الإرسال",
    delivered: "تم التسليم",
    failed: "فشل الإرسال",
  };
  return map[status];
}

export function formatDateTime(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("", {
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
};

export const pushStatusStyles: Record<PushDeliveryStatus, string> = {
  queued: "bg-muted text-muted-foreground",
  sent: "bg-info/10 text-info",
  delivered: "bg-success/10 text-success",
  failed: "bg-destructive/10 text-destructive",
};

export function getDefaultPreferences(): NotificationPreferencesState {
  return {
    preferences: NOTIFICATION_TYPE_OPTIONS.map((o) => ({
      notification_type: o.code,
      in_app_enabled: true,
      push_enabled: o.code !== 7,
      email_enabled: o.code === 1 || o.code === 4 || o.code === 5,
    })),
    quiet_hours_enabled: false,
    quiet_hours_from: "22:00",
    quiet_hours_to: "07:00",
    sound_enabled: true,
    digest_enabled: false,
  };
}

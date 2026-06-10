import { DEFAULT_PREFERENCES, NOTIFICATIONS } from "@/lib/admin/notifications-data";
import type {
  ApiResponse,
  NotificationPreferencesState,
  NotificationRecord,
  NotificationTypeCode,
} from "@/lib/admin/notifications-types";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let notificationStore = NOTIFICATIONS.map((item) => ({ ...item }));
let preferencesStore: NotificationPreferencesState = {
  ...DEFAULT_PREFERENCES,
  preferences: DEFAULT_PREFERENCES.preferences.map((p) => ({ ...p })),
};

export async function fetchNotifications(): Promise<ApiResponse<NotificationRecord[]>> {
  await delay(350);
  return {
    isSuccess: true,
    message: "تمت العملية بنجاح",
    data: notificationStore
      .map((item) => ({ ...item }))
      .sort((a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime()),
  };
}

export async function fetchNotificationPreferences(): Promise<ApiResponse<NotificationPreferencesState>> {
  await delay(250);
  return {
    isSuccess: true,
    message: "تمت العملية بنجاح",
    data: {
      ...preferencesStore,
      preferences: preferencesStore.preferences.map((p) => ({ ...p })),
    },
  };
}

export async function markNotificationRead(notificationId: string): Promise<ApiResponse<NotificationRecord>> {
  await delay(200);
  const index = notificationStore.findIndex((n) => n.notification_id === notificationId);
  if (index === -1) {
    return { isSuccess: false, message: "الإشعار غير موجود", data: null as unknown as NotificationRecord };
  }

  const now = new Date().toISOString();
  notificationStore[index] = {
    ...notificationStore[index],
    is_read: 1,
    read_at: now,
  };

  return {
    isSuccess: true,
    message: "تم تعليم الإشعار كمقروء",
    data: { ...notificationStore[index] },
  };
}

export async function markAllNotificationsRead(): Promise<ApiResponse<{ count: number }>> {
  await delay(400);
  const now = new Date().toISOString();
  let count = 0;

  notificationStore = notificationStore.map((item) => {
    if (item.is_read === 0) {
      count += 1;
      return { ...item, is_read: 1 as const, read_at: now };
    }
    return item;
  });

  return {
    isSuccess: true,
    message: `تم تعليم ${count} إشعار كمقروء`,
    data: { count },
  };
}

export async function deleteReadNotifications(): Promise<ApiResponse<{ count: number }>> {
  await delay(350);
  const before = notificationStore.length;
  notificationStore = notificationStore.filter((n) => n.is_read === 0);
  const count = before - notificationStore.length;
  return {
    isSuccess: true,
    message: `تم حذف ${count} إشعار مقروء`,
    data: { count },
  };
}

export async function saveNotificationPreferences(
  prefs: NotificationPreferencesState,
): Promise<ApiResponse<NotificationPreferencesState>> {
  await delay(500);
  preferencesStore = {
    ...prefs,
    preferences: prefs.preferences.map((p) => ({ ...p })),
  };
  return {
    isSuccess: true,
    message: "تم حفظ تفضيلات الإشعارات (واجهة تصميمية)",
    data: {
      ...preferencesStore,
      preferences: preferencesStore.preferences.map((p) => ({ ...p })),
    },
  };
}

export function computeNotificationKpis(items: NotificationRecord[]) {
  return {
    total: items.length,
    unread: items.filter((n) => n.is_read === 0).length,
    push: items.filter((n) => n.channel === "push").length,
    pushUnread: items.filter((n) => n.channel === "push" && n.is_read === 0).length,
    pushFailed: items.filter((n) => n.push_status === "failed").length,
    byType: (type: NotificationTypeCode) => items.filter((n) => n.notification_type === type).length,
  };
}

export function filterNotifications(
  items: NotificationRecord[],
  opts: {
    readTab?: "all" | "unread" | "read";
    typeFilter?: string;
    channel?: "all" | "push" | "in_app";
    search?: string;
  },
): NotificationRecord[] {
  return items.filter((item) => {
    if (opts.readTab === "unread" && item.is_read === 1) return false;
    if (opts.readTab === "read" && item.is_read === 0) return false;
    if (opts.typeFilter && opts.typeFilter !== "all" && String(item.notification_type) !== opts.typeFilter) {
      return false;
    }
    if (opts.channel === "push" && item.channel !== "push") return false;
    if (opts.channel === "in_app" && item.channel !== "in_app") return false;
    if (opts.search?.trim()) {
      const q = opts.search.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.body.toLowerCase().includes(q) ||
        (item.reference_code ?? "").toLowerCase().includes(q)
      );
    }
    return true;
  });
}

import type {
  ApiResponse,
  NotificationPreferencesState,
  NotificationRecord,
  NotificationsListResponse,
  NotificationTypeCode,
} from "@/lib/admin/notifications-types";
import { BASE_URL } from "../utils";
import { getAccessToken } from "../auth/Auth.api";

function authHeaders(): HeadersInit {
  const token = getAccessToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(res: Response): Promise<ApiResponse<T>> {
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.message ?? `HTTP ${res.status}`);
  }
  return json as ApiResponse<T>;
}

// ─── Notifications List (paginated) ────────────────────────────────────────

export async function fetchNotifications(
  page = 1,
  per_page = 15,
): Promise<ApiResponse<NotificationsListResponse>> {
  const url = new URL(`${BASE_URL}/notifications`);
  url.searchParams.set("page", String(page));
  url.searchParams.set("per_page", String(per_page));

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: authHeaders(),
  });

  return handleResponse<NotificationsListResponse>(res);
}

// ─── Unread Count ───────────────────────────────────────────────────────────

export async function fetchUnreadCount(): Promise<number> {
  const res = await fetch(`${BASE_URL}/notifications/unread-count`, {
    method: "GET",
    headers: authHeaders(),
  });
  const json = await res.json();
  return json?.data?.unread ?? 0;
}

// ─── Mark Single as Read ────────────────────────────────────────────────────

export async function markNotificationRead(
  notificationId: string,
): Promise<ApiResponse<NotificationRecord>> {
  const res = await fetch(`${BASE_URL}/notifications/${notificationId}/read`, {
    method: "POST",
    headers: authHeaders(),
  });
  return handleResponse<NotificationRecord>(res);
}

// ─── Mark All as Read ───────────────────────────────────────────────────────

export async function markAllNotificationsRead(): Promise<ApiResponse<{ count: number }>> {
  const res = await fetch(`${BASE_URL}/notifications/read-all`, {
    method: "POST",
    headers: authHeaders(),
  });
  return handleResponse<{ count: number }>(res);
}

// ─── Delete Read Notifications ──────────────────────────────────────────────

export async function deleteReadNotifications(): Promise<ApiResponse<{ count: number }>> {
  const res = await fetch(`${BASE_URL}/notifications/read`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return handleResponse<{ count: number }>(res);
}

// ─── FCM Token Registration ─────────────────────────────────────────────────

// export async function registerFcmToken(fcmToken: string): Promise<void> {
//   await fetch(`${BASE_URL}/notifications/fcm-token`, {
//     method: "POST",
//     headers: authHeaders(),
//     body: JSON.stringify({ token: fcmToken }),
//   });
// }

// ─── Preferences (if backend supports it, else these are local stubs) ───────

// export async function fetchNotificationPreferences(): Promise
//   ApiResponse<NotificationPreferencesState>
// > {
//   // If your backend has this endpoint, replace with real fetch:
//   // const res = await fetch(`${BASE_URL}/api/v1/notifications/preferences`, { headers: authHeaders() });
//   // return handleResponse<NotificationPreferencesState>(res);

//   // Until backend provides it, return a safe default:
//   return {
//     isSuccess: true,
//     message: "تمت العملية بنجاح",
//     data: getDefaultPreferences(),
//   };
// }

export async function saveNotificationPreferences(
  prefs: NotificationPreferencesState,
): Promise<ApiResponse<NotificationPreferencesState>> {
  // Uncomment when backend is ready:
  // const res = await fetch(`${BASE_URL}/api/v1/notifications/preferences`, {
  //   method: "PUT",
  //   headers: authHeaders(),
  //   body: JSON.stringify(prefs),
  // });
  // return handleResponse<NotificationPreferencesState>(res);

  return {
    isSuccess: true,
    message: "تم حفظ التفضيلات (محلياً)",
    data: prefs,
  };
}

// ─── KPI helper (uses what the API already returns in data.kpis) ────────────
// No need to compute locally — just pass data.kpis from fetchNotifications()

export function filterNotifications(
  items: NotificationRecord[],
  opts: {
    readTab?: "all" | "unread" | "read";
    typeFilter?: string;
    search?: string;
  },
): NotificationRecord[] {
  return items.filter((item) => {
    if (opts.readTab === "unread" && item.is_read) return false;
    if (opts.readTab === "read" && !item.is_read) return false;

    if (
      opts.typeFilter &&
      opts.typeFilter !== "all" &&
      String(item.type.code) !== opts.typeFilter
    ) {
      return false;
    }

    if (opts.search?.trim()) {
      const q = opts.search.toLowerCase();
      return item.title_ar.toLowerCase().includes(q) || item.body_ar.toLowerCase().includes(q);
    }

    return true;
  });
}

function getDefaultPreferences(): NotificationPreferencesState {
  const codes: NotificationTypeCode[] = [1, 2, 3, 4, 5, 6, 7, 8];
  return {
    preferences: codes.map((code) => ({
      notification_type: code,
      in_app_enabled: true,
      push_enabled: code !== 7,
      email_enabled: ([1, 4, 5] as NotificationTypeCode[]).includes(code),
    })),
    quiet_hours_enabled: false,
    quiet_hours_from: "22:00",
    quiet_hours_to: "07:00",
    sound_enabled: true,
    digest_enabled: false,
  };
}

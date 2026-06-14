import { User } from "../types/Auth";
import { BASE_URL } from "../utils";
import { safeStorage } from "../utils";
export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;

  user: {
    user_id: string;
    name: string;
    email: string;
    phone: string;
    whatsapp_support_phone: string;
    account_type: string;
    is_active: boolean;
    roles: string[];
    shipping_company: unknown | null;
    staff_member: {
      staff_member_id: string;
      department: string;
      job_title: string;
    } | null;
    delivery_agent: unknown | null;
    last_login_at: string;
    created_at: string;
  };
}

/* =========================
   API
========================= */

export async function login(identifier: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier, password }),
  });

  const json = await res.json();

  if (!res.ok || !json.isSuccess) {
    throw new Error(json.message ?? "فشل تسجيل الدخول");
  }

  return json.data as LoginResponse;
}

export async function logout(): Promise<void> {
  const token = getAccessToken();

  if (token) {
    await fetch(`${BASE_URL}/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  clearSession();
  location.href = "/login";
}

/* =========================
   SESSION MANAGEMENT
========================= */

// Auth.api.ts

export function saveSession(data: LoginResponse, remember: boolean): void {
  const expiresAt = Date.now() + Number(data.expires_in) * 1000;

  safeStorage.setItem("access_token", data.access_token, remember);
  safeStorage.setItem("token_type", data.token_type, remember);
  safeStorage.setItem("token_expires_at", String(expiresAt), remember);
  safeStorage.setItem("user", JSON.stringify(data.user), remember);
}

export function clearSession(): void {
  safeStorage.removeItem("access_token");
  safeStorage.removeItem("token_type");
  safeStorage.removeItem("token_expires_at");
  safeStorage.removeItem("user");
}

export function isSessionValid(): boolean {
  if (typeof window === "undefined") return true; // SSR: don't redirect

  try {
    const token = safeStorage.getItem("access_token");
    const expiresAt = safeStorage.getItem("token_expires_at");

    if (!token || !expiresAt) {
      clearSession();
      return false;
    }

    const valid = Date.now() < Number(expiresAt);
    if (!valid) clearSession();
    return valid;
  } catch {
    return false;
  }
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return safeStorage.getItem("access_token");
}

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null;

  const user = safeStorage.getItem("user");
  if (!user) return null;

  try {
    return JSON.parse(user);
  } catch {
    return null;
  }
}

// Delete hydrateSession and getCachedAuth entirely — they're not needed
/* =========================
   HELPERS
========================= */

/* =========================
   HYDRATION CACHE
========================= */

let cachedAuth: boolean | null = null;

export function hydrateSession(): boolean {
  const token = safeStorage.getItem("access_token");
  const expiresAt = safeStorage.getItem("token_expires_at");
  cachedAuth = !!token && !!expiresAt && Date.now() < Number(expiresAt);
  return cachedAuth;
}

export function getCachedAuth() {
  return cachedAuth;
}

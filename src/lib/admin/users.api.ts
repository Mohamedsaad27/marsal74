import { BASE_URL } from "../utils";
import { getAccessToken } from "../auth/Auth.api";
import { StaffMemberAddress } from "./staff-members-types";
// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserRole {
  name: string;
  label: string;
}

export interface StaffMember {
  id: string;
  department: string;
  job_title: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ShippingCompany {
  id: string;
  [key: string]: unknown;
}

export interface DeliveryAgent {
  id: string;
  [key: string]: unknown;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender: string | null;
  avatar: string | null;
  welcome_whatsapp_url: string | null;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  role: UserRole;
  shipping_company: ShippingCompany | null;
  delivery_agent: DeliveryAgent | null;
  staff_member: StaffMember | null;
  addresses: StaffMemberAddress[];
}

export interface UserCounts {
  total: number;
  super_admin: number;
  staff_member: number;
  shipping_company: number;
  delivery_agent: number;
}

export interface UsersListResponse {
  isSuccess: boolean;
  message: string;
  data: {
    counts: UserCounts;
    items: AdminUser[];
    type: string;
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    has_more: boolean;
  };
}

export interface CreateUserPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  type: string; // "staff_member" | "delivery_agent" | "shipping_company"
  role: string; // same value as type
  profile: Record<string, unknown>;
  address: StaffMemberAddress;
}

export interface UpdateUserPayload {
  name: string;
  email: string;
  phone: string;
  gender?: string;
  roles: string[];
  profile?: Record<string, unknown>;
  address: StaffMemberAddress;
}

export interface ChangePasswordPayload {
  password: string;
  password_confirmation: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  baseURL?: string,
): Promise<T> {
  const token = getAccessToken();

  const isFormData = options.body instanceof FormData;

  const res = await fetch(`${baseURL ?? BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(!isFormData && { "Content-Type": "application/json" }),
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error((errorBody as { message?: string }).message ?? `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}
// ─── Users API ────────────────────────────────────────────────────────────────

export const usersApi = {
  /**
   * List users with server-side pagination, search, and filters.
   */
  list(params: {
    page?: number;
    per_page?: number;
    search?: string;
    role?: string;
    is_active?: "" | "0" | "1";
  }): Promise<UsersListResponse> {
    const { page = 1, per_page = 15, search = "", role = "", is_active = "" } = params;
    const qs = new URLSearchParams({
      page: String(page),
      per_page: String(per_page),
      search,
      role,
      is_active,
    });
    return apiFetch<UsersListResponse>(`/admin/users?${qs}`);
  },

  /**
   * Create a new user.
   */
  create(
    payload: CreateUserPayload,
  ): Promise<{ isSuccess: boolean; message: string; data: AdminUser }> {
    return apiFetch(`/admin/users`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Update an existing user.
   */
  update(
    userId: string,
    payload: UpdateUserPayload,
  ): Promise<{ isSuccess: boolean; message: string; data: AdminUser }> {
    return apiFetch(`/admin/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Toggle active/inactive status.
   */
  toggleStatus(userId: string): Promise<{ isSuccess: boolean; message: string }> {
    return apiFetch(`/admin/users/${userId}/toggle-status`, {
      method: "PATCH",
    });
  },

  /**
   * Delete a user.
   */
  delete(userId: string): Promise<{ isSuccess: boolean; message: string }> {
    return apiFetch(`/admin/users/${userId}`, { method: "DELETE" });
  },
  /**
   * Delete multiple users.
   */
  bulkDelete(ids: string[]): Promise<{ isSuccess: boolean; message: string }> {
    return apiFetch(`/admin/users`, {
      method: "DELETE",
      body: JSON.stringify({ ids }),
    });
  },
  /**
   * Change a user's password.
   */
  changePassword(
    userId: string,
    payload: ChangePasswordPayload,
  ): Promise<{ isSuccess: boolean; message: string }> {
    return apiFetch(`/admin/users/${userId}/change-password`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Download the import template (returns a Blob for file-save).
   */
  async downloadImportTemplate(): Promise<void> {
    const token = getAccessToken();
    const res = await fetch(`${BASE_URL}/admin/users/import/template`, {
      headers: {
        Accept: "application/octet-stream",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users-import-template.xlsx";
    a.click();
    URL.revokeObjectURL(url);
  },

  /**
   * Upload a filled-in import file.
   */
  import(file: File): Promise<{ isSuccess: boolean; message: string; data: unknown }> {
    const token = getAccessToken();
    const form = new FormData();
    form.append("file", file);
    return fetch(`${BASE_URL}/admin/users/import`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: form,
    }).then((r) => r.json());
  },
};

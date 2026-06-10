import { CreateStaffMemberPayload, StaffMember, StaffMembersResponse } from "./staff-members-types";
import { BASE_URL } from "../utils";
import { getAccessToken } from "../auth/Auth.api";
async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAccessToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
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

export const staffMembersApi = {
  list(params: {
    page?: number;
    per_page?: number;
    search?: string;
    is_active?: "" | "0" | "1";
    department?: string;
  }): Promise<StaffMembersResponse> {
    const { page = 1, per_page = 15, search = "", is_active = "", department = "" } = params;

    const qs = new URLSearchParams({
      page: String(page),
      per_page: String(per_page),
      search,
      is_active,
      department,
    });

    return apiFetch<StaffMembersResponse>(`/admin/staff-members?${qs}`);
  },

  create(payload: CreateStaffMemberPayload): Promise<{
    isSuccess: boolean;
    message: string;
    data: StaffMember;
  }> {
    return apiFetch(`/admin/staff-members`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};

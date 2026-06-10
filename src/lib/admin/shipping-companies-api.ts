import {
  CreateShippingCompanyPayload,
  ShippingCompanyUser,
  ShippingCompaniesResponse,
} from "@/lib/admin/shipping-companies-types";
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

export const shippingCompaniesApi = {
  /**
   * List shipping companies.
   */
  list(params: {
    page?: number;
    per_page?: number;
    search?: string;
    is_active?: "" | "0" | "1";
    city_id?: string;
  }): Promise<ShippingCompaniesResponse> {
    const { page = 1, per_page = 15, search = "", is_active = "", city_id = "" } = params;

    const qs = new URLSearchParams({
      page: String(page),
      per_page: String(per_page),
      search,
      is_active,
      city_id,
    });

    return apiFetch<ShippingCompaniesResponse>(`/admin/shipping-companies?${qs}`);
  },

  /**
   * Create shipping company.
   */
  create(payload: CreateShippingCompanyPayload): Promise<{
    isSuccess: boolean;
    message: string;
    data: ShippingCompanyUser;
  }> {
    return apiFetch(`/admin/shipping-companies`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};

import { CITIES, GOVERNORATES } from "@/lib/admin/locations-data";
import type {
  ApiResponse,
  City,
  CityPayload,
  Governorate,
  GovernoratePayload,
} from "@/lib/admin/locations-types";

import { BASE_URL } from "../utils";
import { getAccessToken } from "../auth/Auth.api";

const API_URL = `${BASE_URL}/admin/governorates`;
interface GovernoratesResponse {
  kpis: {
    total_governorates: number;
    total_active: number;
    total_covered_cities: number;
  };
  items: Governorate[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}
export interface CitiesResponse {
  items: City[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}
async function apiRequest<T>(url: string, options?: RequestInit): Promise<T> {
  const token = getAccessToken();

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options?.headers || {}),
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

export async function fetchGovernorates(
  page = 1,
  perPage = 28,
  search = "",
  isActive?: boolean,
): Promise<ApiResponse<GovernoratesResponse>> {
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
    search,
  });

  if (isActive !== undefined) {
    params.append("is_active", String(isActive));
  }

  return apiRequest(`${BASE_URL}/locations/governorates?${params.toString()}`);
}

export async function fetchGovernoratesKpis(): Promise<ApiResponse<GovernoratesResponse>> {
  return apiRequest(`${API_URL}?per_page=1`);
}
export async function fetchGovernorate(
  governorateId: string,
): Promise<ApiResponse<GovernoratesResponse>> {
  return apiRequest(`${API_URL}/${governorateId}`);
}

export async function createGovernorate(
  payload: GovernoratePayload,
): Promise<ApiResponse<GovernoratesResponse>> {
  return apiRequest(API_URL, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
export async function updateGovernorate(
  governorateId: string,
  payload: GovernoratePayload,
): Promise<ApiResponse<GovernoratesResponse>> {
  return apiRequest(`${API_URL}/${governorateId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function toggleGovernorateActive(
  governorateId: string,
): Promise<ApiResponse<GovernoratesResponse>> {
  return apiRequest(`${API_URL}/${governorateId}/toggle-status`, {
    method: "PATCH",
  });
}

export async function deleteGovernorate(
  governorateId: string,
): Promise<ApiResponse<GovernoratesResponse>> {
  return apiRequest(`${API_URL}/${governorateId}`, {
    method: "DELETE",
  });
}

export async function fetchGovernorateCities(
  governorateId: string,
  page = 1,
  perPage = 15,
  search = "",
  isActive?: boolean,
): Promise<ApiResponse<GovernoratesResponse>> {
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
    search,
  });

  if (isActive !== undefined) {
    params.append("is_active", String(isActive));
  }

  return apiRequest(`${API_URL}/${governorateId}/cities?${params.toString()}`);
}

const CITIES_API_URL = `${BASE_URL}/admin/cities`;

export interface CitiesResponse {
  kpis?: {
    total_cities: number;
    total_active: number;
    total_covered_governorates: number;
  };
  items: City[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

// New — for KPI cards only
export async function fetchCitiesKpis(): Promise<ApiResponse<CitiesResponse>> {
  return apiRequest(`${CITIES_API_URL}?per_page=1`);
}

// Update fetchCities to use the locations endpoint (shows actual items)
export async function fetchCities(
  governorateId?: string,
  page = 1,
  perPage = 15,
  search = "",
  isActive?: boolean,
): Promise<ApiResponse<CitiesResponse>> {
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
    search,
  });

  if (isActive !== undefined) {
    params.append("is_active", String(isActive));
  }

  const url = governorateId
    ? `${BASE_URL}/locations/governorates/${governorateId}/cities?${params.toString()}`
    : `${CITIES_API_URL}?${params.toString()}`;
  return apiRequest(url);
}
export async function fetchCity(cityId: string): Promise<ApiResponse<CitiesResponse>> {
  return apiRequest(`${CITIES_API_URL}/${cityId}`);
}
export async function createCity(payload: CityPayload): Promise<ApiResponse<CitiesResponse>> {
  return apiRequest(CITIES_API_URL, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
export async function updateCity(
  cityId: string,
  payload: CityPayload,
): Promise<ApiResponse<CitiesResponse>> {
  return apiRequest(`${CITIES_API_URL}/${cityId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
export async function toggleCityActive(cityId: string): Promise<ApiResponse<CitiesResponse>> {
  return apiRequest(`${CITIES_API_URL}/${cityId}/toggle-status`, {
    method: "PATCH",
  });
}
export async function deleteCity(cityId: string): Promise<ApiResponse<unknown>> {
  return apiRequest(`${CITIES_API_URL}/${cityId}`, {
    method: "DELETE",
  });
}

import type {
  ApiResponse,
  CreateDepartmentPayload,
  Department,
  DepartmentsResponse,
} from "./departments-types";
import { getAccessToken } from "../../lib/auth/Auth.api";

const BASE_URL = "https://api.expres-pro.com";

function getHeaders() {
  const token = getAccessToken();

  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function fetchDepartments(
  search = "",
  is_active?: boolean,
  page = 1,
  per_page = 15,
): Promise<ApiResponse<DepartmentsResponse>> {
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(per_page),
    search,
  });

  if (is_active !== undefined) {
    params.append("is_active", String(is_active));
  }

  const res = await fetch(`${BASE_URL}/api/v1/admin/departments?${params.toString()}`, {
    headers: getHeaders(),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to fetch departments");
  }

  return data;
}

export async function fetchDepartment(id: string): Promise<ApiResponse<DepartmentsResponse>> {
  const res = await fetch(`${BASE_URL}/api/v1/admin/departments/${id}`, {
    headers: getHeaders(),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to fetch department");
  }

  return data;
}

export async function createDepartment(
  payload: CreateDepartmentPayload,
): Promise<ApiResponse<Department>> {
  const res = await fetch(`${BASE_URL}/api/v1/admin/departments`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to create department");
  }

  return data;
}

export async function updateDepartment(
  id: string,
  payload: CreateDepartmentPayload,
): Promise<ApiResponse<Department>> {
  const res = await fetch(`${BASE_URL}/api/v1/admin/departments/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to update department");
  }

  return data;
}

export async function deleteDepartment(id: string): Promise<ApiResponse<null>> {
  const res = await fetch(`${BASE_URL}/api/v1/admin/departments/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to delete department");
  }

  return data;
}

export async function restoreDepartment(id: string): Promise<ApiResponse<null>> {
  const res = await fetch(`${BASE_URL}/api/v1/admin/departments/${id}/restore`, {
    method: "POST",
    headers: getHeaders(),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to restore department");
  }

  return data;
}

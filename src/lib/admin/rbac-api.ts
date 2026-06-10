import type { ApiListResponse, Permission, Role } from "@/lib/admin/rbac-types";
import { RBAC_PERMISSIONS, RBAC_ROLES } from "@/lib/admin/rbac-data";
import { BASE_URL } from "@/lib/utils";
import { getAccessToken } from "../auth/Auth.api";
import { ApiResponse } from "./orders-types";
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function cloneRoles(roles: Role[]): Role[] {
  return roles.map((role) => ({
    ...role,
    permissions: role.permissions.map((permission) => ({ ...permission })),
  }));
}

function clonePermissions(permissions: Permission[]): Permission[] {
  return permissions.map((permission) => ({ ...permission }));
}

export async function fetchRoles(): Promise<ApiListResponse<Role>> {
  const token = getAccessToken();

  const response = await fetch(`${BASE_URL}/admin/roles`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch roles");
  }

  return response.json();
}

export async function fetchPermissions(): Promise<ApiListResponse<Permission>> {
  const token = getAccessToken();

  const response = await fetch(`${BASE_URL}/admin/permissions`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch permissions");
  }

  return response.json();
}

export async function saveRole(role: Role): Promise<ApiListResponse<Role>> {
  const isCreate = !role.id;

  const roleResponse = await fetch(
    isCreate ? `${BASE_URL}/admin/roles` : `${BASE_URL}/admin/roles/${role.id}`,
    {
      method: isCreate ? "POST" : "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify({
        name: role.name,
      }),
    },
  );

  if (!roleResponse.ok) {
    throw new Error(isCreate ? "فشل إنشاء الدور" : "فشل تحديث الدور");
  }

  const savedRole = await roleResponse.json();

  // permissions endpoint only for edit/create after role exists
  const roleId = savedRole.data?.id ?? role.id;

  await fetch(`${BASE_URL}/admin/roles/${roleId}/permissions`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAccessToken()}`,
    },
    body: JSON.stringify({
      permissions: role.permissions.map((p) => p.name),
    }),
  });

  return {
    isSuccess: true,
    message: isCreate ? "تم إنشاء الدور بنجاح" : "تم تحديث الدور بنجاح",
    data: [savedRole.data],
  };
}

export async function deleteRole(roleId: number): Promise<ApiListResponse<Role>> {
  const response = await fetch(`${BASE_URL}/admin/roles/${roleId}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${getAccessToken()}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete role");
  }

  return response.json();
}

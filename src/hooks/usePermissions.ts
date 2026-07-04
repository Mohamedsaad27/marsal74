// src/hooks/usePermissions.ts
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { hasPermission } from "@/lib/auth/permissions";
import {
  permissionFor,
  type PermissionModule,
  type PermissionAction,
} from "@/lib/auth/permission-keys";

export function usePermissions() {
  const { user } = useCurrentUser();
  const permissions = user?.permissions ?? [];

  return {
    // raw check — still works if you ever need a one-off custom permission
    can: (required?: string | string[]) => !required || hasPermission(permissions, required),
    // convention-based check — module + action
    canDo: (module: PermissionModule, action: PermissionAction) => {
      const required = permissionFor(module, action);
      return !required || hasPermission(permissions, required);
    },
    permissions,
  };
}

import { redirect } from "@tanstack/react-router";
import { getCurrentUser, isSessionValid } from "@/lib/auth/Auth.api";
import { canAccessRoute } from "@/lib/auth/permissions";

export function requirePermission(pathname: string) {
  if (!isSessionValid()) {
    throw redirect({ to: "/login" });
  }

  const user = getCurrentUser();
  const permissions = user?.permissions ?? [];

  if (!canAccessRoute(pathname, permissions)) {
    throw redirect({ to: "/unauthorized" });
  }
}

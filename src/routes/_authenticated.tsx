import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";
import { isSessionValid, getCurrentUser } from "@/lib/auth/Auth.api";
import { canAccessRoute } from "@/lib/auth/permissions";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: ({ location }) => {
    if (!isSessionValid()) {
      throw redirect({ to: "/login" });
    }

    const user = getCurrentUser();
    const permissions = user?.permissions ?? [];

    if (!canAccessRoute(location.pathname, permissions)) {
      throw redirect({ to: "/unauthorized" });
    }
  },
  component: () => <Outlet />,
});

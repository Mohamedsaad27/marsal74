import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";
import { isSessionValid } from "@/lib/auth/Auth.api";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: () => {
    if (!isSessionValid()) {
      throw redirect({ to: "/login" });
    }
  },
  component: () => <Outlet />,
});

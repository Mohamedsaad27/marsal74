import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/shipments")({
  component: ShipmentsLayout,
});

function ShipmentsLayout() {
  return <Outlet />;
}

import type { NavItem, NavSection } from "@/components/layout/SidebarNavGroup";
import type { NavCategory } from "@/components/layout/nav-config";

/**
 * Maps each route to the permission(s) required to enter it.
 * Using the `.view` permission per module — a user with e.g. `settlements.view`
 * can see the settlements page; without it, both the sidebar link AND
 * the route itself are blocked.
 *
 * string[]  -> user needs at least ONE of these
 * omitted   -> always accessible to any authenticated user
 */
export const ROUTE_PERMISSIONS: Record<string, string | string[]> = {
  "/": "dashboard.view",
  "/shipments": "orders.view",
  "/approvals": "approval_requests.view",
  "/returns": "returns.view",
  "/collections": "collections.view",
  "/settlements": "settlements.view",
  "/companies": "shipping_companies.view",
  "/departments": "departments.view",
  "/couriers": "delivery_agents.view",
  "/staff-members": "staff_members.view",
  "/users": "users.view",
  "/roles": "roles.view",
  "/governorates": "governorates.view",
  "/cities": "governorates.view",
  "/notifications": "notifications.view",
  "/audit-log": "audit_logs.view",
  "/settings": "settings.view",
  "/reports": "reports.view",
  "/chat": "chat.view",
  "/tracking": "orders.view",
  // "/", "/profile", "/change-password" intentionally omitted — always visible
};

export function hasPermission(permissions: string[], required: string | string[]): boolean {
  const permSet = new Set(permissions);
  return Array.isArray(required) ? required.some((p) => permSet.has(p)) : permSet.has(required);
}

export function canAccessRoute(pathname: string, permissions: string[]): boolean {
  const matchedKey = Object.keys(ROUTE_PERMISSIONS).find(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
  if (!matchedKey) return true;
  return hasPermission(permissions, ROUTE_PERMISSIONS[matchedKey]);
}
/* ---------- Sidebar filtering (same as before) ---------- */

export function filterItems(items: NavItem[], permissions: string[]): NavItem[] {
  return items.filter((item) => canAccessRoute(item.url, permissions));
}

export function filterSection(section: NavSection, permissions: string[]): NavSection | null {
  const items = filterItems(section.items, permissions);
  return items.length ? { ...section, items } : null;
}

export function filterSections(sections: NavSection[], permissions: string[]): NavSection[] {
  return sections.map((s) => filterSection(s, permissions)).filter((s): s is NavSection => !!s);
}

export function filterCategory(category: NavCategory, permissions: string[]): NavCategory | null {
  const sections = filterSections(category.sections, permissions);
  return sections.length ? { ...category, sections } : null;
}

export function filterCategories(categories: NavCategory[], permissions: string[]): NavCategory[] {
  return categories.map((c) => filterCategory(c, permissions)).filter((c): c is NavCategory => !!c);
}

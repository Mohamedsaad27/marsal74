import type { NavItem, NavSection } from "@/components/layout/SidebarNavGroup";
import type { NavCategory } from "@/components/layout/nav-config";

/**
 * Maps a route's url to the permission(s) required to view it.
 * - string: user needs this exact permission
 * - string[]: user needs at least ONE of these permissions
 * - omitted: route is always visible to any authenticated user
 */
const ROUTE_PERMISSIONS: Record<string, string | string[]> = {
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
  // "/", "/profile" intentionally omitted — always visible
};

export function canAccessRoute(url: string, permissions: string[]): boolean {
  const required = ROUTE_PERMISSIONS[url];
  if (!required) return true; // no restriction configured -> visible to all

  const permSet = new Set(permissions);
  return Array.isArray(required) ? required.some((p) => permSet.has(p)) : permSet.has(required);
}

export function filterItems(items: NavItem[], permissions: string[]): NavItem[] {
  return items.filter((item) => canAccessRoute(item.url, permissions));
}

export function filterSection(section: NavSection, permissions: string[]): NavSection | null {
  const items = filterItems(section.items, permissions);
  if (items.length === 0) return null;
  return { ...section, items };
}

export function filterSections(sections: NavSection[], permissions: string[]): NavSection[] {
  return sections
    .map((s) => filterSection(s, permissions))
    .filter((s): s is NavSection => s !== null);
}

export function filterCategory(category: NavCategory, permissions: string[]): NavCategory | null {
  const sections = filterSections(category.sections, permissions);
  if (sections.length === 0) return null;
  return { ...category, sections };
}

export function filterCategories(categories: NavCategory[], permissions: string[]): NavCategory[] {
  return categories
    .map((c) => filterCategory(c, permissions))
    .filter((c): c is NavCategory => c !== null);
}

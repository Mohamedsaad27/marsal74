import type { PermissionGroup, Permission } from "@/lib/admin/rbac-types";

export function permissionLabel(permission: Permission): string {
  if (permission.label_ar && permission.label_ar !== permission.name) {
    return permission.label_ar;
  }
  return permission.label_en !== permission.name ? permission.label_en : permission.name;
}

export function groupLabel(permission: Permission): string {
  return permission.group_label_ar ?? permission.group;
}

export function groupPermissions(permissions: Permission[]): PermissionGroup[] {
  const map = new Map<string, PermissionGroup>();

  for (const permission of permissions) {
    const existing = map.get(permission.group);
    if (existing) {
      existing.permissions.push(permission);
      continue;
    }

    map.set(permission.group, {
      group: permission.group,
      groupLabel: groupLabel(permission),
      permissions: [permission],
    });
  }

  return Array.from(map.values())
    .map((entry) => ({
      ...entry,
      permissions: [...entry.permissions].sort((a, b) =>
        permissionLabel(a).localeCompare(permissionLabel(b), "ar"),
      ),
    }))
    .sort((a, b) => a.groupLabel.localeCompare(b.groupLabel, "ar"));
}

export function rolePermissionSummary(rolePermissions: Permission[]): string {
  const groups = groupPermissions(rolePermissions);
  if (groups.length === 0) return "لا توجد صلاحيات";

  const preview = groups.slice(0, 2).map((g) => `${g.groupLabel} (${g.permissions.length})`);
  if (groups.length <= 2) return preview.join(" · ");

  return `${preview.join(" · ")} · +${groups.length - 2} مجموعات`;
}

export function formatRoleName(name: string): string {
  return name.replace(/_/g, " ");
}

import { useMemo, useState } from "react";
import { Check, Search } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Permission } from "@/lib/admin/rbac-types";
import { groupPermissions, permissionLabel } from "@/lib/admin/rbac-utils";
import { cn } from "@/lib/utils";

type Props = {
  permissions: Permission[];
  selectedIds: number[];
  onChange: (next: number[]) => void;
  readOnly?: boolean;
  className?: string;
};

export function PermissionGroupsEditor({
  permissions,
  selectedIds,
  onChange,
  readOnly = false,
  className,
}: Props) {
  const [search, setSearch] = useState("");
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const groups = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = query
      ? permissions.filter((permission) => {
          const label = permissionLabel(permission).toLowerCase();
          return (
            label.includes(query) ||
            permission.name.toLowerCase().includes(query) ||
            permission.group.toLowerCase().includes(query)
          );
        })
      : permissions;

    return groupPermissions(filtered);
  }, [permissions, search]);

  const togglePermission = (permissionId: number) => {
    if (readOnly) return;
    if (selectedSet.has(permissionId)) {
      onChange(selectedIds.filter((id) => id !== permissionId));
      return;
    }
    onChange([...selectedIds, permissionId]);
  };

  const toggleGroup = (groupPermissionIds: number[]) => {
    if (readOnly) return;
    const allSelected = groupPermissionIds.every((id) => selectedSet.has(id));
    if (allSelected) {
      onChange(selectedIds.filter((id) => !groupPermissionIds.includes(id)));
      return;
    }
    onChange([...new Set([...selectedIds, ...groupPermissionIds])]);
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 bg-muted/20 px-4 py-3">
        <div>
          <p className="text-sm font-bold">الصلاحيات المحددة</p>
          <p className="text-xs text-muted-foreground">
            {selectedIds.length} من {permissions.length} صلاحية
          </p>
        </div>
        <Badge variant="secondary" className="rounded-lg px-3 py-1 text-xs font-bold">
          {selectedIds.length} / {permissions.length}
        </Badge>
      </div>

      <div className="relative">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث بالاسم العربي أو المفتاح..."
          className="rounded-xl pr-9"
          dir="rtl"
        />
      </div>

      <div className="space-y-3">
        {groups.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
            لا توجد صلاحيات مطابقة للبحث
          </div>
        ) : (
          groups.map((group) => {
            const groupIds = group.permissions.map((permission) => permission.id);
            const selectedInGroup = groupIds.filter((id) => selectedSet.has(id)).length;
            const allSelected = selectedInGroup === groupIds.length && groupIds.length > 0;
            const partiallySelected = selectedInGroup > 0 && !allSelected;

            return (
              <section
                key={group.group}
                className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-soft"
              >
                <div className="flex items-center justify-between gap-3 border-b border-border/60 bg-muted/25 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-bold">{group.groupLabel}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {selectedInGroup} / {groupIds.length} محددة
                    </p>
                  </div>
                  {!readOnly && (
                    <Button
                      type="button"
                      variant={allSelected ? "secondary" : "outline"}
                      size="sm"
                      className="shrink-0 rounded-lg text-xs"
                      onClick={() => toggleGroup(groupIds)}
                    >
                      {allSelected ? "إلغاء تحديد المجموعة" : partiallySelected ? "تحديد المتبقي" : "تحديد الكل"}
                    </Button>
                  )}
                </div>

                <div className="grid gap-2 p-3 sm:grid-cols-2">
                  {group.permissions.map((permission) => {
                    const checked = selectedSet.has(permission.id);
                    return (
                      <label
                        key={permission.id}
                        className={cn(
                          "flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-3 transition-colors",
                          checked
                            ? "border-primary/30 bg-primary/5"
                            : "border-border/60 bg-background hover:bg-muted/20",
                          readOnly && "cursor-default",
                        )}
                      >
                        {!readOnly ? (
                          <Checkbox
                            checked={checked}
                            onCheckedChange={() => togglePermission(permission.id)}
                            className="mt-0.5"
                          />
                        ) : (
                          <span
                            className={cn(
                              "mt-0.5 flex h-4 w-4 items-center justify-center rounded-sm border",
                              checked ? "border-primary bg-primary text-primary-foreground" : "border-input",
                            )}
                          >
                            {checked && <Check className="h-3 w-3" />}
                          </span>
                        )}
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold leading-snug">
                            {permissionLabel(permission)}
                          </span>
                          <span className="mt-0.5 block font-mono text-[10px] text-muted-foreground" dir="ltr">
                            {permission.name}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </section>
            );
          })
        )}
      </div>
    </div>
  );
}

export function PermissionGroupsPreview({
  permissions,
  onClick,
}: {
  permissions: Permission[];
  onClick?: () => void;
}) {
  const groups = groupPermissions(permissions);

  if (permissions.length === 0) {
    return <span className="text-xs text-muted-foreground">لا توجد صلاحيات</span>;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "max-w-md space-y-2 text-start",
        onClick && "rounded-xl border border-transparent px-1 py-1 transition-colors hover:border-primary/20 hover:bg-primary/5",
      )}
    >
      <div className="flex flex-wrap gap-1.5">
        {groups.slice(0, 3).map((group) => (
          <Badge key={group.group} variant="secondary" className="rounded-md text-[10px] font-medium">
            {group.groupLabel}
            <span className="ms-1 tabular-nums opacity-70">({group.permissions.length})</span>
          </Badge>
        ))}
        {groups.length > 3 && (
          <Badge variant="outline" className="rounded-md text-[10px]">
            +{groups.length - 3} مجموعات
          </Badge>
        )}
      </div>
      <p className="text-[11px] text-muted-foreground">
        {permissions.length} صلاحية · {groups.length} مجموعة
        {onClick && " · اضغط للعرض والتعديل"}
      </p>
    </button>
  );
}

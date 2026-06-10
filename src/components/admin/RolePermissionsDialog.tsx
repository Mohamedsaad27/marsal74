import { useEffect, useMemo, useState } from "react";
import { Loader2, Shield, UserPlus, PencilLine } from "lucide-react";
import { toast } from "sonner";
import { AdminDialogShell } from "@/components/admin/AdminDialogShell";
import { PermissionGroupsEditor } from "@/components/admin/PermissionGroupsEditor";
import { FormInput } from "@/components/admin/AdminFormFields";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Permission, Role } from "@/lib/admin/rbac-types";
import { formatRoleName } from "@/lib/admin/rbac-utils";
import { groupPermissions } from "@/lib/admin/rbac-utils";
import type { CrudMode } from "@/components/admin/use-admin-crud";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: CrudMode;
  role: Role | null;
  allPermissions: Permission[];
  onSave: (role: Role) => Promise<void>;
  loading?: boolean;
};

export function RolePermissionsDialog({
  open,
  onOpenChange,
  mode,
  role,
  allPermissions,
  onSave,
  loading = false,
}: Props) {
  const isEdit = mode === "edit";
  const [name, setName] = useState("");
  const [guardName, setGuardName] = useState("api");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  useEffect(() => {
    if (!open) return;
    setName(role?.name ?? "");
    setGuardName(role?.guard_name ?? "api");
    setSelectedIds(role?.permissions.map((permission) => permission.id) ?? []);
  }, [open, role]);

  const selectedPermissions = useMemo(
    () => allPermissions.filter((permission) => selectedIds.includes(permission.id)),
    [allPermissions, selectedIds],
  );

  const groupedSelected = useMemo(
    () => groupPermissions(selectedPermissions),
    [selectedPermissions],
  );

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("اسم الدور مطلوب");
      return;
    }

    const permissions = allPermissions.filter((permission) => selectedIds.includes(permission.id));
    await onSave({
      id: role?.id ?? 0,
      name: name.trim(),
      guard_name: guardName.trim() || "api",
      permissions,
      created_at: role?.created_at,
    });
  };

  return (
    <AdminDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title={
        isEdit
          ? `إدارة صلاحيات ${role?.name ? formatRoleName(role.name) : "الدور"}`
          : "إنشاء دور جديد"
      }
      description="عرض وتعديل صلاحيات الدور مجمّعة حسب الوحدة مع التسميات العربية"
      icon={isEdit ? PencilLine : UserPlus}
      badge={isEdit ? "عرض وتعديل" : "إضافة"}
      size="2xl"
      footer={
        <>
          <Button
            className="rounded-xl gradient-brand px-6 shadow-glow"
            onClick={handleSave}
            disabled={loading}
          >
            {loading && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
            {isEdit ? "حفظ الصلاحيات" : "إنشاء الدور"}
          </Button>
          <Button variant="outline" className="rounded-xl px-5" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="grid gap-4 rounded-2xl border border-border/70 bg-card p-4 shadow-soft sm:grid-cols-2">
          <FormInput
            label="اسم الدور (name)"
            required
            placeholder="operations_manager"
            value={name}
            onChange={(e) => setName(e.target.value)}
            dir="ltr"
            className="font-mono"
          />
          <FormInput
            label="guard_name"
            disabled
            value={guardName}
            onChange={(e) => setGuardName(e.target.value)}
            dir="ltr"
            className="font-mono"
          />
        </div>

        {isEdit && role && (
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Shield className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold">{formatRoleName(role.name)}</p>
                <p className="font-mono text-xs text-muted-foreground" dir="ltr">
                  {role.name}
                </p>
              </div>
              <Badge variant="outline" className="rounded-md font-mono text-[10px]">
                {role.guard_name}
              </Badge>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {groupedSelected.map((group) => (
                <Badge key={group.group} className="rounded-md text-[10px]">
                  {group.groupLabel} ({group.permissions.length})
                </Badge>
              ))}
            </div>
          </div>
        )}

        <PermissionGroupsEditor
          permissions={allPermissions}
          selectedIds={selectedIds}
          onChange={setSelectedIds}
        />
      </div>
    </AdminDialogShell>
  );
}

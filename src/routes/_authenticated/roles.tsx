import { useCallback, useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { ConfirmActionDialog } from "@/components/admin/ConfirmActionDialog";
import { RolePermissionsDialog } from "@/components/admin/RolePermissionsDialog";
import { PermissionGroupsPreview } from "@/components/admin/PermissionGroupsEditor";
import { RowActions } from "@/components/admin/RowActions";
import { deleteRole, fetchPermissions, fetchRoles, saveRole } from "@/lib/admin/rbac-api";
import type { Permission, Role } from "@/lib/admin/rbac-types";
import { formatRoleName } from "@/lib/admin/rbac-utils";
import type { ConfirmAction, CrudMode } from "@/components/admin/use-admin-crud";
import { KeyRound, Loader2, Shield } from "lucide-react";

export const Route = createFileRoute("/_authenticated/roles")({
  component: RolesPage,
});

function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<CrudMode>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const pageSize = 10;

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [rolesResponse, permissionsResponse] = await Promise.all([
        fetchRoles(),
        fetchPermissions(),
      ]);
      if (!rolesResponse.isSuccess || !permissionsResponse.isSuccess) {
        throw new Error("تعذر تحميل الأدوار والصلاحيات");
      }
      setRoles(rolesResponse.data);
      setAllPermissions(permissionsResponse.data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل تحميل البيانات");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filteredRows = roles.filter((role) => {
    if (!search.trim()) return true;
    const query = search.toLowerCase();
    return (
      role.name.toLowerCase().includes(query) ||
      role.permissions.some(
        (permission) =>
          permission.name.toLowerCase().includes(query) ||
          permission.label_ar.toLowerCase().includes(query),
      )
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const paginatedRows = filteredRows.slice((page - 1) * pageSize, page * pageSize);

  const openCreate = () => {
    setDialogMode("create");
    setEditingRole(null);
    setDialogOpen(true);
  };

  const openRoleDialog = (role: Role) => {
    setDialogMode("edit");
    setEditingRole(role);
    setDialogOpen(true);
  };

  const handleSaveRole = async (role: Role) => {
    setSaving(true);

    try {
      const response = await saveRole(role);

      if (!response.isSuccess) {
        throw new Error(response.message);
      }

      const rolesResponse = await fetchRoles();

      if (!rolesResponse.isSuccess) {
        throw new Error(rolesResponse.message);
      }

      setRoles(rolesResponse.data);
      setDialogOpen(false);

      toast.success(response.message);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل حفظ الدور");
    } finally {
      setSaving(false);
    }
  };
  const requestDelete = (role: Role) => {
    setConfirmAction({
      title: "تأكيد حذف الدور",
      description: `هل أنت متأكد من حذف دور «${formatRoleName(role.name)}»؟`,
      confirmLabel: "حذف",
      variant: "destructive",
      onConfirm: async () => {
        try {
          const response = await deleteRole(role.id);

          if (!response.isSuccess) {
            throw new Error(response.message);
          }

          const rolesResponse = await fetchRoles();
          setRoles(rolesResponse.data);

          toast.success(response.message);
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "فشل حذف الدور");
        } finally {
          setConfirmAction(null);
        }
      },
    });
  };

  return (
    <AppShell>
      <AdminPageHeader
        title="الأدوار"
        tableName="الأدوار"
        description="إدارة الأدوار وصلاحياتها مع التسميات العربية لكل صلاحية"
        addLabel="إضافة دور"
        onAdd={openCreate}
        selectedCount={selectedIds.size}
        onBulkDelete={() => {}}
      />

      {loading ? (
        <div className="flex min-h-[280px] items-center justify-center rounded-2xl border border-border bg-card shadow-soft">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <AdminDataTable
          search={search}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          searchPlaceholder="بحث باسم الدور أو الصلاحية..."
          columns={[
            { key: "name", label: "الدور" },
            { key: "guard", label: "Guard" },
            { key: "perms", label: "الصلاحيات" },
            { key: "actions", label: "" },
          ]}
          rows={paginatedRows.map((role) => ({
            id: role.id,
            cells: [
              <div key="name">
                <p className="font-bold">{formatRoleName(role.name)}</p>
                <p className="font-mono text-[11px] text-muted-foreground" dir="ltr">
                  {role.name}
                </p>
              </div>,

              <PermissionGroupsPreview
                key="perms"
                permissions={role.permissions}
                onClick={() => openRoleDialog(role)}
              />,
              <RowActions
                key="actions"
                onEdit={() => openRoleDialog(role)}
                onDelete={() => requestDelete(role)}
              />,
            ],
          }))}
          selectedIds={selectedIds}
          onToggleSelect={(id) => {
            setSelectedIds((prev) => {
              const next = new Set(prev);
              if (next.has(id)) next.delete(id);
              else next.add(id);
              return next;
            });
          }}
          onToggleSelectAll={(ids) => {
            setSelectedIds((prev) => (prev.size === ids.length ? new Set() : new Set(ids)));
          }}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          totalCount={filteredRows.length}
        />
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {roles.map((role) => (
          <button
            key={role.id}
            type="button"
            onClick={() => openRoleDialog(role)}
            className="rounded-2xl border border-border bg-card p-4 text-start shadow-soft transition-colors hover:border-primary/30 hover:bg-primary/5"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold">{formatRoleName(role.name)}</p>
                <p className="text-xs text-muted-foreground">{role.permissions.length} صلاحية</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <RolePermissionsDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        role={editingRole}
        allPermissions={allPermissions}
        onSave={handleSaveRole}
        loading={saving}
      />

      <ConfirmActionDialog action={confirmAction} onOpenChange={() => setConfirmAction(null)} />
    </AppShell>
  );
}

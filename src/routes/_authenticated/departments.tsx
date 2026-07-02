import { useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminEntityDialog } from "@/components/admin/AdminEntityDialog";
import { ConfirmActionDialog } from "@/components/admin/ConfirmActionDialog";
import { AdminStatusBadge, activeBadge } from "@/components/admin/AdminStatusBadge";
import { RowActions } from "@/components/admin/RowActions";
import {
  FormInput,
  FormTextarea,
  FormSwitch,
  FormSelect,
} from "@/components/admin/AdminFormFields";
import { KpiCard } from "@/components/dashboard/KpiCard";
import {
  createDepartment,
  deleteDepartment,
  fetchDepartments,
  updateDepartment,
} from "../../lib/admin/departments-api";
import type { Department } from "@/lib/admin/departments-types";
import type { ConfirmAction, CrudMode } from "@/components/admin/use-admin-crud";
import { Building2, Loader2, Power, Users, UserCog } from "lucide-react";
import { type StaffMember } from "@/lib/admin/staff-members-types";
import { staffMembersApi } from "@/lib/admin/staff-members-api";

export const Route = createFileRoute("/_authenticated/departments")({
  component: DepartmentsPage,
});

type FormState = {
  id?: string;
  name_ar: string;
  name_en: string;
  description: string;
  manager_id: string;
  is_active: boolean;
};

function emptyForm(): FormState {
  return { name_ar: "", name_en: "", description: "", manager_id: "", is_active: true };
}

function DepartmentsPage() {
  const [items, setItems] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<CrudMode>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [members, setMembers] = useState<StaffMember[]>([]);

  const pageSize = 10;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchDepartments(
        search,
        statusFilter === "all" ? undefined : statusFilter === "active",
        page,
      );

      setItems(response.data.items);
      setKpis(response.data.kpis);
      setItems(response.data.items);
      if (!response.isSuccess) throw new Error(response.message);
      setItems(response.data.items);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل تحميل الأقسام");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const loadMembers = async () => {
      try {
        const response = await staffMembersApi.list({
          page: 1,
          per_page: 100,
          search: "",
          is_active: "",
          department: "",
        });

        if (response.isSuccess) {
          setMembers(response.data.items);
        }
      } catch (error) {
        console.error(error);
      }
    };

    void loadMembers();
  }, []);
  const memberOptions = useMemo(
    () =>
      members.map((member) => ({
        value: String(member.id),
        label: `${member.name}`,
      })),
    [members],
  );
  const filtered = useMemo(() => {
    return items.filter((d) => {
      if (statusFilter === "active" && d.is_active !== true) return false;
      if (statusFilter === "inactive" && d.is_active !== false) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        d.name_ar.toLowerCase().includes(q) ||
        d.name_en.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q)
      );
    });
  }, [items, search, statusFilter]);

  const paginatedRows = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const [kpis, setKpis] = useState({
    total_departments: 0,
    total_active: 0,
    total_members: 0,
  });

  const openCreate = () => {
    setDialogMode("create");
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const openEdit = (d: Department) => {
    setDialogMode("edit");
    setForm({
      id: d.id,
      name_ar: d.name_ar,
      name_en: d.name_en,
      description: d.description,
      manager_id: d.manager?.id ?? "",
      is_active: d.is_active,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name_ar.trim() || !form.name_en.trim()) {
      toast.error("يرجى إدخال اسم القسم بالعربية والإنجليزية");
      return;
    }
    setSaving(true);
    try {
      if (dialogMode === "create") {
        const response = await createDepartment({
          name_ar: form.name_ar,
          name_en: form.name_en,
          description: form.description,
          manager_id: form.manager_id || "",
          is_active: form.is_active,
        });
        if (!response.isSuccess) throw new Error(response.message);
        await load();
        toast.success(response.message);
      } else if (form.id) {
        const existing = items.find((d) => d.id === form.id);
        const response = await updateDepartment(form.id!, {
          name_ar: form.name_ar,
          name_en: form.name_en,
          description: form.description,
          manager_id: form.manager_id || "",
          is_active: form.is_active,
        });
        if (!response.isSuccess) throw new Error(response.message);
        await load();
        toast.success(response.message);
      }
      setDialogOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل حفظ القسم");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (d: Department) => {
    setConfirmAction({
      title: "حذف القسم",
      description:
        d.staff_count > 0
          ? `سيتم حذف «${d.name_ar}» مع وجود ${d.staff_count} عضو مرتبط. هل أنت متأكد؟`
          : `هل أنت متأكد من حذف «${d.name_ar}»؟`,
      confirmLabel: "حذف",
      variant: "destructive",
      onConfirm: async () => {
        try {
          const response = await deleteDepartment(d.id);
          if (!response.isSuccess) throw new Error(response.message);
          await load();
          toast.success(response.message);
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "فشل حذف القسم");
        } finally {
          setConfirmAction(null);
        }
      },
    });
  };

  return (
    <AppShell>
      <AdminPageHeader
        title="الأقسام"
        tableName="الأقسام"
        description="إدارة الأقسام الداخلية للمنصة — الاسم، الرمز، والمسؤول"
        addLabel="إضافة قسم"
        onAdd={openCreate}
        selectedCount={selectedIds.size}
        onBulkDelete={() => {}}
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          label="إجمالي الأقسام"
          value={String(kpis.total_departments)}
          icon={Building2}
          tone="primary"
        />
        <KpiCard label="أقسام نشطة" value={String(kpis.total_active)} icon={Power} tone="success" />
        <KpiCard
          label="إجمالي الأعضاء"
          value={String(kpis.total_members)}
          icon={Users}
          tone="info"
        />
      </div>

      {loading ? (
        <div className="flex min-h-[280px] items-center justify-center rounded-2xl border border-border bg-card shadow-soft">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <AdminDataTable
          selectable={false}
          search={search}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          searchPlaceholder="بحث بالاسم، الرمز، أو المسؤول..."
          filters={[
            {
              id: "status",
              label: "الحالة",
              icon: Power,
              value: statusFilter,
              onChange: (value) => {
                setStatusFilter(value);
                setPage(1);
              },
              options: [
                { value: "active", label: "نشط" },
                { value: "inactive", label: "غير نشط" },
              ],
            },
          ]}
          columns={[
            { key: "name", label: "القسم" },
            { key: "code", label: "الرمز" },
            { key: "description", label: "الوصف" },
            { key: "members", label: "الأعضاء" },
            { key: "status", label: "الحالة" },
            { key: "actions", label: "" },
          ]}
          rows={paginatedRows.map((d) => ({
            id: d.id,
            cells: [
              <span key="name" className="font-semibold">
                {d.name_ar}
              </span>,
              <span
                key="code"
                className="inline-flex rounded-md bg-muted/60 px-2 py-0.5 font-mono text-xs font-semibold"
              >
                {d.name_en.toUpperCase()}
              </span>,
              // <div key="manager" className="flex items-center gap-1.5">
              //   <UserCog className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              //   <span>{d.manager?.name ?? "—"}</span>
              // </div>,
              <p
                key="description"
                className="max-w-xs text-sm leading-relaxed text-muted-foreground"
                title={d.description}
              >
                {d.description.length > 72
                  ? `${d.description.slice(0, 72)}…`
                  : d.description || "—"}
              </p>,
              <span key="members" className="tabular-nums font-semibold">
                {d.staff_count}
              </span>,
              <AdminStatusBadge key="status" variant={activeBadge(d.is_active)} />,
              <RowActions
                key="actions"
                isActive={d.is_active === true}
                activeLabel="تعطيل"
                inactiveLabel="تفعيل"
                onEdit={() => openEdit(d)}
                onDelete={() => handleDelete(d)}
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
          totalCount={filtered.length}
        />
      )}

      <AdminEntityDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        titleCreate="إضافة قسم"
        titleEdit="تعديل القسم"
        description="بيانات القسم الأساسية — الاسم، الرمز، والمسؤول"
        onSave={handleSave}
        loading={saving}
        size="lg"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormInput
            label="اسم القسم"
            required
            value={form.name_ar}
            onChange={(e) => setForm({ ...form, name_ar: e.target.value })}
          />
          <FormInput
            label="الرمز"
            required
            value={form.name_en}
            onChange={(e) => setForm({ ...form, name_en: e.target.value })}
            dir="ltr"
            className="font-mono uppercase"
            placeholder="OPS"
          />
          <FormSelect
            label="المسؤول"
            value={form.manager_id}
            onValueChange={(value) => setForm({ ...form, manager_id: value })}
            options={memberOptions}
          />
          <FormTextarea
            label="الوصف"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="مهام القسم ومسؤولياته الرئيسية..."
            className="sm:col-span-2 min-h-[100px]"
          />
          {dialogMode === "edit" && (
            <FormSwitch
              label="نشط"
              checked={form.is_active === true}
              onCheckedChange={(checked) => setForm({ ...form, is_active: checked ? true : false })}
            />
          )}
        </div>
      </AdminEntityDialog>

      <ConfirmActionDialog action={confirmAction} onOpenChange={() => setConfirmAction(null)} />
    </AppShell>
  );
}

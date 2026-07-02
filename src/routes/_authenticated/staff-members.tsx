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
  FormSelect,
  FormTextarea,
  FormSwitch,
} from "@/components/admin/AdminFormFields";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { staffMembersApi } from "@/lib/admin/staff-members-api";
import { FaWhatsapp } from "react-icons/fa";
import { usersApi } from "@/lib/admin/users.api";
import type { Department } from "@/lib/admin/departments-types";
import { fetchDepartments } from "../../lib/admin/departments-api";
import { type StaffMember, type StaffMemberAddress } from "@/lib/admin/staff-members-types";
import type { ConfirmAction, CrudMode } from "@/components/admin/use-admin-crud";
import { Briefcase, Building2, Loader2, Power, UserCog, Users } from "lucide-react";
import { fetchCities } from "@/lib/admin/locations-api";
import { City } from "@/lib/admin/locations-types";
import { fetchRoles } from "@/lib/admin/rbac-api";
import type { Role } from "@/lib/admin/rbac-types";
import { formatRoleName } from "@/lib/admin/rbac-utils";

export const Route = createFileRoute("/_authenticated/staff-members")({
  component: StaffMembersPage,
});

function StaffMembersPage() {
  const [members, setMembers] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<CrudMode>(null);
  const [form, setForm] = useState<CreateStaffMemberFormState>(emptyForm());
  const [counts, setCounts] = useState({ total: 0, active: 0, inactive: 0 });
  const [fieldAccountType, setFieldAccountType] = useState("staff_member");
  const [roles, setRoles] = useState<Role[]>([]);

  const pageSize = 10;

  const loadMembers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await staffMembersApi.list({
        page: 1,
        per_page: 100,
        search: "",
        is_active: "",
        department: "",
      });
      if (!response.isSuccess) throw new Error(response.message);
      setMembers(response.data.items);
      setCounts(response.data.counts);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل تحميل أعضاء الفريق");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMembers();
  }, [loadMembers]);

  // ── Departments ──────────────────────────────────────────────────────────
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetchDepartments();
        if (response.isSuccess) setDepartments(response.data.items);
      } catch (error) {
        console.error(error);
      }
    };
    void load();
  }, []);

  const departmentOptions = useMemo(
    () => departments.map((d) => ({ value: String(d.id), label: d.name_ar })),
    [departments],
  );

  // ── Cities ───────────────────────────────────────────────────────────────
  const [cities, setCities] = useState<City[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetchCities(undefined, 1, 1000, "");
        if (response.isSuccess) setCities(response.data.items);
      } catch (error) {
        console.error(error);
      }
    };
    void load();
  }, []);

  const cityOptions = useMemo(
    () => cities.map((c) => ({ value: String(c.city_id), label: c.name_ar })),
    [cities],
  );
  const fetchRolesList = useCallback(async () => {
    try {
      const res = await fetchRoles();
      if (res.isSuccess) {
        setRoles(res.data);
      }
    } catch (err) {
      toast.error((err as Error).message ?? "فشل تحميل الأدوار");
    }
  }, []);

  useEffect(() => {
    void fetchRolesList();
  }, [fetchRolesList]);
  // ── Filtering ─────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return members.filter((member) => {
      // department filter: compare against department id
      if (
        departmentFilter !== "all" &&
        String(member.staff_member?.department?.id ?? "") !== departmentFilter
      )
        return false;

      if (statusFilter === "active" && member.is_active !== true) return false;
      if (statusFilter === "inactive" && member.is_active !== false) return false;

      if (!search.trim()) return true;
      const query = search.toLowerCase();
      return (
        member.name.toLowerCase().includes(query) ||
        (member.staff_member?.department?.name_ar ?? "").toLowerCase().includes(query) ||
        (member.staff_member?.department?.name_en ?? "").toLowerCase().includes(query) ||
        (member.staff_member?.job_title ?? "").toLowerCase().includes(query) ||
        (member.staff_member?.notes ?? "").toLowerCase().includes(query) ||
        member.phone.includes(query) ||
        (member.email ?? "").toLowerCase().includes(query)
      );
    });
  }, [members, search, departmentFilter, statusFilter]);

  const paginatedRows = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const kpis = useMemo(
    () => ({
      total: counts.total,
      active: counts.active,
      inactive: counts.inactive,
    }),
    [counts],
  );

  // ── CRUD helpers ──────────────────────────────────────────────────────────
  const openCreate = () => {
    setDialogMode("create");
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const openEdit = (member: StaffMember) => {
    setDialogMode("edit");
    const address = member.addresses?.[0];
    setForm({
      id: member.id,
      name: member.name,
      // store the department id for the select

      department_id: String(member.staff_member?.department?.id ?? ""),
      job_title: member.staff_member?.job_title ?? "",
      notes: member.staff_member?.notes ?? "",
      phone: member.phone,
      email: member.email,
      password: "",
      is_active: member.is_active,
      city_id: address?.city_id ?? "",
      address_line: address?.address_line ?? "",
      landmark: address?.landmark ?? "",
      street: address?.street ?? "",
      building_number: address?.building_number ?? "",
      floor_number: address?.floor_number ?? "",
      apartment_number: address?.apartment_number ?? "",
      is_default: address?.is_default ?? true,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (
      !form.name.trim() ||
      !form.phone.trim() ||
      !form.department_id ||
      !form.job_title.trim() ||
      !form.city_id ||
      !form.address_line.trim()
    ) {
      toast.error("يرجى إكمال الحقول المطلوبة");
      return;
    }
    if (dialogMode === "create" && !form.password.trim()) {
      toast.error("كلمة المرور مطلوبة");
      return;
    }

    setSaving(true);
    try {
      if (dialogMode === "create") {
        const response = await staffMembersApi.create({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          password: form.password,
          role: fieldAccountType,
          profile: {
            department_id: form.department_id,
            job_title: form.job_title.trim(),
            notes: form.notes.trim(),
          },
          address: {
            city_id: form.city_id,
            address_line: form.address_line.trim(),
            landmark: form.landmark.trim(),
            street: form.street.trim(),
            building_number: form.building_number.trim(),
            floor_number: form.floor_number.trim(),
            apartment_number: form.apartment_number.trim(),
            is_default: form.is_default ? true : false,
          },
        });
        if (!response.isSuccess) throw new Error(response.message);
        await loadMembers();
        toast.success(response.message);
      } else if (form.id) {
        const response = await usersApi.update(String(form.id), {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          roles: [fieldAccountType],
          profile: {
            department_id: form.department_id,
            job_title: form.job_title.trim(),
            notes: form.notes.trim(),
          },
          address: {
            city_id: form.city_id,
            address_line: form.address_line.trim(),
            landmark: form.landmark.trim(),
            street: form.street.trim(),
            building_number: form.building_number.trim(),
            floor_number: form.floor_number.trim(),
            apartment_number: form.apartment_number.trim(),
            is_default: form.is_default ? true : false,
          },
        });
        if (!response.isSuccess) throw new Error(response.message);
        await loadMembers();
        toast.success(response.message);
      }
      setDialogOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل حفظ البيانات");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = (member: StaffMember) => {
    setConfirmAction({
      title: member.is_active === true ? "تعطيل العضو" : "تفعيل العضو",
      description: `تأكيد ${member.is_active === true ? "تعطيل" : "تفعيل"} «${member.name}»`,
      confirmLabel: member.is_active === true ? "تعطيل" : "تفعيل",
      variant: member.is_active === true ? "destructive" : "default",
      onConfirm: async () => {
        try {
          const response = await usersApi.toggleStatus(member.id);
          if (!response.isSuccess) throw new Error(response.message);
          await loadMembers();
          toast.success(member.is_active === true ? "تم تعطيل العضو" : "تم تفعيل العضو");
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "فشل تحديث الحالة");
        } finally {
          setConfirmAction(null);
        }
      },
    });
  };

  const handleDelete = (member: StaffMember) => {
    setConfirmAction({
      title: "حذف العضو",
      description: `هل أنت متأكد من حذف «${member.name}»؟`,
      confirmLabel: "حذف",
      variant: "destructive",
      onConfirm: async () => {
        try {
          const response = await usersApi.delete(member.id);
          if (!response.isSuccess) throw new Error(response.message);
          await loadMembers();
          toast.success(response.message);
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "فشل حذف العضو");
        } finally {
          setConfirmAction(null);
        }
      },
    });
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <AppShell>
      <AdminPageHeader
        title="أعضاء الفريق"
        tableName="أعضاء الفريق"
        description="موظفو المنصة الداخليون — القسم، المسمى، والملاحظات"
        addLabel="إضافة عضو"
        onAdd={openCreate}
        selectedCount={selectedIds.size}
        onBulkDelete={() => {}}
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label="إجمالي الأعضاء" value={String(kpis.total)} icon={Users} tone="primary" />
        <KpiCard label="أعضاء نشطون" value={String(kpis.active)} icon={UserCog} tone="success" />
        <KpiCard
          label="أعضاء غير نشطين"
          value={String(kpis.inactive)}
          icon={Power}
          tone="warning"
        />{" "}
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
          searchPlaceholder="بحث بالاسم، القسم، المسمى، أو الملاحظات..."
          filters={[
            {
              id: "department",
              label: "القسم",
              icon: Building2,
              value: departmentFilter,
              onChange: (value) => {
                setDepartmentFilter(value);
                setPage(1);
              },
              options: departmentOptions,
            },
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
            { key: "name", label: "الاسم" },
            { key: "department", label: "القسم" },
            { key: "job_title", label: "المسمى الوظيفي" },
            { key: "notes", label: "ملاحظات" },
            { key: "contact", label: "التواصل" },
            { key: "whatsapp", label: "واتساب" },
            { key: "status", label: "الحالة" },
            { key: "actions", label: "" },
          ]}
          rows={paginatedRows.map((member) => ({
            id: member.id,
            cells: [
              <span key="name" className="font-semibold">
                {member.name}
              </span>,
              <BadgeDepartment
                key="department"
                department={member.staff_member?.department?.name_ar ?? "—"}
              />,
              <div key="job_title" className="flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span>{member.staff_member?.job_title}</span>
              </div>,
              <NotesCell key="notes" notes={member.staff_member?.notes ?? ""} />,
              <div key="contact">
                <p className="tabular-nums text-sm" dir="ltr">
                  {member.phone}
                </p>
                <p className="text-[11px] text-muted-foreground" dir="ltr">
                  {member.email}
                </p>
              </div>,
              <div key="whatsapp" className="flex justify-center">
                {member.welcome_whatsapp_url ? (
                  <a
                    href={member.welcome_whatsapp_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-lg p-2 text-green-600 hover:bg-green-50"
                    title="فتح رسالة الواتساب"
                  >
                    <FaWhatsapp size={20} />
                  </a>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </div>,
              <AdminStatusBadge key="status" variant={activeBadge(member.is_active)} />,
              <RowActions
                key="actions"
                isActive={member.is_active === true}
                activeLabel="تعطيل"
                inactiveLabel="تفعيل"
                onEdit={() => openEdit(member)}
                onDelete={() => handleDelete(member)}
                onToggleActive={() => handleToggleActive(member)}
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
        titleCreate="إضافة عضو فريق"
        titleEdit="تعديل العضو"
        description="القسم، المسمى الوظيفي، والملاحظات الداخلية"
        onSave={handleSave}
        loading={saving}
        size="lg"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormInput
            label="الاسم"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <FormInput
            label="الهاتف"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            dir="ltr"
            className="tabular-nums"
          />
          {/* Department select uses fetched departments, value = department id */}
          {dialogMode === "create" && (
            <FormSelect
              label="القسم"
              required
              value={form.department_id}
              onValueChange={(value) => setForm({ ...form, department_id: value })}
              options={departmentOptions}
            />
          )}
          <FormInput
            label="المسمى الوظيفي"
            required
            value={form.job_title}
            onChange={(e) => setForm({ ...form, job_title: e.target.value })}
          />
          <FormInput
            label="البريد الإلكتروني"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            dir="ltr"
            className="sm:col-span-2"
          />
          {dialogMode === "create" && (
            <FormInput
              label="كلمة المرور"
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          )}
          {dialogMode === "create" && (
            <FormSelect
              label="الدور  "
              value={fieldAccountType}
              onValueChange={setFieldAccountType}
              options={roles.map((r) => ({ value: r.name, label: formatRoleName(r.name) }))}
            />
          )}

          <FormSelect
            label="المدينة"
            required
            value={form.city_id}
            onValueChange={(value) => setForm({ ...form, city_id: value })}
            options={cityOptions}
          />
          <FormInput
            label="العنوان"
            required
            value={form.address_line}
            onChange={(e) => setForm({ ...form, address_line: e.target.value })}
          />
          <FormInput
            label="الشارع"
            value={form.street}
            onChange={(e) => setForm({ ...form, street: e.target.value })}
          />
          <FormInput
            label="رقم المبنى"
            value={form.building_number}
            onChange={(e) => setForm({ ...form, building_number: e.target.value })}
          />
          <FormInput
            label="الدور"
            value={form.floor_number}
            onChange={(e) => setForm({ ...form, floor_number: e.target.value })}
          />
          <FormInput
            label="رقم الشقة"
            value={form.apartment_number}
            onChange={(e) => setForm({ ...form, apartment_number: e.target.value })}
          />
          <FormInput
            label="علامة مميزة"
            value={form.landmark}
            onChange={(e) => setForm({ ...form, landmark: e.target.value })}
          />
          <FormTextarea
            label="ملاحظات"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="ملاحظات داخلية عن العضو، مسؤوليات إضافية، أو تفاصيل للفريق..."
            className="sm:col-span-2 min-h-[100px]"
          />
          <FormSwitch
            label="العنوان الافتراضي"
            checked={Boolean(form.is_default)}
            onCheckedChange={(checked) => setForm({ ...form, is_default: checked ? true : false })}
          />
        </div>
      </AdminEntityDialog>

      <ConfirmActionDialog action={confirmAction} onOpenChange={() => setConfirmAction(null)} />
    </AppShell>
  );
}

// ── Types ──────────────────────────────────────────────────────────────────

type CreateStaffMemberFormState = {
  id?: string;
  name: string;
  /** ID of the selected department */
  department_id: string;
  job_title: string;
  notes: string;
  phone: string;
  email: string;
  password: string;
  city_id: string;
  address_line: string;
  landmark: string;
  street: string;
  building_number: string;
  floor_number: string;
  apartment_number: string;
  is_default: boolean;
  is_active: boolean;
};

function emptyForm(): CreateStaffMemberFormState {
  return {
    name: "",
    department_id: "",
    job_title: "",
    notes: "",
    phone: "",
    email: "",
    password: "",
    city_id: "",
    address_line: "",
    landmark: "",
    street: "",
    building_number: "",
    floor_number: "",
    apartment_number: "",
    is_default: true,
    is_active: true,
  };
}

// ── Small presentational components ───────────────────────────────────────

function BadgeDepartment({ department }: { department: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-lg bg-muted/50 px-2.5 py-1 text-xs font-medium">
      <Building2 className="h-3 w-3 text-muted-foreground" />
      {department}
    </span>
  );
}

function NotesCell({ notes }: { notes: string }) {
  if (!notes.trim()) return <span className="text-xs text-muted-foreground">—</span>;
  const preview = notes.length > 72 ? `${notes.slice(0, 72)}…` : notes;
  return (
    <p className="max-w-xs text-sm leading-relaxed text-muted-foreground" title={notes}>
      {preview}
    </p>
  );
}

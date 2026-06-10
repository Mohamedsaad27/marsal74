// src/routes/users.tsx  — real-API version
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminEntityDialog } from "@/components/admin/AdminEntityDialog";
import { AdminChangeUserPasswordDialog } from "@/components/admin/AdminChangeUserPasswordDialog";
import { ConfirmActionDialog } from "@/components/admin/ConfirmActionDialog";
import { ImportUsersDialog } from "@/components/admin/ImportUsersDialog";
import { AdminStatusBadge, activeBadge } from "@/components/admin/AdminStatusBadge";
import { RowActions } from "@/components/admin/RowActions";
import { formatRoleName } from "@/lib/admin/rbac-utils";

import { FormInput, FormSelect, FormSwitch } from "@/components/admin/AdminFormFields";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { KpiCard } from "@/components/dashboard/KpiCard";
import {
  MapPin,
  Link2,
  Users,
  Truck,
  Building2,
  UserCog,
  FileSpreadsheet,
  Lock,
  Shield,
  Power,
} from "lucide-react";
import { AdminDialogShell } from "@/components/admin/AdminDialogShell";
import {
  usersApi,
  type AdminUser,
  type UserCounts,
  type CreateUserPayload,
  type UpdateUserPayload,
} from "../../lib/admin/users.api";
import { fetchRoles } from "@/lib/admin/rbac-api";
import type { Role } from "@/lib/admin/rbac-types";
import { StaffMemberAddress } from "@/lib/admin/staff-members-types";
import { City } from "@/lib/admin/locations-types";
import { fetchCities } from "@/lib/admin/locations-api";

export const Route = createFileRoute("/_authenticated/users")({
  component: UsersPage,
});

// ─── Debounce hook ────────────────────────────────────────────────────────────
function useDebounced<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

// ─── Component ────────────────────────────────────────────────────────────────
function UsersPage() {
  // ── list state ──────────────────────────────────────────────────────────────
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [counts, setCounts] = useState<UserCounts>({
    total: 0,
    super_admin: 0,
    staff_member: 0,
    shipping_company: 0,
    delivery_agent: 0,
  });
  const [totalItems, setTotalItems] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const PER_PAGE = 15;
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const debouncedSearch = useDebounced(search, 400);

  // ── dialog state ────────────────────────────────────────────────────────────
  const [formOpen, setFormOpen] = useState(false);
  const [crudMode, setCrudMode] = useState<"create" | "edit">("create");
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [addressesOpen, setAddressesOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [selectedUserName, setSelectedUserName] = useState("");
  const [passwordTargetUser, setPasswordTargetUser] = useState<{
    id: string;
    name: string;
    email: string;
  }>();

  interface ConfirmAction {
    title: string;
    description: string;
    confirmLabel: string;
    variant: "destructive" | "default";
    onConfirm: () => void;
  }
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);

  // ── form field state (controlled) ───────────────────────────────────────────
  const [fieldName, setFieldName] = useState("");
  const [fieldEmail, setFieldEmail] = useState("");
  const [fieldPhone, setFieldPhone] = useState("");
  const [cities, setCities] = useState<City[]>([]);

  const [fieldGender, setFieldGender] = useState("male");
  const [fieldIsActive, setFieldIsActive] = useState(true);
  const [fieldPassword, setFieldPassword] = useState("");
  const [fieldAccountType, setFieldAccountType] = useState("staff_member");
  const [fieldRoles, setFieldRoles] = useState<string[]>([]);
  const [fieldPermissions, setFieldPermissions] = useState<string[]>([]);
  const [form, setForm] = useState({
    city_id: "",
    address_line: "",
    landmark: "",
    street: "",
    building_number: "",
    floor_number: "",
    apartment_number: "",
    is_default: 1,
  });
  // ── fetch ────────────────────────────────────────────────────────────────────
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
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const isActive = statusFilter === "active" ? "1" : statusFilter === "inactive" ? "0" : "";
      const res = await usersApi.list({
        page,
        per_page: PER_PAGE,
        search: debouncedSearch,
        role: roleFilter === "all" ? "" : roleFilter,
        is_active: isActive as "" | "0" | "1",
      });
      if (res.isSuccess) {
        setUsers(res.data.items);
        setCounts(res.data.counts);
        setTotalItems(res.data.total);
        setLastPage(res.data.last_page);
      }
    } catch (err) {
      toast.error((err as Error).message ?? "فشل تحميل المستخدمين");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, statusFilter, roleFilter]);

  // reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, roleFilter]);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    const loadCities = async () => {
      try {
        const response = await fetchCities(undefined, 1, 1000, "");

        if (response.isSuccess) {
          setCities(response.data.items);
        }
      } catch (error) {
        console.error(error);
      }
    };

    void loadCities();
  }, []);
  const cityOptions = useMemo(
    () =>
      cities.map((city) => ({
        value: String(city.city_id),
        label: `${city.name_ar}`,
      })),
    [cities],
  );
  // ── open create / edit dialogs ───────────────────────────────────────────────
  const openCreate = () => {
    setEditingUser(null);
    setFieldName("");
    setFieldEmail("");
    setFieldPhone("");
    setFieldGender("male");
    setFieldIsActive(true);
    setFieldPassword("");
    setFieldAccountType("staff_member");
    setForm({
      city_id: "",
      address_line: "",
      landmark: "",
      street: "",
      building_number: "",
      floor_number: "",
      apartment_number: "",
      is_default: 1,
    });
    setFieldRoles([]);
    setFieldPermissions([]);
    setCrudMode("create");
    setFormOpen(true);
  };

  const openEdit = (u: AdminUser) => {
    setEditingUser(u);
    setFieldName(u.name);
    setFieldEmail(u.email);
    setFieldPhone(u.phone);
    setFieldGender(u.gender ?? "male");
    setFieldIsActive(u.is_active);
    setFieldPassword("");
    setFieldAccountType(u.role.name);
    setFieldRoles([u.role.name]);
    setForm({
      city_id: u.addresses[0]?.city_id ?? "",
      address_line: u.addresses[0]?.address_line ?? "",
      landmark: u.addresses[0]?.landmark ?? "",
      street: u.addresses[0]?.street ?? "",
      building_number: u.addresses[0]?.building_number ?? "",
      floor_number: u.addresses[0]?.floor_number ?? "",
      apartment_number: u.addresses[0]?.apartment_number ?? "",
      is_default: u.addresses[0]?.is_default ?? 1,
    });
    setFieldPermissions([]);
    setCrudMode("edit");
    setFormOpen(true);
  };

  // ── save (create or update) ──────────────────────────────────────────────────
  const handleSave = async () => {
    setFormLoading(true);
    try {
      if (crudMode === "create") {
        const payload: CreateUserPayload = {
          name: fieldName,
          email: fieldEmail,
          phone: fieldPhone,
          password: fieldPassword,
          account_type: fieldAccountType,
          roles: [fieldAccountType],
          profile: {},
          address: {
            city_id: form.city_id,
            address_line: form.address_line.trim(),
            landmark: form.landmark.trim(),
            street: form.street.trim(),
            building_number: form.building_number.trim(),
            floor_number: form.floor_number.trim(),
            apartment_number: form.apartment_number.trim(),
            is_default: form.is_default === 1 ? 1 : 0,
          },
        };
        const res = await usersApi.create(payload);
        if (res.isSuccess) {
          toast.success("تم إضافة المستخدم بنجاح");
          setFormOpen(false);
          await fetchUsers();
        }
      } else if (editingUser) {
        const payload: UpdateUserPayload = {
          name: fieldName,
          email: fieldEmail,
          phone: fieldPhone,
          gender: fieldGender,
          roles: [fieldAccountType],
          profile: {},
          address: {
            city_id: form.city_id,
            address_line: form.address_line.trim(),
            landmark: form.landmark.trim(),
            street: form.street.trim(),
            building_number: form.building_number.trim(),
            floor_number: form.floor_number.trim(),
            apartment_number: form.apartment_number.trim(),
            is_default: form.is_default === 1 ? 1 : 0,
          },
        };
        const res = await usersApi.update(editingUser.id, payload);
        if (res.isSuccess) {
          toast.success("تم تحديث المستخدم بنجاح");
          setFormOpen(false);
          await fetchUsers();
        }
      }
    } catch (err) {
      toast.error((err as Error).message ?? "فشل حفظ البيانات");
    } finally {
      setFormLoading(false);
    }
  };

  // ── delete ───────────────────────────────────────────────────────────────────
  const requestDelete = (u: AdminUser) => {
    setConfirmAction({
      title: "حذف المستخدم",
      description: `هل أنت متأكد من حذف «${u.name}»؟ لا يمكن التراجع عن هذا الإجراء.`,
      confirmLabel: "حذف",
      variant: "destructive",
      onConfirm: async () => {
        setConfirmAction(null);
        try {
          const res = await usersApi.delete(u.id);
          if (res.isSuccess) {
            toast.success("تم حذف المستخدم");
            await fetchUsers();
          }
        } catch (err) {
          toast.error((err as Error).message ?? "فشل الحذف");
        }
      },
    });
  };

  const requestBulkDelete = () => {
    setConfirmAction({
      title: "حذف متعدد",
      description: `سيتم حذف ${selectedIds.size} مستخدم. لا يمكن التراجع.`,
      confirmLabel: "حذف الكل",
      variant: "destructive",
      onConfirm: async () => {
        setConfirmAction(null);
        try {
          await Promise.all([...selectedIds].map((id) => usersApi.delete(id)));
          toast.success("تم حذف المستخدمين المحددين");
          setSelectedIds(new Set());
          await fetchUsers();
        } catch (err) {
          toast.error((err as Error).message ?? "فشل الحذف");
        }
      },
    });
  };

  // ── toggle active ─────────────────────────────────────────────────────────────
  const toggleUserActive = (u: AdminUser) => {
    setConfirmAction({
      title: u.is_active ? "تعطيل المستخدم" : "تفعيل المستخدم",
      description: `تأكيد ${u.is_active ? "تعطيل" : "تفعيل"} حساب «${u.name}»`,
      confirmLabel: u.is_active ? "تعطيل" : "تفعيل",
      variant: u.is_active ? "destructive" : "default",
      onConfirm: async () => {
        setConfirmAction(null);
        try {
          const res = await usersApi.toggleStatus(u.id);
          if (res.isSuccess) {
            toast.success(u.is_active ? "تم تعطيل المستخدم" : "تم تفعيل المستخدم");
            await fetchUsers();
          }
        } catch (err) {
          toast.error((err as Error).message ?? "فشل تغيير الحالة");
        }
      },
    });
  };

  // ── selection helpers ─────────────────────────────────────────────────────────
  const toggleSelect = (id: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      return next;
    });

  const toggleSelectAll = () =>
    setSelectedIds((prev) =>
      prev.size === users.length ? new Set() : new Set(users.map((u) => u.id)),
    );

  // ── profile label helper ──────────────────────────────────────────────────────
  const profileLabel = (u: AdminUser): string | null => {
    if (u.staff_member) return u.staff_member.job_title ?? "موظف";
    if (u.delivery_agent) return "مندوب توصيل";
    if (u.shipping_company) return "شركة شحن";
    return null;
  };

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <AppShell>
      <AdminPageHeader
        title="المستخدمون"
        tableName="المستخدمون"
        description="إدارة الحسابات والأدوار والصلاحيات المباشرة"
        addLabel="إضافة مستخدم"
        onAdd={openCreate}
        selectedCount={selectedIds.size}
        onBulkDelete={requestBulkDelete}
        extra={
          <Button variant="outline" className="rounded-xl" onClick={() => setImportOpen(true)}>
            <FileSpreadsheet className="ml-1.5 h-4 w-4" />
            استيراد من Excel
          </Button>
        }
      />

      {/* KPI cards — driven by server counts */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="إجمالي المستخدمين"
          value={String(counts.total)}
          icon={Users}
          tone="primary"
        />
        <KpiCard
          label="مناديب التوصيل"
          value={String(counts.delivery_agent)}
          icon={Truck}
          tone="success"
        />
        <KpiCard
          label="شركات الشحن"
          value={String(counts.shipping_company)}
          icon={Building2}
          tone="info"
        />
        <KpiCard
          label="أعضاء الفريق"
          value={String(counts.staff_member)}
          icon={UserCog}
          tone="warning"
        />
      </div>

      <AdminDataTable
        search={search}
        onSearchChange={(v) => setSearch(v)}
        searchPlaceholder="بحث بالاسم، البريد، أو الهاتف..."
        filters={[
          {
            id: "status",
            label: "الحالة",
            icon: Power,
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { value: "active", label: "نشط" },
              { value: "inactive", label: "غير نشط" },
            ],
          },
          {
            id: "role",
            label: "الدور",
            icon: Shield,
            value: roleFilter,
            onChange: setRoleFilter,
            options: [
              { value: "super_admin", label: "مدير النظام" },
              { value: "staff_member", label: "موظف" },
              { value: "shipping_company", label: "شركة شحن" },
              { value: "delivery_agent", label: "مندوب توصيل" },
            ],
          },
        ]}
        columns={[
          { key: "user", label: "المستخدم" },
          { key: "contact", label: "التواصل" },
          { key: "roles", label: "الأدوار" },
          { key: "profile", label: "الملف المرتبط" },
          { key: "status", label: "الحالة" },
          { key: "actions", label: "" },
        ]}
        rows={users.map((u) => ({
          id: u.id,
          cells: [
            <div key="user" className="flex items-center gap-3">
              <Avatar className="h-10 w-10 rounded-xl">
                {u.avatar ? (
                  <img
                    src={u.avatar}
                    alt={u.name}
                    className="h-full w-full object-cover rounded-xl"
                  />
                ) : (
                  <AvatarFallback className="rounded-xl gradient-brand text-white">
                    {u.name.charAt(0)}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <p className="font-semibold">{u.name}</p>
                <p className="text-[11px] text-muted-foreground">
                  {u.gender === "male" || u.gender === "ذكر"
                    ? "ذكر"
                    : u.gender === "female" || u.gender === "أنثى"
                      ? "أنثى"
                      : u.role.label}
                </p>
              </div>
            </div>,

            <div key="contact">
              <p className="text-xs">{u.email}</p>
              <p className="text-xs tabular-nums text-muted-foreground">{u.phone}</p>
            </div>,

            <div key="roles" className="flex flex-wrap gap-1">
              <Badge variant="secondary" className="rounded-md font-mono text-[10px]">
                {u.role.label}
              </Badge>
            </div>,

            (() => {
              const label = profileLabel(u);
              return label ? (
                <span key="profile" className="inline-flex items-center gap-1 text-xs text-primary">
                  <Link2 className="h-3.5 w-3.5" />
                  {label}
                </span>
              ) : (
                <span key="profile" className="text-xs text-muted-foreground">
                  —
                </span>
              );
            })(),

            <AdminStatusBadge key="status" variant={activeBadge(u.is_active ? true : false)} />,

            <RowActions
              key="actions"
              isActive={u.is_active}
              onEdit={() => openEdit(u)}
              onDelete={() => requestDelete(u)}
              onToggleActive={() => toggleUserActive(u)}
              extra={[
                {
                  label: "تغيير كلمة المرور",
                  icon: <Lock className="ml-2 h-4 w-4" />,
                  onClick: () => {
                    setPasswordTargetUser({ id: u.id, name: u.name, email: u.email });
                    setPasswordOpen(true);
                  },
                },
              ]}
            />,
          ],
        }))}
        selectedIds={selectedIds}
        onToggleSelect={toggleSelect}
        onToggleSelectAll={toggleSelectAll}
        page={page}
        totalPages={lastPage}
        onPageChange={setPage}
        totalCount={totalItems}
        loading={loading}
      />

      {/* Create / Edit dialog */}
      <AdminEntityDialog
        open={formOpen}
        onOpenChange={(o) => !o && setFormOpen(false)}
        mode={crudMode}
        titleCreate="إضافة مستخدم جديد"
        titleEdit="تعديل المستخدم"
        description="تعيين الأدوار والصلاحيات المباشرة (Super Admin)"
        onSave={handleSave}
        loading={formLoading}
        size="xl"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormInput
            label="الاسم"
            required
            placeholder="الاسم الكامل"
            value={fieldName}
            onChange={(e) => setFieldName(e.target.value)}
          />
          <FormInput
            label="البريد الإلكتروني"
            required
            type="email"
            placeholder="user@marsal.io"
            value={fieldEmail}
            onChange={(e) => setFieldEmail(e.target.value)}
          />
          <FormInput
            label="الهاتف"
            required
            placeholder="01xxxxxxxxx"
            value={fieldPhone}
            onChange={(e) => setFieldPhone(e.target.value)}
          />
          <FormSelect
            label="الجنس"
            value={fieldGender}
            onValueChange={setFieldGender}
            options={[
              { value: "male", label: "ذكر" },
              { value: "female", label: "أنثى" },
            ]}
          />
          {crudMode === "create" && (
            <FormInput
              label="كلمة المرور"
              required
              type="password"
              placeholder="TempPass@123"
              value={fieldPassword}
              onChange={(e) => setFieldPassword(e.target.value)}
              className="sm:col-span-2"
            />
          )}
          {crudMode === "create" && (
            <FormSelect
              label="نوع الحساب"
              value={fieldAccountType}
              onValueChange={setFieldAccountType}
              options={roles.map((r) => ({ value: r.name, label: formatRoleName(r.name) }))}
            />
          )}
          <FormSelect
            label="المدينة "
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
            label="علامة مميزة"
            value={form.landmark}
            onChange={(e) => setForm({ ...form, landmark: e.target.value })}
          />

          <FormSwitch
            label="العنوان الافتراضي"
            checked={form.is_default === 1}
            onCheckedChange={(checked) => setForm({ ...form, is_default: checked ? 1 : 0 })}
          />
        </div>
      </AdminEntityDialog>

      <ImportUsersDialog open={importOpen} onOpenChange={setImportOpen} />

      <AdminChangeUserPasswordDialog
        open={passwordOpen}
        onOpenChange={setPasswordOpen}
        user={passwordTargetUser}
      />

      <ConfirmActionDialog action={confirmAction} onOpenChange={() => setConfirmAction(null)} />
    </AppShell>
  );
}

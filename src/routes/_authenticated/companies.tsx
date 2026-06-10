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
import { KpiCard } from "@/components/dashboard/KpiCard";
import { shippingCompaniesApi } from "@/lib/admin/shipping-companies-api";
import { usersApi } from "@/lib/admin/users.api";
import { ShippingCompany } from "@/lib/admin/shipping-companies-types";
import type { ConfirmAction, CrudMode } from "@/components/admin/use-admin-crud";
import { Building2, Loader2, Power, Truck, TrendingUp, Wallet, CheckCircle2 } from "lucide-react";
import { FormInput, FormSelect, FormSwitch } from "@/components/admin/AdminFormFields";
import { City } from "@/lib/admin/locations-types";
import { fetchCities } from "@/lib/admin/locations-api";
export const Route = createFileRoute("/_authenticated/companies")({
  component: ShippingCompaniesPage,
});

// ─── Form state ───────────────────────────────────────────────────────────────

type ShippingCompanyFormState = {
  userId?: string;
  name: string;
  email: string;
  phone: string;
  password: string;

  company_name: string;
  commercial_reg: string;

  city_id: string;
  address_line: string;
  landmark: string;
  street: string;
  building_number: string;
  is_default: number;

  is_active: boolean;
};

function emptyForm(): ShippingCompanyFormState {
  return {
    name: "",
    email: "",
    phone: "",
    password: "",

    company_name: "",
    commercial_reg: "",

    city_id: "",
    address_line: "",
    landmark: "",
    street: "",
    building_number: "",
    is_default: 1,

    is_active: true,
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function ShippingCompaniesPage() {
  const [companies, setCompanies] = useState<ShippingCompany[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [counts, setCounts] = useState({ total: 0, active: 0, inactive: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "0" | "1">("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<CrudMode>(null);
  const [form, setForm] = useState<ShippingCompanyFormState>(emptyForm());

  const pageSize = 15;

  // ── Data loading ────────────────────────────────────────────────────────────

  const loadCompanies = useCallback(
    async (currentPage = page) => {
      setLoading(true);
      try {
        const response = await shippingCompaniesApi.list({
          page: currentPage,
          per_page: pageSize,
          search,
          is_active: statusFilter,
        });
        if (!response.isSuccess) throw new Error(response.message);
        setCompanies(response.data.items);
        setCounts(response.data.counts);
        setLastPage(response.data.last_page);
        setTotalCount(response.data.total);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "فشل تحميل شركات الشحن");
      } finally {
        setLoading(false);
      }
    },
    [page, search, statusFilter],
  );

  useEffect(() => {
    void loadCompanies(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, statusFilter]);

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
  // ── Dialog helpers ──────────────────────────────────────────────────────────

  const openCreate = () => {
    setDialogMode("create");
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const openEdit = (company: ShippingCompany) => {
    setDialogMode("edit");
    setForm({
      userId: company.id,
      name: company.name,
      email: company.email,
      phone: company.phone,
      password: "",
      company_name: company.shipping_company.company_name,
      commercial_reg: company.shipping_company.commercial_reg ?? "",
      is_active: company.is_active,
      city_id: company.addresses[0]?.city_id ?? "",
      address_line: company.addresses[0]?.address_line ?? "",
      landmark: company.addresses[0]?.landmark ?? "",
      street: company.addresses[0]?.street ?? "",
      building_number: company.addresses[0]?.building_number ?? "",
      is_default: Number(company.addresses[0]?.is_default ?? 1),
    });
    setDialogOpen(true);
  };

  // ── Save ────────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.phone.trim() ||
      !form.company_name.trim() ||
      !form.city_id ||
      !form.address_line.trim()
    ) {
      toast.error("يرجى إكمال الحقول المطلوبة");
      return;
    }
    if (dialogMode === "create" && !form.password.trim()) {
      toast.error("كلمة المرور مطلوبة عند الإنشاء");
      return;
    }

    setSaving(true);
    try {
      if (dialogMode === "create") {
        const response = await shippingCompaniesApi.create({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          password: form.password.trim(),
          roles: ["shipping_company"],

          profile: {
            company_name: form.company_name.trim(),
            commercial_reg: form.commercial_reg.trim(),
          },

          address: {
            city_id: form.city_id,
            address_line: form.address_line.trim(),
            landmark: form.landmark.trim(),
            street: form.street.trim(),
            building_number: form.building_number.trim(),
            is_default: form.is_default,
          },
        });
        if (!response.isSuccess) throw new Error(response.message);
        toast.success(response.message);
        await loadCompanies(1);
        setPage(1);
      } else if (form.userId) {
        const response = await usersApi.update(form.userId, {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          roles: ["shipping_company"],

          profile: {
            company_name: form.company_name.trim(),
            ...(form.commercial_reg.trim() && {
              commercial_reg: form.commercial_reg.trim(),
            }),
          },

          address: {
            city_id: form.city_id,
            address_line: form.address_line.trim(),
            landmark: form.landmark.trim(),
            street: form.street.trim(),
            building_number: form.building_number.trim(),
            is_default: Number(form.is_default),
            floor_number: "",
            apartment_number: "",
          },
        });

        if (!response.isSuccess) throw new Error(response.message);
        toast.success(response.message);
        // Patch the updated company inline
        await loadCompanies(page);
      }
      setDialogOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل حفظ البيانات");
    } finally {
      setSaving(false);
    }
  };

  // ── Toggle active ────────────────────────────────────────────────────────────

  const handleToggleActive = (company: ShippingCompany) => {
    setConfirmAction({
      title: company.is_active ? "تعطيل الشركة" : "تفعيل الشركة",
      description: `تأكيد ${company.is_active ? "تعطيل" : "تفعيل"} «${company.shipping_company.company_name}»`,
      confirmLabel: company.is_active ? "تعطيل" : "تفعيل",
      variant: company.is_active ? "destructive" : "default",
      onConfirm: async () => {
        try {
          const response = await usersApi.toggleStatus(company.id);
          if (!response.isSuccess) throw new Error(response.message);
          toast.success(company.is_active ? "تم تعطيل الشركة" : "تم تفعيل الشركة");
          await loadCompanies(page);
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "فشل تحديث الحالة");
        } finally {
          setConfirmAction(null);
        }
      },
    });
  };

  // ── Delete ───────────────────────────────────────────────────────────────────

  const handleDelete = (company: ShippingCompany) => {
    setConfirmAction({
      title: "حذف الشركة",
      description: `هل أنت متأكد من حذف «${company.shipping_company.company_name}»؟`,
      confirmLabel: "حذف",
      variant: "destructive",
      onConfirm: async () => {
        try {
          const response = await usersApi.delete(company.id);
          if (!response.isSuccess) throw new Error(response.message);
          toast.success(response.message);
          await loadCompanies(page);
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "فشل حذف الشركة");
        } finally {
          setConfirmAction(null);
        }
      },
    });
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <AppShell>
      <AdminPageHeader
        title="شركات الشحن"
        tableName="شركات الشحن"
        description="إدارة شركات الشحن — البيانات، العمولة، والحالة"
        addLabel="إضافة شركة"
        onAdd={openCreate}
        selectedCount={selectedIds.size}
        onBulkDelete={() => {}}
      />

      {/* KPIs */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label="إجمالي الشركات" value={String(counts.total)} icon={Truck} tone="primary" />
        <KpiCard
          label="شركات نشطة"
          value={String(counts.active)}
          icon={CheckCircle2}
          tone="success"
        />
        <KpiCard label="شركات معطلة" value={String(counts.inactive)} icon={Power} tone="warning" />
      </div>

      {/* Table */}
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
          searchPlaceholder="بحث بالاسم، البريد، أو الهاتف..."
          filters={[
            {
              id: "status",
              label: "الحالة",
              icon: Power,
              value: statusFilter === "" ? "all" : statusFilter === "1" ? "active" : "inactive",
              onChange: (value) => {
                setStatusFilter(value === "all" ? "" : value === "active" ? "1" : "0");
                setPage(1);
              },
              options: [
                { value: "active", label: "نشط" },
                { value: "inactive", label: "غير نشط" },
              ],
            },
          ]}
          columns={[
            { key: "company_name", label: "اسم الشركة" },
            { key: "contact", label: "التواصل" },
            { key: "commercial_reg", label: "السجل التجاري" },
            { key: "commission", label: "العمولة" },
            { key: "balance", label: "الرصيد" },
            { key: "status", label: "الحالة" },
            { key: "actions", label: "" },
          ]}
          rows={companies.map((company) => ({
            id: company.id,
            cells: [
              // Company name
              <div key="company_name" className="flex items-center gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Truck className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold leading-tight">
                    {company.shipping_company.company_name}
                  </p>
                  <p className="text-xs text-muted-foreground">{company.name}</p>
                </div>
              </div>,

              // Contact
              <div key="contact">
                <p className="tabular-nums text-sm" dir="ltr">
                  {company.phone}
                </p>
                <p className="text-[11px] text-muted-foreground" dir="ltr">
                  {company.email}
                </p>
              </div>,

              // Commercial reg
              <span key="commercial_reg" className="text-sm text-muted-foreground">
                {company.shipping_company.commercial_reg ?? "—"}
              </span>,

              // Commission
              <CommissionBadge key="commission" commission={company.shipping_company.commission} />,

              // Balance
              <div key="balance" className="flex items-center gap-1">
                <Wallet className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="tabular-nums text-sm font-medium">
                  {Number(company.shipping_company.balance).toLocaleString("ar-EG")}
                </span>
              </div>,

              // Status
              <AdminStatusBadge key="status" variant={activeBadge(company.is_active)} />,

              // Actions
              <RowActions
                key="actions"
                isActive={company.is_active}
                activeLabel="تعطيل"
                inactiveLabel="تفعيل"
                onEdit={() => openEdit(company)}
                onDelete={() => handleDelete(company)}
                onToggleActive={() => handleToggleActive(company)}
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
          totalPages={lastPage}
          onPageChange={setPage}
          totalCount={totalCount}
        />
      )}

      {/* Create / Edit dialog */}
      <AdminEntityDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        titleCreate="إضافة شركة شحن"
        titleEdit="تعديل الشركة"
        description="بيانات الحساب والملف التجاري للشركة"
        onSave={handleSave}
        loading={saving}
        size="lg"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {/* User fields */}
          <FormInput
            label="الاسم الكامل"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <FormInput
            label="الهاتف"
            required
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            dir="ltr"
            className="tabular-nums"
          />
          <FormInput
            label="البريد الإلكتروني"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            dir="ltr"
          />
          {dialogMode === "create" && (
            <FormInput
              label="كلمة المرور"
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              dir="ltr"
            />
          )}

          {/* Shipping company profile */}
          <FormInput
            label="اسم الشركة"
            required
            value={form.company_name}
            onChange={(e) => setForm({ ...form, company_name: e.target.value })}
            className={dialogMode === "create" ? "sm:col-span-2" : ""}
          />
          <FormInput
            label="السجل التجاري"
            value={form.commercial_reg}
            onChange={(e) => setForm({ ...form, commercial_reg: e.target.value })}
            dir="ltr"
            className={dialogMode === "edit" ? "sm:col-span-2" : ""}
          />

          {/* Active toggle — edit only */}

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

      <ConfirmActionDialog action={confirmAction} onOpenChange={() => setConfirmAction(null)} />
    </AppShell>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function CommissionBadge({
  commission,
}: {
  commission: { type: { code: number; label: string }; value: string };
}) {
  const isPercent = commission.type.code === 1;
  const formatted = isPercent
    ? `${Number(commission.value).toFixed(1)}%`
    : `${Number(commission.value).toLocaleString("ar-EG")} ج.م`;

  return (
    <span className="inline-flex items-center gap-1 rounded-lg bg-muted/50 px-2.5 py-1 text-xs font-medium tabular-nums">
      <TrendingUp className="h-3 w-3 text-muted-foreground" />
      {formatted}
    </span>
  );
}

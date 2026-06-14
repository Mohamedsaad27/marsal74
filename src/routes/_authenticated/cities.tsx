import { useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminEntityDialog } from "@/components/admin/AdminEntityDialog";
import { ConfirmActionDialog } from "@/components/admin/ConfirmActionDialog";
import { AdminStatusBadge, activeBadge } from "@/components/admin/AdminStatusBadge";
import { RowActions } from "@/components/admin/RowActions";
import { FormInput, FormSelect, FormSwitch } from "@/components/admin/AdminFormFields";
import { KpiCard } from "@/components/dashboard/KpiCard";
import {
  createCity,
  deleteCity,
  fetchCities,
  fetchCitiesKpis,
  fetchGovernorates,
  toggleCityActive,
  updateCity,
} from "@/lib/admin/locations-api";
import type { City, Governorate, CityPayload } from "@/lib/admin/locations-types";
import type { ConfirmAction, CrudMode } from "@/components/admin/use-admin-crud";
import { Loader2, Map, MapPinned, Power } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/cities")({
  component: CitiesPage,
});

type FormState = {
  id?: string;
  name_ar: string;
  name_en: string;
  code: string;
  governorate_id: string;
  is_active: boolean;
};

function emptyForm(governorateId?: string): FormState {
  return {
    name_ar: "",
    name_en: "",
    code: "",
    governorate_id: governorateId ?? "",
    is_active: true,
  };
}

function CitiesPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [governorates, setGovernorates] = useState<Governorate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounced(search, 400);
  const [govFilter, setGovFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<CrudMode>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const pageSize = 10;

  const [kpis, setKpis] = useState({
    total_cities: 0,
    total_active: 0,
    total_covered_governorates: 0,
  });
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const isActive = statusFilter === "all" ? undefined : statusFilter === "active";
      const govId = govFilter === "all" ? undefined : govFilter;

      const [citiesRes, kpisRes, governoratesRes] = await Promise.all([
        fetchCities(govId, page, pageSize, debouncedSearch, isActive),
        fetchCitiesKpis(),
        fetchGovernorates(),
      ]);

      if (!citiesRes.isSuccess) throw new Error(citiesRes.message);
      setCities(citiesRes.data.items);
      setTotalPages(citiesRes.data.last_page);
      setTotalCount(citiesRes.data.total);

      if (kpisRes.isSuccess && kpisRes.data.kpis) {
        setKpis(kpisRes.data.kpis);
      }

      if (governoratesRes.isSuccess) {
        setGovernorates(governoratesRes.data.items);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل تحميل المدن");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, debouncedSearch, statusFilter, govFilter]);
  useEffect(() => {
    void loadData();
  }, [loadData]);
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, govFilter]);
  const governorateOptions = useMemo(
    () => governorates.map((item) => ({ value: String(item.governorate_id), label: item.name_ar })),
    [governorates],
  );

  const openCreate = () => {
    setDialogMode("create");
    setForm(emptyForm(governorateOptions[0]?.value));
    setDialogOpen(true);
  };

  const openEdit = (item: City) => {
    setDialogMode("edit");
    setForm({
      id: item.city_id,
      name_ar: item.name_ar,
      name_en: item.name_en,
      code: item.code,
      governorate_id: String(item.governorate_id),
      is_active: item.is_active,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name_ar.trim() || !form.name_en.trim() || !form.governorate_id) {
      toast.error("يرجى إكمال جميع الحقول المطلوبة");
      return;
    }
    setSaving(true);
    try {
      const payload: CityPayload = {
        name_ar: form.name_ar.trim(),
        name_en: form.name_en.trim(),
        code: form.code.trim().toLowerCase(),
        governorate_id: form.governorate_id, // ← string UUID now
        is_active: form.is_active,
      };

      if (dialogMode === "create") {
        const response = await createCity(payload);
        if (!response.isSuccess) throw new Error(response.message);
        toast.success(response.message);
      } else if (form.id) {
        const response = await updateCity(form.id, payload); // ← (id, payload) now
        if (!response.isSuccess) throw new Error(response.message);
        toast.success(response.message);
      }

      void loadData();
      setDialogOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل حفظ المدينة");
    } finally {
      setSaving(false);
    }
  };
  const handleToggle = (item: City) => {
    setConfirmAction({
      title: item.is_active === true ? "تعطيل المدينة" : "تفعيل المدينة",
      description: `تأكيد ${item.is_active === true ? "تعطيل" : "تفعيل"} «${item.name_ar}»`,
      confirmLabel: item.is_active === true ? "تعطيل" : "تفعيل",
      variant: item.is_active === true ? "destructive" : "default",
      onConfirm: async () => {
        try {
          const response = await toggleCityActive(item.city_id);
          if (!response.isSuccess) throw new Error(response.message);
          loadData();
          toast.success(item.is_active === true ? "تم تعطيل المدينة" : "تم تفعيل المدينة");
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "فشل تحديث الحالة");
        } finally {
          setConfirmAction(null);
        }
      },
    });
  };

  const handleDelete = (item: City) => {
    setConfirmAction({
      title: "حذف المدينة",
      description: `هل أنت متأكد من حذف «${item.name_ar}»؟`,
      confirmLabel: "حذف",
      variant: "destructive",
      onConfirm: async () => {
        try {
          const response = await deleteCity(item.city_id);
          if (!response.isSuccess) throw new Error(response.message);
          loadData();
          toast.success(response.message);
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "فشل حذف المدينة");
        } finally {
          setConfirmAction(null);
        }
      },
    });
  };

  return (
    <AppShell>
      <AdminPageHeader
        title="المدن"
        tableName="المدن"
        description="إدارة المدن "
        addLabel="إضافة مدينة"
        onAdd={openCreate}
        selectedCount={selectedIds.size}
        onBulkDelete={() => {}}
        extra={
          <Button variant="outline" className="rounded-xl" asChild>
            <Link to="/governorates">
              <Map className="ml-1.5 h-4 w-4" />
              المحافظات
            </Link>
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          label="إجمالي المدن"
          value={String(kpis.total_cities)}
          icon={MapPinned}
          tone="primary"
        />
        <KpiCard label="مدن نشطة" value={String(kpis.total_active)} icon={Power} tone="success" />
        <KpiCard
          label="محافظات مغطاة"
          value={String(kpis.total_covered_governorates)}
          icon={Map}
          tone="info"
        />
      </div>

      <AdminDataTable
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder="بحث بالاسم أو الكود أو المحافظة..."
        filters={[
          {
            id: "gov",
            label: "المحافظة",
            icon: Map,
            value: govFilter,
            onChange: (value) => {
              setGovFilter(value);
              setPage(1);
            },
            options: governorateOptions,
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
              { value: "active", label: "نشطة" },
              { value: "inactive", label: "غير نشطة" },
            ],
          },
        ]}
        columns={[
          { key: "ar", label: "المدينة " },
          { key: "en", label: "city" },
          // { key: "code", label: "code" },
          { key: "status", label: "الحالة" },
          { key: "actions", label: "" },
        ]}
        rows={cities.map((item) => ({
          id: item.city_id,
          cells: [
            <span key="ar" className="font-semibold">
              {item.name_ar}
            </span>,
            <span key="en" className="text-muted-foreground" dir="ltr">
              {item.name_en}
            </span>,
            // <span key="code" className="font-mono text-xs font-bold text-primary" dir="ltr">
            //   {item.code}
            // </span>,

            <AdminStatusBadge key="status" variant={activeBadge(item.is_active)} />,
            <RowActions
              key="actions"
              isActive={item.is_active === true}
              activeLabel="تعطيل"
              inactiveLabel="تفعيل"
              onEdit={() => openEdit(item)}
              onDelete={() => handleDelete(item)}
              onToggleActive={() => handleToggle(item)}
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
        onToggleSelectAll={(ids) =>
          setSelectedIds((prev) => (prev.size === ids.length ? new Set() : new Set(ids)))
        }
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        totalCount={totalCount}
      />
      {loading && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}
      <AdminEntityDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        titleCreate="إضافة مدينة"
        titleEdit="تعديل المدينة"
        onSave={handleSave}
        loading={saving}
      >
        <FormInput
          label="الاسم بالعربية "
          required
          value={form.name_ar}
          onChange={(e) => setForm({ ...form, name_ar: e.target.value })}
        />
        <FormInput
          label="الاسم بالإنجليزية "
          required
          value={form.name_en}
          onChange={(e) => setForm({ ...form, name_en: e.target.value })}
          dir="ltr"
        />
        {/* <FormInput
          label="الكود (code)"
          required
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value.toLowerCase() })}
          dir="ltr"
          className="font-mono lowercase"
        /> */}
        <FormSelect
          label="المحافظة "
          required
          value={form.governorate_id}
          onValueChange={(value) => setForm({ ...form, governorate_id: value })}
          options={governorateOptions}
        />
      </AdminEntityDialog>

      <ConfirmActionDialog action={confirmAction} onOpenChange={() => setConfirmAction(null)} />
    </AppShell>
  );
}
function useDebounced<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

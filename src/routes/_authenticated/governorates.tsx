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
import { FormInput, FormSwitch } from "@/components/admin/AdminFormFields";
import { KpiCard } from "@/components/dashboard/KpiCard";
import {
  createGovernorate,
  deleteGovernorate,
  fetchGovernorates,
  toggleGovernorateActive,
  updateGovernorate,
  fetchGovernoratesKpis,
} from "@/lib/admin/locations-api";
import type { Governorate } from "@/lib/admin/locations-types";
import type { ConfirmAction, CrudMode } from "@/components/admin/use-admin-crud";
import { Loader2, Map, MapPinned, Power } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/governorates")({
  component: GovernoratesPage,
});

type FormState = {
  id?: string;
  name_ar: string;
  name_en: string;
  code: string;
  is_active: boolean;
};

function emptyForm(): FormState {
  return { name_ar: "", name_en: "", code: "", is_active: false };
}

function GovernoratesPage() {
  const [governorates, setGovernorates] = useState<Governorate[]>([]);
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
  const pageSize = 15;

  const [kpis, setKpis] = useState({
    total_governorates: 0,
    total_active: 0,
    total_covered_cities: 0,
  });

  // Add alongside other state
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Update loadData to capture pagination from server
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const isActive = statusFilter === "all" ? undefined : statusFilter === "active";

      const [tableRes, kpisRes] = await Promise.all([
        fetchGovernorates(page, pageSize, search, isActive),
        fetchGovernoratesKpis(),
      ]);

      if (!tableRes.isSuccess) throw new Error(tableRes.message);
      setGovernorates(tableRes.data.items);
      setTotalPages(tableRes.data.last_page); // ← server pagination
      setTotalCount(tableRes.data.total); // ← server total

      if (kpisRes.isSuccess && kpisRes.data.kpis) {
        setKpis(kpisRes.data.kpis);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل تحميل المحافظات");
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);
  useEffect(() => {
    void loadData();
  }, [loadData]);
  const openCreate = () => {
    setDialogMode("create");
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const openEdit = (item: Governorate) => {
    setDialogMode("edit");
    setForm({
      id: item.governorate_id,
      name_ar: item.name_ar,
      name_en: item.name_en,
      code: item.code,
      is_active: item.is_active,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name_ar.trim() || !form.name_en.trim()) {
      toast.error("يرجى إكمال جميع الحقول المطلوبة");
      return;
    }
    setSaving(true);
    try {
      if (dialogMode === "create") {
        const response = await createGovernorate({
          name_ar: form.name_ar.trim(),
          name_en: form.name_en.trim(),
          code: form.code.trim(),
          is_active: form.is_active,
        });
        if (!response.isSuccess) throw new Error(response.message);
        toast.success(response.message);
      } else if (form.id) {
        const response = await updateGovernorate(form.id, {
          name_ar: form.name_ar.trim(),
          name_en: form.name_en.trim(),
          code: form.code.trim(),
          is_active: form.is_active,
        });
        if (!response.isSuccess) throw new Error(response.message);
        toast.success(response.message);
      }
      void loadData(); // ← replaces the two manual fetchGovernorates() calls
      setDialogOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل حفظ المحافظة");
    } finally {
      setSaving(false);
    }
  };
  const handleToggle = (item: Governorate) => {
    setConfirmAction({
      title: item.is_active === true ? "تعطيل المحافظة" : "تفعيل المحافظة",
      description: `تأكيد ${item.is_active === true ? "تعطيل" : "تفعيل"} «${item.name_ar}»`,
      confirmLabel: item.is_active === true ? "تعطيل" : "تفعيل",
      variant: item.is_active === true ? "destructive" : "default",
      onConfirm: async () => {
        try {
          const response = await toggleGovernorateActive(item.governorate_id);
          if (!response.isSuccess) throw new Error(response.message);
          void loadData();
          toast.success(item.is_active === true ? "تم تعطيل المحافظة" : "تم تفعيل المحافظة");
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "فشل تحديث الحالة");
        } finally {
          setConfirmAction(null);
        }
      },
    });
  };

  const handleDelete = (item: Governorate) => {
    setConfirmAction({
      title: "حذف المحافظة",
      description: `هل أنت متأكد من حذف «${item.name_ar}»؟`,
      confirmLabel: "حذف",
      variant: "destructive",
      onConfirm: async () => {
        try {
          const response = await deleteGovernorate(item.governorate_id);
          if (!response.isSuccess) throw new Error(response.message);
          void loadData();
          toast.success(response.message);
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "فشل حذف المحافظة");
        } finally {
          setConfirmAction(null);
        }
      },
    });
  };

  return (
    <AppShell>
      <AdminPageHeader
        title="المحافظات"
        tableName="المحافظات"
        description="إدارة المحافظات "
        addLabel="إضافة محافظة"
        onAdd={openCreate}
        selectedCount={selectedIds.size}
        onBulkDelete={() => {}}
        extra={
          <Button variant="outline" className="rounded-xl" asChild>
            <Link to="/cities">
              <MapPinned className="ml-1.5 h-4 w-4" />
              المدن
            </Link>
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          label="إجمالي المحافظات"
          value={String(kpis.total_governorates)}
          icon={Map}
          tone="primary"
        />
        <KpiCard
          label="محافظات نشطة"
          value={String(kpis.total_active)}
          icon={Power}
          tone="success"
        />
        <KpiCard
          label="إجمالي المدن"
          value={String(kpis.total_covered_cities)}
          icon={MapPinned}
          tone="info"
        />
      </div>

      <AdminDataTable
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder="بحث بالاسم العربي أو الإنجليزي أو الكود..."
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
              { value: "active", label: "نشطة" },
              { value: "inactive", label: "غير نشطة" },
            ],
          },
        ]}
        columns={[
          { key: "ar", label: "المحافظة" },
          { key: "en", label: "governorate" },
          // { key: "code", label: "code" },
          { key: "cities", label: "المدن" },
          { key: "status", label: "الحالة" },
          { key: "actions", label: "" },
        ]}
        rows={governorates.map((item) => ({
          id: item.governorate_id,
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
            <Link
              key="cities"
              to="/cities"
              className="tabular-nums font-semibold text-primary hover:underline"
            >
              {item.cities_count} مدينة
            </Link>,
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
        titleCreate="إضافة محافظة"
        titleEdit="تعديل المحافظة"
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
          placeholder="cai"
          dir="ltr"
          className="font-mono lowercase"
        /> */}
      </AdminEntityDialog>

      <ConfirmActionDialog action={confirmAction} onOpenChange={() => setConfirmAction(null)} />
    </AppShell>
  );
}

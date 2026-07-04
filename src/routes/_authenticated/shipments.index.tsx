import { useCallback, useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { ImportExcelDialog } from "@/components/admin/ImportExcelDialog";
import { OrderCreateDialog } from "@/components/admin/OrderCreateDialog";
import { OrderAssignDialog } from "@/components/admin/OrderAssignDialog";
import { OrderStatusDialog } from "@/components/admin/OrderStatusDialog";
import { RowActions } from "@/components/admin/RowActions";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { ShipmentStatusKpiGrid } from "@/components/dashboard/ShipmentStatusKpiGrid";
import { shipmentsImportConfig } from "@/lib/admin/import-excel-configs";
import {
  assignOrderAgent,
  createOrder,
  exportOrdersExcel,
  fetchAgentOptions,
  fetchCompanyOptions,
  fetchGovernorateOptions,
  fetchOrderStats,
  fetchOrders,
  updateOrderStatus,
  bulkDeleteOrders,
} from "@/lib/admin/orders-api";
import type { AgentOption, CompanyOption, GovernorateOption } from "@/lib/admin/orders-api";
import {
  ORDER_STATUS_OPTIONS,
  formatAmount,
  formatDateTime,
  OrderStatusPayload,
} from "@/lib/admin/orders-types";
import type { ApiOrderStats, CreateOrderPayload, OrderListItem } from "@/lib/admin/orders-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Building2,
  Download,
  Calendar,
  Eye,
  FileSpreadsheet,
  Loader2,
  MapPin,
  Package,
  RefreshCw,
  Truck,
  UserCheck,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ConfirmActionDialog } from "@/components/admin/ConfirmActionDialog";
import { ConfirmAction } from "@/components/admin/use-admin-crud";

export const Route = createFileRoute("/_authenticated/shipments/")({
  component: ShipmentsPage,
});

const PAGE_SIZE = 20;

const EMPTY_STATS: ApiOrderStats = {
  total: 0,
  returned: 0,
  statuses: [],
};

function statsToKpiCounts(stats: ApiOrderStats) {
  const counts = Object.fromEntries(stats.statuses.map((s) => [s.id, s.count]));

  return {
    all: stats.total,
    pending_assignment: counts[1] ?? 0,
    assigned: counts[2] ?? 0,
    in_delivery: counts[3] ?? 0,
    delivered: (counts[5] ?? 0) + (counts[6] ?? 0) + (counts[7] ?? 0),
    delayed_rejected:
      (counts[8] ?? 0) +
      (counts[9] ?? 0) +
      (counts[10] ?? 0) +
      (counts[11] ?? 0) +
      (counts[12] ?? 0) +
      (counts[15] ?? 0),
    returned: stats.returned,
  };
}

const KPI_TO_API: Record<string, string> = {
  all: "all",
  pending_assignment: "1",
  in_delivery: "3",
  delivered: "5",
  delayed_rejected: "",
  returned: "returned",
};

const STATUS_FILTER_OPTIONS = [
  ...ORDER_STATUS_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
];

function apiStatusToKpiBucket(apiStatus: string): string {
  const entry = Object.entries(KPI_TO_API).find(([, v]) => v === apiStatus);
  return entry ? entry[0] : "all";
}

// ─── Date range input ─────────────────────────────────────────────────────────

function DateRangeFilter({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
}: {
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (v: string) => void;
  onDateToChange: (v: string) => void;
}) {
  const hasValue = dateFrom || dateTo;

  return (
    <div className="flex items-end gap-2">
      <div className="flex flex-col gap-1">
        <Label className="text-xs text-muted-foreground">من</Label>
        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => onDateFromChange(e.target.value)}
          max={dateTo || undefined}
          className="h-9 w-36 rounded-xl text-sm"
        />
      </div>
      <div className="flex flex-col gap-1">
        <Label className="text-xs text-muted-foreground">إلى</Label>
        <Input
          type="date"
          value={dateTo}
          onChange={(e) => onDateToChange(e.target.value)}
          min={dateFrom || undefined}
          className="h-9 w-36 rounded-xl text-sm"
        />
      </div>
      {hasValue && (
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0 rounded-xl text-muted-foreground"
          onClick={() => {
            onDateFromChange("");
            onDateToChange("");
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
function DateRangePill({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
}: {
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (v: string) => void;
  onDateToChange: (v: string) => void;
}) {
  const isActive = !!(dateFrom || dateTo);

  return (
    <div
      className={cn(
        "flex h-10 items-stretch overflow-hidden rounded-xl border bg-background shadow-sm transition-colors",
        isActive ? "border-primary/40 ring-1 ring-primary/10" : "border-input",
      )}
    >
      {/* Label section — mirrors the icon+label pill header */}
      <div className="flex shrink-0 items-center gap-1.5 border-s border-border bg-muted/50 px-3">
        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-bold text-muted-foreground">التاريخ</span>
      </div>

      {/* From date */}
      <div className="flex items-center gap-1.5 border-s border-border/60 px-2">
        <span className="text-[11px] text-muted-foreground">من</span>
        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => onDateFromChange(e.target.value)}
          max={dateTo || undefined}
          className={cn(
            "h-7 w-32 rounded-lg border-0 bg-transparent px-1 text-xs shadow-none focus-visible:ring-0",
            isActive && dateFrom && "font-semibold text-primary",
          )}
        />
      </div>

      {/* To date */}
      <div className="flex items-center gap-1.5 border-s border-border/60 px-2">
        <span className="text-[11px] text-muted-foreground">إلى</span>
        <Input
          type="date"
          value={dateTo}
          onChange={(e) => onDateToChange(e.target.value)}
          min={dateFrom || undefined}
          className={cn(
            "h-7 w-32 rounded-lg border-0 bg-transparent px-1 text-xs shadow-none focus-visible:ring-0",
            isActive && dateTo && "font-semibold text-primary",
          )}
        />
      </div>

      {/* Clear button — only when a date is set */}
      {isActive && (
        <button
          type="button"
          onClick={() => {
            onDateFromChange("");
            onDateToChange("");
          }}
          className="flex items-center border-s border-border/60 px-2 text-muted-foreground transition-colors hover:text-destructive"
          aria-label="مسح التاريخ"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function ShipmentsPage() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [stats, setStats] = useState<ApiOrderStats>(EMPTY_STATS);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [agentOptions, setAgentOptions] = useState<AgentOption[]>([]);
  const [companyOptions, setCompanyOptions] = useState<CompanyOption[]>([]);
  const [governorateOptions, setGovernorateOptions] = useState<GovernorateOption[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);

  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [saving, setSaving] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [companyFilter, setCompanyFilter] = useState("all");
  const [agentFilter, setAgentFilter] = useState("all");
  const [governorateFilter, setGovernorateFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState(""); // YYYY-MM-DD
  const [dateTo, setDateTo] = useState(""); // YYYY-MM-DD
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState(""); // raw — bound to input

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [importOpen, setImportOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState<OrderListItem | null>(null);

  // ── fetch filter options once ─────────────────────────────────────────────
  useEffect(() => {
    async function loadOptions() {
      setOptionsLoading(true);
      try {
        const [agents, companies, governorates] = await Promise.all([
          fetchAgentOptions(),
          fetchCompanyOptions(),
          fetchGovernorateOptions(),
        ]);
        if (agents.isSuccess) setAgentOptions(agents.data);
        if (companies.isSuccess) setCompanyOptions(companies.data);
        if (governorates.isSuccess) setGovernorateOptions(governorates.data);
      } catch {
        // non-fatal
      } finally {
        setOptionsLoading(false);
      }
    }
    void loadOptions();
  }, []);

  const loadStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const response = await fetchOrderStats();
      if (!response.isSuccess) throw new Error(response.message);
      setStats(response.data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل تحميل الإحصائيات");
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const loadOrders = useCallback(
    async (targetPage: number) => {
      setLoadingOrders(true);
      try {
        const response = await fetchOrders({
          page: targetPage,
          per_page: PAGE_SIZE,
          status: statusFilter,
          company_id: companyFilter !== "all" ? companyFilter : undefined,
          agent_id: agentFilter !== "all" ? agentFilter : undefined,
          governorate_id: governorateFilter !== "all" ? governorateFilter : undefined,
          date_from: dateFrom || undefined,
          date_to: dateTo || undefined,
          search: search.trim() || undefined,
        });

        if (!response.isSuccess) throw new Error(response.message);

        setOrders(response.data.items);
        setTotalCount(response.data.total);
        setTotalPages(response.data.last_page);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "فشل تحميل الطلبات");
      } finally {
        setLoadingOrders(false);
      }
    },
    [statusFilter, companyFilter, agentFilter, governorateFilter, dateFrom, dateTo, search],
  );
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);
  useEffect(() => {
    void loadOrders(page);
  }, [loadOrders, page]);
  useEffect(() => {
    setPage(1);
  }, [statusFilter, companyFilter, agentFilter, governorateFilter, dateFrom, dateTo, searchInput]);

  const goToOrder = (orderId: string) =>
    void navigate({ to: "/shipments/$orderId", params: { orderId } });

  const handleCreate = async (payload: CreateOrderPayload) => {
    setSaving(true);
    try {
      const response = await createOrder(payload);
      if (!response.isSuccess) throw new Error(response.message);
      toast.success(response.message);
      setCreateOpen(false);
      void loadOrders(1);
      void loadStats();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل إنشاء الطلب");
    } finally {
      setSaving(false);
    }
  };

  const handleAssign = async (agentId: string) => {
    if (!activeOrder) return;
    setSaving(true);
    try {
      const response = await assignOrderAgent(activeOrder.order.order_id, agentId);
      if (!response.isSuccess) throw new Error(response.message);
      toast.success(response.message);
      setAssignOpen(false);
      void loadOrders(page);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل التعيين");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (payload: OrderStatusPayload) => {
    if (!activeOrder) return;
    setSaving(true);
    try {
      const response = await updateOrderStatus(activeOrder.order.order_id, payload);
      if (!response.isSuccess) throw new Error(response.message);
      toast.success(response.message);
      setStatusOpen(false);
      void loadOrders(page);
      void loadStats();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل تحديث الحالة");
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    try {
      await exportOrdersExcel();
      toast.success("تم تصدير الملف بنجاح");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل التصدير");
    }
  };
  const kpiCounts = statsToKpiCounts(stats);
  const kpiActiveId = apiStatusToKpiBucket(statusFilter);
  const isLoading = loadingOrders || loadingStats;
  const requestBulkDelete = () => {
    setConfirmAction({
      title: "حذف متعدد",
      description: `سيتم حذف ${selectedIds.size} طلب. لا يمكن التراجع.`,
      confirmLabel: "حذف الكل",
      variant: "destructive",
      onConfirm: async () => {
        setConfirmAction(null);

        try {
          await bulkDeleteOrders([...selectedIds]);
          toast.success("تم حذف الطلبات المحددة");
          setSelectedIds(new Set());
          await fetchOrders();
        } catch (err) {
          toast.error((err as Error).message ?? "فشل الحذف");
        }
      },
    });
  };
  return (
    <AppShell>
      <AdminPageHeader
        title="الطلبات"
        tableName="orders"
        description="إدارة الطلبات — فلترة متقدمة، إنشاء يدوي، استيراد Excel، وتصدير"
        addLabel="طلب جديد"
        onAdd={() => setCreateOpen(true)}
        selectedCount={selectedIds.size}
        onBulkDelete={requestBulkDelete}
        showAdd={false}
        extra={
          <>
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => {
                void loadOrders(page);
                void loadStats();
              }}
            >
              <RefreshCw className="ms-2 h-4 w-4" />
              تحديث
            </Button>
            <Button variant="outline" className="rounded-xl" onClick={handleExport}>
              <Download className="ms-2 h-4 w-4" />
              تصدير Excel
            </Button>
            <Button variant="outline" className="rounded-xl" onClick={() => setImportOpen(true)}>
              <FileSpreadsheet className="ms-2 h-4 w-4" />
              استيراد من ملف Excel
            </Button>
          </>
        }
      />

      <ShipmentStatusKpiGrid
        activeId={kpiActiveId as "all"}
        onSelect={(bucketId) => setStatusFilter(KPI_TO_API[bucketId] ?? "all")}
        counts={kpiCounts}
      />

      {loadingStats && orders.length === 0 && !searchInput && (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      <AdminDataTable
        search={searchInput}
        onSearchChange={(value) => setSearchInput(value)}
        searchPlaceholder="الكود، المرجع، العميل، الهاتف..."
        filters={[
          {
            id: "status",
            label: "الحالة",
            icon: Package,
            value: statusFilter,
            onChange: (v) => setStatusFilter(v),
            options: STATUS_FILTER_OPTIONS,
            allLabel: "كل الحالات",
          },
          {
            id: "company",
            label: "الشركة",
            icon: Building2,
            value: companyFilter,
            onChange: (v) => setCompanyFilter(v),
            options: [...companyOptions],
            allLabel: "كل الشركات",
          },
          {
            id: "agent",
            label: "المندوب",
            icon: Truck,
            value: agentFilter,
            onChange: (v) => setAgentFilter(v),
            options: [...agentOptions],
            allLabel: "كل المناديب",
          },
          {
            id: "governorate",
            label: "المحافظة",
            icon: MapPin,
            value: governorateFilter,
            onChange: (v) => setGovernorateFilter(v),
            options: [...governorateOptions],
            allLabel: "كل المحافظات",
          },
        ]}
        extraFilters={
          <DateRangePill
            dateFrom={dateFrom}
            dateTo={dateTo}
            onDateFromChange={setDateFrom}
            onDateToChange={setDateTo}
          />
        }
        columns={[
          { key: "code", label: "الكود" },
          { key: "customer", label: "العميل" },
          { key: "zone", label: "المنطقة" },
          { key: "company", label: "الشركة" },
          { key: "agent", label: "المندوب" },
          { key: "amount", label: "المبلغ" },
          { key: "status", label: "الحالة" },
          { key: "created", label: "التاريخ" },
          { key: "actions", label: "", className: "w-12" },
        ]}
        rows={orders.map((item) => ({
          id: item.order.order_id,
          cells: [
            <div key="code">
              <Link
                to="/shipments/$orderId"
                params={{ orderId: item.order.order_id }}
                className="font-mono text-xs font-semibold text-primary hover:underline"
              >
                {item.order.internal_code}
              </Link>
              <p className="font-mono text-[10px] text-muted-foreground">
                {item.order.reference_no}
              </p>
            </div>,
            <div key="customer">
              <p className="font-medium">{item.customer_name}</p>
              <p className="text-[11px] tabular-nums text-muted-foreground">
                {item.customer_phone}
              </p>
            </div>,
            <span key="zone" className="text-muted-foreground">
              {item.governorate_name}
              {item.city_name && item.city_name !== "—" ? ` / ${item.city_name}` : ""}
            </span>,
            item.company_name,
            item.agent_name ?? <span className="text-warning">غير معيّن</span>,
            <span key="amount" className="tabular-nums">
              {formatAmount(item.original_amount)}{" "}
              <span className="text-[10px] text-muted-foreground">ج.م</span>
            </span>,
            <StatusBadge key="status" status={item.status_key} />,
            <span key="created" className="text-xs text-muted-foreground">
              {formatDateTime(item.order.created_at)}
            </span>,
            <RowActions
              key="actions"
              // onEdit={() => goToOrder(item.order.order_id)}
              // onDelete={() => toast.message("حذف الطلب — واجهة تصميمية")}
              extra={[
                {
                  label: "عرض التفاصيل",
                  icon: <Eye className="ml-2 h-4 w-4" />,
                  onClick: () => goToOrder(item.order.order_id),
                },
                {
                  label: "تعيين / إعادة تعيين",
                  icon: <UserCheck className="ml-2 h-4 w-4" />,
                  onClick: () => {
                    setActiveOrder(item);
                    setAssignOpen(true);
                  },
                },
                {
                  label: "تغيير الحالة",
                  icon: <RefreshCw className="ml-2 h-4 w-4" />,
                  onClick: () => {
                    setActiveOrder(item);
                    setStatusOpen(true);
                  },
                },
              ]}
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
          setSelectedIds(selectedIds.size === ids.length ? new Set() : new Set(ids));
        }}
        page={page}
        totalPages={totalPages}
        onPageChange={(p) => setPage(p)}
        totalCount={totalCount}
        emptyMessage={loadingOrders ? "جاري التحميل..." : "لا توجد طلبات مطابقة للفلتر"}
      />

      <ImportExcelDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        config={shipmentsImportConfig}
        onImportComplete={() => {
          void loadOrders(1);
          void loadStats();
        }}
      />
      <OrderCreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSave={handleCreate}
        loading={saving}
      />
      <OrderAssignDialog
        open={assignOpen}
        onOpenChange={setAssignOpen}
        order={activeOrder}
        onSave={handleAssign}
        loading={saving}
      />
      <OrderStatusDialog
        open={statusOpen}
        onOpenChange={setStatusOpen}
        order={activeOrder}
        onSave={handleStatusChange}
        loading={saving}
      />
      <ConfirmActionDialog action={confirmAction} onOpenChange={() => setConfirmAction(null)} />
    </AppShell>
  );
}

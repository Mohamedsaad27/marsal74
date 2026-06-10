import { useCallback, useEffect, useMemo, useState } from "react";
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
  computeKpiCounts,
  createOrder,
  exportOrdersExcel,
  fetchOrders,
  statusMatchesKpiFilter,
  updateOrderStatus,
} from "@/lib/admin/orders-api";
import { AGENT_OPTIONS, COMPANY_OPTIONS, ZONE_OPTIONS } from "@/lib/admin/orders-data";
import { ORDER_STATUS_OPTIONS, formatAmount, formatDateTime } from "@/lib/admin/orders-types";
import type { CreateOrderPayload, OrderListItem } from "@/lib/admin/orders-types";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Calendar,
  Download,
  Eye,
  FileSpreadsheet,
  Loader2,
  MapPin,
  Package,
  RefreshCw,
  Truck,
  UserCheck,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/shipments/")({
  component: ShipmentsPage,
});

function ShipmentsPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [companyFilter, setCompanyFilter] = useState("all");
  const [agentFilter, setAgentFilter] = useState("all");
  const [zoneFilter, setZoneFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [importOpen, setImportOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState<OrderListItem | null>(null);

  const pageSize = 10;

  const goToOrder = (orderId: string) => {
    void navigate({ to: "/shipments/$orderId", params: { orderId } });
  };

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchOrders();
      if (!response.isSuccess) throw new Error(response.message);
      setOrders(response.data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل تحميل الطلبات");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const filtered = useMemo(() => {
    const now = new Date();
    return orders.filter((item) => {
      if (statusFilter !== "all") {
        const isKpiBucket = ["pending_assignment", "in_delivery", "delivered", "delayed_rejected", "returned"].includes(
          statusFilter,
        );
        if (isKpiBucket) {
          if (!statusMatchesKpiFilter(item.order.status, statusFilter)) return false;
        } else if (String(item.order.status) !== statusFilter) {
          return false;
        }
      }
      if (companyFilter !== "all" && item.order.shipping_company_id !== companyFilter) return false;
      if (agentFilter === "unassigned" && item.order.delivery_agent_id) return false;
      if (agentFilter !== "all" && agentFilter !== "unassigned" && item.order.delivery_agent_id !== agentFilter) return false;
      if (zoneFilter !== "all") {
        const cityName = ZONE_OPTIONS.find((z) => z.value === zoneFilter)?.label.split(" — ")[0]?.trim();
        if (cityName && item.city_name !== cityName) return false;
      }

      if (dateFilter !== "all") {
        const created = new Date(item.order.created_at);
        const diffDays = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
        if (dateFilter === "today" && diffDays > 1) return false;
        if (dateFilter === "week" && diffDays > 7) return false;
        if (dateFilter === "month" && diffDays > 30) return false;
      }

      if (!search.trim()) return true;
      const query = search.toLowerCase();
      return (
        item.order.internal_code.toLowerCase().includes(query) ||
        item.order.reference_no.toLowerCase().includes(query) ||
        item.customer_name.toLowerCase().includes(query) ||
        item.customer_phone.includes(query) ||
        item.company_name.toLowerCase().includes(query) ||
        (item.agent_name?.toLowerCase().includes(query) ?? false)
      );
    });
  }, [orders, statusFilter, companyFilter, agentFilter, zoneFilter, dateFilter, search]);

  const paginatedRows = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const kpiCounts = useMemo(() => computeKpiCounts(orders), [orders]);

  const handleCreate = async (payload: CreateOrderPayload) => {
    setSaving(true);
    try {
      const response = await createOrder(payload);
      toast.success(response.message);
      setCreateOpen(false);
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
      toast.success(response.message);
      setAssignOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل التعيين");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (status: number, note: string) => {
    if (!activeOrder) return;
    setSaving(true);
    try {
      const response = await updateOrderStatus(activeOrder.order.order_id, status, note);
      toast.success(response.message);
      setStatusOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل تحديث الحالة");
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await exportOrdersExcel();
      toast.success(`${response.message} — ${response.data.filename}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل التصدير");
    }
  };

  return (
    <AppShell>
      <AdminPageHeader
        title="الطلبات"
        tableName="orders"
        description="إدارة الطلبات — فلترة متقدمة، إنشاء يدوي، استيراد CSV، وتصدير Excel"
        addLabel="طلب جديد"
        onAdd={() => setCreateOpen(true)}
        extra={
          <>
            <Button variant="outline" className="rounded-xl" onClick={() => setImportOpen(true)}>
              <FileSpreadsheet className="ms-2 h-4 w-4" />
              استيراد CSV
            </Button>
            <Button variant="outline" className="rounded-xl" onClick={handleExport}>
              <Download className="ms-2 h-4 w-4" />
              تصدير Excel
            </Button>
          </>
        }
      />

      <ShipmentStatusKpiGrid
        activeId={statusFilter as "all"}
        onSelect={(id) => {
          setStatusFilter(id);
          setPage(1);
        }}
        counts={kpiCounts}
      />

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <AdminDataTable
          search={search}
          onSearchChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          searchPlaceholder="الكود الداخلي، المرجع، العميل، الهاتف..."
          filters={[
            {
              id: "status",
              label: "الحالة",
              icon: Package,
              value: statusFilter,
              onChange: (v) => {
                setStatusFilter(v);
                setPage(1);
              },
              options: [
                { value: "all", label: "الكل" },
                ...ORDER_STATUS_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
              ],
              allLabel: "كل الحالات",
            },
            {
              id: "company",
              label: "الشركة",
              icon: Building2,
              value: companyFilter,
              onChange: (v) => {
                setCompanyFilter(v);
                setPage(1);
              },
              options: [{ value: "all", label: "الكل" }, ...COMPANY_OPTIONS],
              allLabel: "كل الشركات",
            },
            {
              id: "agent",
              label: "المندوب",
              icon: Truck,
              value: agentFilter,
              onChange: (v) => {
                setAgentFilter(v);
                setPage(1);
              },
              options: [
                { value: "all", label: "الكل" },
                { value: "unassigned", label: "غير معيّن" },
                ...AGENT_OPTIONS,
              ],
              allLabel: "كل المناديب",
            },
            {
              id: "zone",
              label: "المنطقة",
              icon: MapPin,
              value: zoneFilter,
              onChange: (v) => {
                setZoneFilter(v);
                setPage(1);
              },
              options: [{ value: "all", label: "الكل" }, ...ZONE_OPTIONS.map((z) => ({ value: z.value, label: z.label }))],
              allLabel: "كل المناطق",
            },
            {
              id: "date",
              label: "التاريخ",
              icon: Calendar,
              value: dateFilter,
              onChange: (v) => {
                setDateFilter(v);
                setPage(1);
              },
              options: [
                { value: "all", label: "الكل" },
                { value: "today", label: "اليوم" },
                { value: "week", label: "آخر 7 أيام" },
                { value: "month", label: "آخر 30 يوم" },
              ],
              allLabel: "كل الفترات",
            },
          ]}
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
          rows={paginatedRows.map((item) => ({
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
                <p className="font-mono text-[10px] text-muted-foreground">{item.order.reference_no}</p>
              </div>,
              <div key="customer">
                <p className="font-medium">{item.customer_name}</p>
                <p className="text-[11px] tabular-nums text-muted-foreground">{item.customer_phone}</p>
              </div>,
              <span key="zone" className="text-muted-foreground">
                {item.governorate_name} / {item.city_name}
              </span>,
              item.company_name,
              item.agent_name ?? <span className="text-warning">غير معيّن</span>,
              <span key="amount" className="tabular-nums">
                {formatAmount(item.original_amount)} <span className="text-[10px] text-muted-foreground">ج.م</span>
              </span>,
              <StatusBadge key="status" status={item.status_key} />,
              <span key="created" className="text-xs text-muted-foreground">
                {formatDateTime(item.order.created_at)}
              </span>,
              <RowActions
                key="actions"
                onEdit={() => goToOrder(item.order.order_id)}
                onDelete={() => toast.message("حذف الطلب — واجهة تصميمية")}
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
          onPageChange={setPage}
          totalCount={filtered.length}
          emptyMessage="لا توجد طلبات مطابقة للفلتر"
        />
      )}

      <ImportExcelDialog open={importOpen} onOpenChange={setImportOpen} config={shipmentsImportConfig} />
      <OrderCreateDialog open={createOpen} onOpenChange={setCreateOpen} onSave={handleCreate} loading={saving} />
      <OrderAssignDialog open={assignOpen} onOpenChange={setAssignOpen} order={activeOrder} onSave={handleAssign} loading={saving} />
      <OrderStatusDialog open={statusOpen} onOpenChange={setStatusOpen} order={activeOrder} onSave={handleStatusChange} loading={saving} />
    </AppShell>
  );
}

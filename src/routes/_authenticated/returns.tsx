import { useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { ConfirmActionDialog } from "@/components/admin/ConfirmActionDialog";
import { ReturnDetailDialog } from "@/components/admin/ReturnDetailDialog";
import { RowActions } from "@/components/admin/RowActions";
import { KpiCard } from "@/components/dashboard/KpiCard";
import {
  computeReturnKpis,
  exportReturnsReport,
  fetchReturns,
  receiveReturn,
  sendReturnToCompany,
} from "@/lib/admin/returns-api";
import { RETURN_AGENT_OPTIONS, RETURN_COMPANY_OPTIONS } from "@/lib/admin/returns-data";
import type { ReturnRecord } from "@/lib/admin/returns-types";
import { RETURN_STATUS_OPTIONS, formatDateTime, returnStatusLabel } from "@/lib/admin/returns-types";
import type { ConfirmAction } from "@/components/admin/use-admin-crud";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Building2,
  Download,
  Eye,
  Loader2,
  PackageCheck,
  PackageX,
  Power,
  Truck,
  Undo2,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/returns")({
  component: ReturnsPage,
});

const statusStyles: Record<number, string> = {
  1: "bg-warning/15 text-warning ring-warning/25",
  2: "bg-info/10 text-info ring-info/20",
  3: "bg-success/10 text-success ring-success/20",
};

function ReturnStatusBadge({ status }: { status: ReturnRecord["return_status"] }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        statusStyles[status],
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {returnStatusLabel(status)}
    </span>
  );
}

function ReturnsPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<ReturnRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [companyFilter, setCompanyFilter] = useState("all");
  const [agentFilter, setAgentFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<ReturnRecord | null>(null);
  const pageSize = 10;

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchReturns();
      if (!response.isSuccess) throw new Error(response.message);
      setItems(response.data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل تحميل المرتجعات");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (statusFilter !== "all" && String(item.return_status) !== statusFilter) return false;
      if (companyFilter !== "all" && item.shipping_company_id !== companyFilter) return false;
      if (agentFilter !== "all" && item.delivery_agent_id !== agentFilter) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        item.return_ref.toLowerCase().includes(q) ||
        item.internal_code.toLowerCase().includes(q) ||
        item.agent_name.toLowerCase().includes(q) ||
        item.company_name.toLowerCase().includes(q) ||
        item.return_reason.toLowerCase().includes(q)
      );
    });
  }, [items, statusFilter, companyFilter, agentFilter, search]);

  const paginatedRows = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const kpis = useMemo(() => computeReturnKpis(items), [items]);

  const handleExport = async () => {
    try {
      const response = await exportReturnsReport();
      toast.success(`${response.message} — ${response.data.filename}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل التصدير");
    }
  };

  const runReceive = async (returnId: string) => {
    try {
      const response = await receiveReturn(returnId);
      toast.success(response.message);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل الاستلام");
    }
  };

  const runSend = async (returnId: string) => {
    try {
      const response = await sendReturnToCompany(returnId);
      toast.success(response.message);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل التسليم");
    }
  };

  return (
    <AppShell>
      <AdminPageHeader
        title="المرتجعات"
        tableName="returns"
        description="تتبع المرتجعات من المندوب → الإدارة → شركة الشحن"
        addLabel="تسجيل مرتجع"
        onAdd={() => toast.message("تسجيل مرتجع — واجهة تصميمية")}
        extra={
          <Button variant="outline" className="rounded-xl" onClick={handleExport}>
            <Download className="ms-2 h-4 w-4" />
            تصدير التقرير
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="إجمالي المرتجعات" value={String(kpis.total)} icon={Undo2} tone="warning" />
        <KpiCard label="بانتظار الاستلام" value={String(kpis.pending)} icon={PackageX} tone="warning" />
        <KpiCard label="مستلمة من المناديب" value={String(kpis.received)} icon={PackageCheck} tone="info" />
        <KpiCard label="مُعادة للشركات" value={String(kpis.sent)} icon={Truck} tone="success" />
      </div>

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
          searchPlaceholder="رقم المرتجع، الطلب، المندوب، السبب..."
          filters={[
            {
              id: "status",
              label: "الحالة",
              icon: Power,
              value: statusFilter,
              onChange: (v) => {
                setStatusFilter(v);
                setPage(1);
              },
              options: [{ value: "all", label: "الكل" }, ...RETURN_STATUS_OPTIONS.map((o) => ({ value: o.value, label: o.label }))],
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
              options: [{ value: "all", label: "الكل" }, ...RETURN_COMPANY_OPTIONS],
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
              options: [{ value: "all", label: "الكل" }, ...RETURN_AGENT_OPTIONS],
              allLabel: "كل المناديب",
            },
          ]}
          columns={[
            { key: "ref", label: "رقم المرتجع" },
            { key: "order", label: "الطلب" },
            { key: "agent", label: "المندوب" },
            { key: "company", label: "الشركة" },
            { key: "qty", label: "الكمية" },
            { key: "reason", label: "السبب" },
            { key: "received", label: "الاستلام" },
            { key: "sent", label: "التسليم للشركة" },
            { key: "status", label: "الحالة" },
            { key: "actions", label: "", className: "w-12" },
          ]}
          rows={paginatedRows.map((item) => ({
            id: item.return_id,
            cells: [
              <span key="ref" className="font-mono text-xs font-semibold text-primary">
                {item.return_ref}
              </span>,
              <Link
                key="order"
                to="/shipments/$orderId"
                params={{ orderId: item.order_id }}
                className="font-mono text-[11px] text-primary hover:underline"
              >
                {item.internal_code}
              </Link>,
              item.agent_name,
              item.company_name,
              <span key="qty" className="font-semibold tabular-nums">
                {item.returned_quantity}
              </span>,
              <span key="reason" className="max-w-[200px] truncate text-muted-foreground" title={item.return_reason}>
                {item.return_reason}
              </span>,
              <span key="received" className="text-xs text-muted-foreground">
                {formatDateTime(item.received_at)}
              </span>,
              <span key="sent" className="text-xs text-muted-foreground">
                {formatDateTime(item.returned_to_company_at)}
              </span>,
              <ReturnStatusBadge key="status" status={item.return_status} />,
              <RowActions
                key="actions"
                onEdit={() => {
                  setActiveItem(item);
                  setDetailOpen(true);
                }}
                onDelete={() => toast.message("حذف المرتجع — واجهة تصميمية")}
                extra={[
                  {
                    label: "عرض الطلب",
                    icon: <Eye className="ml-2 h-4 w-4" />,
                    onClick: () => navigate({ to: "/shipments/$orderId", params: { orderId: item.order_id } }),
                  },
                  ...(item.return_status === 1
                    ? [
                        {
                          label: "استلام من المندوب",
                          icon: <PackageCheck className="ml-2 h-4 w-4" />,
                          onClick: () =>
                            setConfirmAction({
                              title: "استلام المرتجع",
                              description: `تأكيد استلام ${item.return_ref} من ${item.agent_name}`,
                              confirmLabel: "تأكيد الاستلام",
                              onConfirm: () => {
                                setConfirmAction(null);
                                void runReceive(item.return_id);
                              },
                            }),
                        },
                      ]
                    : []),
                  ...(item.return_status === 2
                    ? [
                        {
                          label: "تسليم للشركة",
                          icon: <Truck className="ml-2 h-4 w-4" />,
                          onClick: () =>
                            setConfirmAction({
                              title: "تسليم للشركة",
                              description: `تأكيد تسليم ${item.return_ref} إلى ${item.company_name}`,
                              confirmLabel: "تأكيد التسليم",
                              onConfirm: () => {
                                setConfirmAction(null);
                                void runSend(item.return_id);
                              },
                            }),
                        },
                      ]
                    : []),
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
          onToggleSelectAll={(ids) => setSelectedIds(selectedIds.size === ids.length ? new Set() : new Set(ids))}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          totalCount={filtered.length}
          emptyMessage="لا توجد مرتجعات مطابقة"
        />
      )}

      <ReturnDetailDialog open={detailOpen} onOpenChange={setDetailOpen} item={activeItem} />
      <ConfirmActionDialog action={confirmAction} onOpenChange={() => setConfirmAction(null)} />
    </AppShell>
  );
}

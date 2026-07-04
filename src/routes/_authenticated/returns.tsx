import { useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { ConfirmActionDialog } from "@/components/admin/ConfirmActionDialog";
import { ReturnDetailDialog } from "@/components/admin/ReturnDetailDialog";
import { RowActions } from "@/components/admin/RowActions";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { fetchAgentOptions, fetchCompanyOptions } from "@/lib/admin/orders-api";
import type { AgentOption, CompanyOption } from "@/lib/admin/orders-api";
import {
  exportReturnsReport,
  fetchReturns,
  fetchReturnStats,
  receiveReturn,
  sendReturnToCompany,
} from "@/lib/admin/returns-api";
import type { ReturnFilters } from "@/lib/admin/returns-api";
import type { ReturnKpis, ReturnRecord } from "@/lib/admin/returns-types";
import {
  RETURN_STATUS_OPTIONS,
  formatDateTime,
  returnStatusLabel,
} from "@/lib/admin/returns-types";
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
  const [kpis, setKpis] = useState<ReturnKpis>({ total: 0, pending: 0, received: 0, sent: 0 });
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
  const PAGE_SIZE = 20;

  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [agentOptions, setAgentOptions] = useState<AgentOption[]>([]);
  const [companyOptions, setCompanyOptions] = useState<CompanyOption[]>([]);

  const [optionsLoading, setOptionsLoading] = useState(true);
  const handleFilterChange = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setPage(1);
  };
  useEffect(() => {
    async function loadOptions() {
      setOptionsLoading(true);

      try {
        const [agents, companies] = await Promise.all([fetchAgentOptions(), fetchCompanyOptions()]);

        if (agents.isSuccess) {
          setAgentOptions(agents.data);
        }

        if (companies.isSuccess) {
          setCompanyOptions(companies.data);
        }
      } catch {
        // non-fatal
      } finally {
        setOptionsLoading(false);
      }
    }

    void loadOptions();
  }, []);
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const filters: ReturnFilters = {
        page,
        per_page: PAGE_SIZE,
        status: statusFilter !== "all" ? statusFilter : undefined,
        company_id: companyFilter !== "all" ? companyFilter : undefined,
        agent_id: agentFilter !== "all" ? agentFilter : undefined,
      };
      const [listRes, statsRes] = await Promise.all([fetchReturns(filters), fetchReturnStats()]);
      if (!listRes.isSuccess) throw new Error(listRes.message);
      if (!statsRes.isSuccess) throw new Error(statsRes.message);
      setItems(listRes.data.items);
      setTotalCount(listRes.data.total);
      setTotalPages(listRes.data.last_page);
      setKpis(statsRes.data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل تحميل المرتجعات");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, companyFilter, agentFilter]);
  useEffect(() => {
    void loadData();
  }, [loadData]);

  // client-side search only (filters already applied server-side)
  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(
      (item) =>
        item.agent_name.toLowerCase().includes(q) ||
        item.company_name.toLowerCase().includes(q) ||
        item.return_reason.toLowerCase().includes(q),
    );
  }, [items, search]);

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
      void loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل الاستلام");
    }
  };

  const runSend = async (returnId: string) => {
    try {
      const response = await sendReturnToCompany(returnId);
      toast.success(response.message);
      void loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل التسليم");
    }
  };

  return (
    <AppShell>
      <AdminPageHeader
        module="returns"
        title="المرتجعات"
        tableName="returns"
        description="تتبع المرتجعات من المندوب → الإدارة → شركة الشحن"
        addLabel="تسجيل مرتجع"
        onAdd={() => toast.message("تسجيل مرتجع — واجهة تصميمية")}
        showAdd={false}
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="إجمالي المرتجعات" value={String(kpis.total)} icon={Undo2} tone="warning" />
        <KpiCard
          label="بانتظار الاستلام"
          value={String(kpis.pending)}
          icon={PackageX}
          tone="warning"
        />
        <KpiCard
          label="مستلمة من المناديب"
          value={String(kpis.received)}
          icon={PackageCheck}
          tone="info"
        />
        <KpiCard label="مُعادة للشركات" value={String(kpis.sent)} icon={Truck} tone="success" />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <AdminDataTable
          selectable={false}
          search={search}
          onSearchChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          searchPlaceholder="المندوب، الشركة، السبب..."
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
              options: [...RETURN_STATUS_OPTIONS.map((o) => ({ value: o.value, label: o.label }))],
            },
            {
              id: "company",
              label: "الشركة",
              icon: Building2,
              value: companyFilter,
              onChange: handleFilterChange(setCompanyFilter),
              options: companyOptions,
              allLabel: "كل الشركات",
            },
            {
              id: "agent",
              label: "المندوب",
              icon: Truck,
              value: agentFilter,
              onChange: handleFilterChange(setAgentFilter),
              options: agentOptions,
              allLabel: "كل المناديب",
            },
          ]}
          columns={[
            { key: "id", label: "المعرّف" },
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
          rows={filtered.map((item) => ({
            id: item.return_id,
            cells: [
              <span key="id" className="font-mono text-xs font-semibold text-primary">
                {item.return_id}
              </span>,
              <span key="order" className="font-mono text-[11px] text-muted-foreground">
                {item.order_id}
              </span>,
              item.agent_name,
              item.company_name,
              <span key="qty" className="font-semibold tabular-nums">
                {item.returned_quantity}
              </span>,
              <span
                key="reason"
                className="max-w-[200px] truncate text-muted-foreground"
                title={item.return_reason}
              >
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
                module="returns"
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
                    onClick: () =>
                      navigate({ to: "/shipments/$orderId", params: { orderId: item.order_id } }),
                  },
                  ...(item.return_status === 1
                    ? [
                        {
                          label: "استلام من المندوب",
                          icon: <PackageCheck className="ml-2 h-4 w-4" />,
                          onClick: () =>
                            setConfirmAction({
                              title: "استلام المرتجع",
                              description: `تأكيد استلام المرتجع من ${item.agent_name}`,
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
                              description: `تأكيد تسليم المرتجع إلى ${item.company_name}`,
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
          onToggleSelectAll={(ids) =>
            setSelectedIds(selectedIds.size === ids.length ? new Set() : new Set(ids))
          }
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          totalCount={totalCount}
          emptyMessage="لا توجد مرتجعات مطابقة"
        />
      )}

      <ReturnDetailDialog open={detailOpen} onOpenChange={setDetailOpen} item={activeItem} />
      <ConfirmActionDialog action={confirmAction} onOpenChange={() => setConfirmAction(null)} />
    </AppShell>
  );
}

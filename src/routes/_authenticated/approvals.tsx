import { useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { ApprovalDetailDialog } from "@/components/admin/ApprovalDetailDialog";
import { ExpiryCountdown } from "@/components/admin/ExpiryCountdown";
import { RowActions } from "@/components/admin/RowActions";
import { KpiCard } from "@/components/dashboard/KpiCard";
import {
  approveRequest,
  fetchApprovalRequest,
  fetchApprovalRequests,
  fetchApprovalStats,
  rejectRequest,
  type ApprovalListFilters,
} from "@/lib/admin/approvals-api";
import { APPROVAL_AGENT_OPTIONS } from "@/lib/admin/approvals-data";
import type { ApprovalRequest, ApprovalStats } from "@/lib/admin/approvals-types";
import {
  APPROVAL_STATUS_OPTIONS,
  APPROVAL_TYPE_OPTIONS,
  approvalStatusLabel,
  approvalStatusStyles,
  approvalTypeLabel,
  formatAmount,
} from "@/lib/admin/approvals-types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Clock,
  Eye,
  History,
  Loader2,
  Truck,
  Power,
  ShieldAlert,
  ShieldCheck,
  Tag,
  XCircle,
} from "lucide-react";
import { fetchAgentOptions } from "@/lib/admin/orders-api";
import type { AgentOption } from "@/lib/admin/orders-api";

export const Route = createFileRoute("/_authenticated/approvals")({
  component: ApprovalsPage,
});

function ApprovalStatusBadge({ status }: { status: ApprovalRequest["approval_status"] }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        approvalStatusStyles[status],
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {approvalStatusLabel(status)}
    </span>
  );
}

const EMPTY_STATS: ApprovalStats = {
  pending: 0,
  urgent: 0,
  approved: 0,
  rejected: 0,
  expired: 0,
};

function ApprovalsPage() {
  const navigate = useNavigate();

  // ── Stats ────────────────────────────────────────────────────────────────
  const [stats, setStats] = useState<ApprovalStats>(EMPTY_STATS);

  // ── List state ───────────────────────────────────────────────────────────
  const [items, setItems] = useState<ApprovalRequest[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // ── Filters ──────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [agentOptions, setAgentOptions] = useState<AgentOption[]>([]);
  const [page, setPage] = useState(1);
  const [agentFilter, setAgentFilter] = useState("all");
  const [optionsLoading, setOptionsLoading] = useState(true);
  const PAGE_SIZE = 20;

  // ── Detail dialog ────────────────────────────────────────────────────────
  const [detailOpen, setDetailOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<ApprovalRequest | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [saving, setSaving] = useState(false);

  // ── Selection ────────────────────────────────────────────────────────────
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // ── Data loading ─────────────────────────────────────────────────────────
  useEffect(() => {
    async function loadAgents() {
      setOptionsLoading(true);

      try {
        const response = await fetchAgentOptions();

        if (response.isSuccess) {
          setAgentOptions(response.data);
        }
      } catch {
        // ignore
      } finally {
        setOptionsLoading(false);
      }
    }

    void loadAgents();
  }, []);
  const loadStats = useCallback(async () => {
    const res = await fetchApprovalStats();
    if (res.isSuccess) setStats(res.data);
  }, []);

  const loadList = useCallback(async () => {
    setLoading(true);
    try {
      const filters: ApprovalListFilters = {
        page,
        per_page: PAGE_SIZE,
      };
      if (statusFilter !== "all") filters.status = statusFilter;
      if (typeFilter !== "all") filters.type = typeFilter;
      if (agentFilter !== "all") filters.agent_id = agentFilter;

      const res = await fetchApprovalRequests(filters);
      if (!res.isSuccess) throw new Error(res.message);

      setItems(res.data.items);
      setTotalCount(res.data.total);
      setTotalPages(res.data.last_page);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل تحميل طلبات الموافقة");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, typeFilter, agentFilter]);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  // Reset to page 1 when filters change
  const handleFilterChange = (setter: (v: string) => void) => (v: string) => {
    setter(v);
    setPage(1);
  };

  // ── Client-side search (within current page) ─────────────────────────────
  const filteredRows = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(
      (item) =>
        item.ref?.toLowerCase().includes(q) ||
        item.internal_code?.toLowerCase().includes(q) ||
        item.requested_by_name?.toLowerCase().includes(q) ||
        item.company_name?.toLowerCase().includes(q) ||
        item.reason?.toLowerCase().includes(q),
    );
  }, [items, search]);

  // ── Detail open ──────────────────────────────────────────────────────────

  const openDetail = async (item: ApprovalRequest) => {
    // Optimistically open with list data
    setActiveItem(item);
    setDetailOpen(true);
    // Then hydrate with full detail (has customer_name, governorate, city)
    setLoadingDetail(true);
    try {
      const res = await fetchApprovalRequest(item.approval_request_id);
      if (res.isSuccess) setActiveItem(res.data);
    } catch {
      // keep list data if detail fetch fails
    } finally {
      setLoadingDetail(false);
    }
  };

  // ── Approve / Reject ──────────────────────────────────────────────────────

  const handleApprove = async (note: string) => {
    if (!activeItem) return;
    setSaving(true);
    try {
      const response = await approveRequest(activeItem.approval_request_id, note);
      if (!response.isSuccess) throw new Error(response.message);
      toast.success(response.message || "تمت الموافقة على الطلب");
      setDetailOpen(false);
      await Promise.all([loadStats(), loadList()]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل الموافقة");
    } finally {
      setSaving(false);
    }
  };

  const handleReject = async (note: string) => {
    if (!activeItem) return;
    setSaving(true);
    try {
      const response = await rejectRequest(activeItem.approval_request_id, note);
      if (!response.isSuccess) throw new Error(response.message);
      toast.success(response.message || "تم رفض الطلب");
      setDetailOpen(false);
      await Promise.all([loadStats(), loadList()]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل الرفض");
    } finally {
      setSaving(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <AppShell>
      <AdminPageHeader
        title="طلبات الموافقة"
        tableName="approval_requests"
        description="تعديل الأسعار، رسوم الشحن، والتحصيل الجزئي — مع مهلة انتهاء وسجل مراجعة"
        addLabel="طلب جديد"
        showAdd={false}
        onAdd={() => toast.message("إنشاء طلب موافقة")}
      />

      {/* KPI cards — driven by /stats endpoint */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard label="بانتظار الرد" value={String(stats.pending)} icon={Clock} tone="warning" />
        <KpiCard
          label="عاجلة (<30 د)"
          value={String(stats.urgent)}
          icon={ShieldAlert}
          tone="primary"
        />
        <KpiCard
          label="تمت الموافقة"
          value={String(stats.approved)}
          icon={ShieldCheck}
          tone="success"
        />
        <KpiCard label="مرفوضة" value={String(stats.rejected)} icon={XCircle} tone="info" />
        <KpiCard label="منتهية بدون رد" value={String(stats.expired)} icon={History} tone="info" />
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
          }}
          searchPlaceholder="رقم الطلب، كود التوصيل، المندوب، الشركة..."
          filters={[
            {
              id: "status",
              label: "الحالة",
              icon: Power,
              value: statusFilter,
              onChange: handleFilterChange(setStatusFilter),
              options: [
                ...APPROVAL_STATUS_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
              ],
              allLabel: "كل الحالات",
            },
            {
              id: "type",
              label: "النوع",
              icon: Tag,
              value: typeFilter,
              onChange: handleFilterChange(setTypeFilter),
              options: [...APPROVAL_TYPE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))],
              allLabel: "كل الأنواع",
            },
            {
              id: "agent",
              label: "المندوب",
              icon: Truck,
              value: agentFilter,
              onChange: handleFilterChange(setAgentFilter),
              options: [...agentOptions],
              allLabel: "كل المناديب",
            },
          ]}
          columns={[
            { key: "ref", label: "رقم الطلب" },
            { key: "order", label: "طلب التوصيل" },
            { key: "company", label: "الشركة" },
            { key: "agent", label: "المندوب" },
            { key: "type", label: "النوع" },
            { key: "original", label: "الأصلي" },
            { key: "requested", label: "المطلوب" },
            { key: "by", label: "طلبه" },
            { key: "reason", label: "السبب" },
            { key: "expires", label: "الانتهاء" },
            { key: "status", label: "الحالة" },
            { key: "actions", label: "", className: "w-12" },
          ]}
          rows={filteredRows.map((item) => ({
            id: item.approval_request_id,
            cells: [
              <span key="ref" className="font-mono text-xs font-semibold text-primary">
                {item.ref}
              </span>,
              <Link
                key="order"
                to="/shipments/$orderId"
                params={{ orderId: item.order_id }}
                className="font-mono text-[11px] text-primary hover:underline"
              >
                {item.internal_code}
              </Link>,
              item.company_name,
              item.agent_name,
              <span
                key="type"
                className="inline-flex rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground"
              >
                {approvalTypeLabel(item.approval_type)}
              </span>,
              <span key="original" className="tabular-nums text-muted-foreground line-through">
                {formatAmount(item.original_amount)}
              </span>,
              <span key="requested" className="font-bold tabular-nums">
                {formatAmount(item.requested_amount)}{" "}
                <span className="text-[10px] font-normal text-muted-foreground">ج.م</span>
              </span>,
              item.requested_by_name,
              <span
                key="reason"
                className="max-w-[180px] truncate text-muted-foreground"
                title={item.reason}
              >
                {item.reason || "—"}
              </span>,
              item.approval_status === 1 ? (
                <ExpiryCountdown key="expires" expiresAt={item.expires_at} />
              ) : (
                <span key="expires" className="text-xs text-muted-foreground">
                  —
                </span>
              ),
              <ApprovalStatusBadge key="status" status={item.approval_status} />,
              <RowActions
                key="actions"
                // onEdit={() => openDetail(item)}
                // onDelete={() => toast.message("حذف الطلب — غير متاح")}
                extra={[
                  {
                    label: item.approval_status === 1 ? "مراجعة / موافقة" : "عرض التفاصيل",
                    icon: <ShieldCheck className="ml-2 h-4 w-4" />,
                    onClick: () => openDetail(item),
                  },
                  {
                    label: "عرض الطلب",
                    icon: <Eye className="ml-2 h-4 w-4" />,
                    onClick: () =>
                      navigate({ to: "/shipments/$orderId", params: { orderId: item.order_id } }),
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
          onToggleSelectAll={(ids) =>
            setSelectedIds(selectedIds.size === ids.length ? new Set() : new Set(ids))
          }
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          totalCount={totalCount}
          emptyMessage="لا توجد طلبات مطابقة"
        />
      )}

      <ApprovalDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        item={activeItem}
        history={[]}
        onApprove={activeItem?.approval_status === 1 ? handleApprove : undefined}
        onReject={activeItem?.approval_status === 1 ? handleReject : undefined}
        loading={saving || loadingDetail}
        reviewMode="admin"
      />
    </AppShell>
  );
}

import { useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { ApprovalDetailDialog } from "@/components/admin/ApprovalDetailDialog";
import { ApprovalHistoryTimeline } from "@/components/admin/ApprovalHistoryTimeline";
import { ExpiryCountdown } from "@/components/admin/ExpiryCountdown";
import { PendingApprovalsPanel } from "@/components/admin/PendingApprovalsPanel";
import { RowActions } from "@/components/admin/RowActions";
import { KpiCard } from "@/components/dashboard/KpiCard";
import {
  approveRequest,
  computeApprovalKpis,
  fetchApprovalHistory,
  fetchApprovalRequests,
  filterByCompany,
  getCompanyReviewer,
  getHistoryForRequest,
  getPendingApprovals,
  rejectRequest,
} from "@/lib/admin/approvals-api";
import {
  APPROVAL_AGENT_OPTIONS,
  APPROVAL_COMPANY_OPTIONS,
  MOCK_COMPANY_REVIEWER,
} from "@/lib/admin/approvals-data";
import type { ApprovalHistoryEntry, ApprovalRequest } from "@/lib/admin/approvals-types";
import {
  APPROVAL_STATUS_OPTIONS,
  APPROVAL_TYPE_OPTIONS,
  approvalStatusLabel,
  approvalStatusStyles,
  approvalTypeLabel,
  formatAmount,
} from "@/lib/admin/approvals-types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  Building2,
  Clock,
  Eye,
  History,
  Loader2,
  Power,
  ShieldAlert,
  ShieldCheck,
  Tag,
  XCircle,
} from "lucide-react";

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

function ApprovalsPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<ApprovalRequest[]>([]);
  const [history, setHistory] = useState<ApprovalHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("admin");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [agentFilter, setAgentFilter] = useState("all");
  const [companyPortalId, setCompanyPortalId] = useState(MOCK_COMPANY_REVIEWER.company_id);
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [detailOpen, setDetailOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<ApprovalRequest | null>(null);
  const pageSize = 10;

  const isCompanyView = tab === "company";

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [requestsRes, historyRes] = await Promise.all([fetchApprovalRequests(), fetchApprovalHistory()]);
      if (!requestsRes.isSuccess) throw new Error(requestsRes.message);
      if (!historyRes.isSuccess) throw new Error(historyRes.message);
      setItems(requestsRes.data);
      setHistory(historyRes.data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل تحميل طلبات الموافقة");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const baseItems = useMemo(() => {
    if (!isCompanyView) return items;
    return filterByCompany(items, companyPortalId);
  }, [items, isCompanyView, companyPortalId]);

  const pendingItems = useMemo(() => getPendingApprovals(baseItems), [baseItems]);

  const filtered = useMemo(() => {
    return baseItems.filter((item) => {
      if (statusFilter !== "all" && String(item.approval_status) !== statusFilter) return false;
      if (typeFilter !== "all" && String(item.approval_type) !== typeFilter) return false;
      if (agentFilter !== "all" && item.requested_by_id !== agentFilter) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        item.ref.toLowerCase().includes(q) ||
        item.internal_code.toLowerCase().includes(q) ||
        item.requested_by_name.toLowerCase().includes(q) ||
        item.company_name.toLowerCase().includes(q) ||
        item.reason.toLowerCase().includes(q)
      );
    });
  }, [baseItems, statusFilter, typeFilter, agentFilter, search]);

  const paginatedRows = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const kpis = useMemo(() => computeApprovalKpis(baseItems), [baseItems]);

  const activeHistory = useMemo(
    () => (activeItem ? getHistoryForRequest(activeItem.approval_request_id, history) : []),
    [activeItem, history],
  );

  const openDetail = (item: ApprovalRequest) => {
    setActiveItem(item);
    setDetailOpen(true);
  };

  const companyReviewer = getCompanyReviewer(companyPortalId);

  const handleApprove = async (note: string) => {
    if (!activeItem) return;
    setSaving(true);
    try {
      const reviewer = isCompanyView ? companyReviewer : undefined;
      const response = await approveRequest(activeItem.approval_request_id, note, reviewer);
      if (!response.isSuccess) throw new Error(response.message);
      toast.success(response.message);
      setDetailOpen(false);
      await loadData();
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
      const reviewer = isCompanyView ? companyReviewer : undefined;
      const response = await rejectRequest(activeItem.approval_request_id, note, reviewer);
      if (!response.isSuccess) throw new Error(response.message);
      toast.success(response.message);
      setDetailOpen(false);
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل الرفض");
    } finally {
      setSaving(false);
    }
  };

  const companyName = APPROVAL_COMPANY_OPTIONS.find((o) => o.value === companyPortalId)?.label ?? "—";

  const historyForView = useMemo(() => {
    const ids = new Set(baseItems.map((i) => i.approval_request_id));
    return history.filter((entry) => ids.has(entry.approval_request_id));
  }, [history, baseItems]);

  return (
    <AppShell>
      <AdminPageHeader
        title="طلبات الموافقة"
        tableName="approval_requests"
        description="تعديل الأسعار، رسوم الشحن، والتحصيل الجزئي — مع مهلة انتهاء وسجل مراجعة"
        addLabel="طلب جديد"
        showAdd={!isCompanyView}
        onAdd={() => toast.message("إنشاء طلب موافقة — واجهة تصميمية")}
        extra={
          !isCompanyView ? (
            <Button variant="outline" className="rounded-xl" onClick={() => toast.message("إعدادات مؤقت الانتهاء — واجهة تصميمية")}>
              إعدادات مؤقت الانتهاء
            </Button>
          ) : undefined
        }
      />

      <Tabs
        value={tab}
        onValueChange={(v) => {
          setTab(v);
          setPage(1);
          setStatusFilter("all");
        }}
        dir="rtl"
        className="mb-6"
      >
        <TabsList className="h-10 w-full justify-start rounded-xl bg-muted/50 p-1 sm:w-auto">
          <TabsTrigger value="admin" className="rounded-lg px-4">
            لوحة الإدارة
          </TabsTrigger>
          <TabsTrigger value="company" className="rounded-lg gap-1.5 px-4">
            <Building2 className="h-3.5 w-3.5" />
            موافقات الشركة
          </TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="mt-4">
          <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-muted/20 p-4">
            <Building2 className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-semibold">عرض شركة الشحن (محاكاة)</p>
              <p className="text-xs text-muted-foreground">
                مراجعة وموافقة/رفض الطلبات المعلّقة — {MOCK_COMPANY_REVIEWER.name}
              </p>
            </div>
            <select
              value={companyPortalId}
              onChange={(e) => {
                setCompanyPortalId(e.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
            >
              {APPROVAL_COMPANY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <p className="text-sm text-muted-foreground">
            طلبات <span className="font-semibold text-foreground">{companyName}</span> — {pendingItems.length} بانتظار
            الرد
          </p>
        </TabsContent>
      </Tabs>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard label="بانتظار الرد" value={String(kpis.pending)} icon={Clock} tone="warning" />
        <KpiCard label="عاجلة (<30 د)" value={String(kpis.urgent)} icon={ShieldAlert} tone="primary" />
        <KpiCard label="تمت الموافقة" value={String(kpis.approved)} icon={ShieldCheck} tone="success" />
        <KpiCard label="مرفوضة" value={String(kpis.rejected)} icon={XCircle} tone="info" />
        <KpiCard label="منتهية بدون رد" value={String(kpis.expired)} icon={History} tone="info" />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <PendingApprovalsPanel items={pendingItems} onReview={openDetail} />

          <AdminDataTable
            search={search}
            onSearchChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            searchPlaceholder="رقم الطلب، كود التوصيل، المندوب، الشركة..."
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
                options: [{ value: "all", label: "الكل" }, ...APPROVAL_STATUS_OPTIONS.map((o) => ({ value: o.value, label: o.label }))],
                allLabel: "كل الحالات",
              },
              {
                id: "type",
                label: "النوع",
                icon: Tag,
                value: typeFilter,
                onChange: (v) => {
                  setTypeFilter(v);
                  setPage(1);
                },
                options: [{ value: "all", label: "الكل" }, ...APPROVAL_TYPE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))],
                allLabel: "كل الأنواع",
              },
              ...(!isCompanyView
                ? [
                    {
                      id: "agent",
                      label: "المندوب",
                      icon: ShieldCheck,
                      value: agentFilter,
                      onChange: (v: string) => {
                        setAgentFilter(v);
                        setPage(1);
                      },
                      options: [{ value: "all", label: "الكل" }, ...APPROVAL_AGENT_OPTIONS],
                      allLabel: "كل المناديب",
                    },
                  ]
                : []),
            ]}
            columns={[
              { key: "ref", label: "رقم الطلب" },
              { key: "order", label: "طلب التوصيل" },
              { key: "company", label: "الشركة" },
              { key: "type", label: "النوع" },
              { key: "original", label: "الأصلي" },
              { key: "requested", label: "المطلوب" },
              { key: "by", label: "طلبه" },
              { key: "reason", label: "السبب" },
              { key: "expires", label: "الانتهاء" },
              { key: "status", label: "الحالة" },
              { key: "actions", label: "", className: "w-12" },
            ]}
            rows={paginatedRows.map((item) => ({
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
                <span key="reason" className="max-w-[180px] truncate text-muted-foreground" title={item.reason}>
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
                  onEdit={() => openDetail(item)}
                  onDelete={() => toast.message("حذف الطلب — واجهة تصميمية")}
                  extra={[
                    {
                      label: item.approval_status === 1 ? "مراجعة / موافقة" : "عرض التفاصيل",
                      icon: <ShieldCheck className="ml-2 h-4 w-4" />,
                      onClick: () => openDetail(item),
                    },
                    {
                      label: "عرض الطلب",
                      icon: <Eye className="ml-2 h-4 w-4" />,
                      onClick: () => navigate({ to: "/shipments/$orderId", params: { orderId: item.order_id } }),
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
            onToggleSelectAll={(ids) => setSelectedIds(selectedIds.size === ids.length ? new Set() : new Set(ids))}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            totalCount={filtered.length}
            emptyMessage={isCompanyView ? "لا توجد طلبات لهذه الشركة" : "لا توجد طلبات مطابقة"}
          />

          <div className="mt-8 rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="mb-4 flex items-center gap-2">
              <History className="h-4 w-4 text-primary" />
              <h2 className="text-base font-bold">سجل الموافقات</h2>
              <span className="text-xs text-muted-foreground">({historyForView.length} إجراء)</span>
            </div>
            <ApprovalHistoryTimeline entries={historyForView} />
          </div>
        </>
      )}

      <ApprovalDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        item={activeItem}
        history={activeHistory}
        onApprove={activeItem?.approval_status === 1 ? handleApprove : undefined}
        onReject={activeItem?.approval_status === 1 ? handleReject : undefined}
        loading={saving}
        reviewMode={isCompanyView ? "company" : "admin"}
      />
    </AppShell>
  );
}

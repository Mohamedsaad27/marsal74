import { useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AgentCollectionSummaryGrid } from "@/components/admin/AgentCollectionSummaryGrid";
import { CollectionDetailDialog } from "@/components/admin/CollectionDetailDialog";
import { ReceiveCashDialog } from "@/components/admin/ReceiveCashDialog";
import { RowActions } from "@/components/admin/RowActions";
import { KpiCard } from "@/components/dashboard/KpiCard";
import {
  computeAgentSummaries,
  computeCollectionKpis,
  exportCollections,
  fetchCollections,
  getPendingCollectionsForAgent,
  receiveCashFromAgent,
} from "@/lib/admin/collections-api";
import { COLLECTION_AGENT_OPTIONS } from "@/lib/admin/collections-data";
import type { AgentCollectionSummary, CollectionRecord } from "@/lib/admin/collections-types";
import {
  COLLECTION_TYPE_OPTIONS,
  collectionTypeLabel,
  collectionTypeStyles,
  formatAmount,
  formatDateTime,
} from "@/lib/admin/collections-types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Banknote,
  Calendar,
  CheckCircle2,
  Coins,
  Download,
  Eye,
  Loader2,
  Tag,
  Truck,
  Wallet,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/collections")({
  component: CollectionsPage,
});

function CollectionTypeBadge({ type }: { type: CollectionRecord["collection_type"] }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        collectionTypeStyles[type],
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {collectionTypeLabel(type)}
    </span>
  );
}

function CollectionsPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<CollectionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [agentFilter, setAgentFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [detailOpen, setDetailOpen] = useState(false);
  const [cashOpen, setCashOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<CollectionRecord | null>(null);
  const [activeAgent, setActiveAgent] = useState<AgentCollectionSummary | null>(null);
  const pageSize = 10;

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchCollections();
      if (!response.isSuccess) throw new Error(response.message);
      setItems(response.data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل تحميل التحصيلات");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filtered = useMemo(() => {
    const now = new Date();
    return items.filter((item) => {
      if (agentFilter !== "all" && item.delivery_agent_id !== agentFilter) return false;
      if (typeFilter !== "all" && String(item.collection_type) !== typeFilter) return false;

      if (dateFilter !== "all") {
        const collected = new Date(item.collected_at);
        const diffDays = (now.getTime() - collected.getTime()) / (1000 * 60 * 60 * 24);
        if (dateFilter === "today" && diffDays > 1) return false;
        if (dateFilter === "week" && diffDays > 7) return false;
        if (dateFilter === "month" && diffDays > 30) return false;
      }

      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        item.internal_code.toLowerCase().includes(q) ||
        item.agent_name.toLowerCase().includes(q) ||
        item.company_name.toLowerCase().includes(q) ||
        item.collection_id.toLowerCase().includes(q)
      );
    });
  }, [items, agentFilter, typeFilter, dateFilter, search]);

  const paginatedRows = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const kpis = useMemo(() => computeCollectionKpis(items), [items]);
  const agentSummaries = useMemo(() => computeAgentSummaries(items), [items]);
  const pendingForAgent = useMemo(
    () => (activeAgent ? getPendingCollectionsForAgent(items, activeAgent.delivery_agent_id) : []),
    [items, activeAgent],
  );

  const openReceiveCash = (agent: AgentCollectionSummary) => {
    setActiveAgent(agent);
    setCashOpen(true);
  };

  const handleReceiveCash = async (collectionIds: string[], note: string) => {
    if (!activeAgent) return;
    setSaving(true);
    try {
      const response = await receiveCashFromAgent(activeAgent.delivery_agent_id, collectionIds, note);
      toast.success(response.message);
      setCashOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل تسجيل الاستلام");
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await exportCollections();
      toast.success(`${response.message} — ${response.data.filename}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل التصدير");
    }
  };

  return (
    <AppShell>
      <AdminPageHeader
        title="التحصيلات"
        tableName="collections"
        description="عمليات التحصيل من العميل — COD / رسوم شحن / جزئي + استلام النقد من المناديب"
        addLabel="تسجيل تحصيل"
        onAdd={() => toast.message("تسجيل تحصيل — واجهة تصميمية")}
        extra={
          <Button variant="outline" className="rounded-xl" onClick={handleExport}>
            <Download className="ms-2 h-4 w-4" />
            تصدير Excel
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="إجمالي المحصّل"
          value={`${formatAmount(kpis.totalCollected)} ج.م`}
          icon={Wallet}
          tone="primary"
        />
        <KpiCard
          label="عمولات النظام"
          value={`${formatAmount(kpis.totalCommission)} ج.م`}
          icon={Coins}
          tone="info"
        />
        <KpiCard
          label="صافي مستحق للشركات"
          value={`${formatAmount(kpis.totalNetDue)} ج.م`}
          icon={Banknote}
          tone="success"
        />
        <KpiCard
          label="بانتظار استلام النقد"
          value={String(kpis.pendingHandoff)}
          icon={CheckCircle2}
          tone="warning"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <AgentCollectionSummaryGrid summaries={agentSummaries} onReceiveCash={openReceiveCash} />

          <AdminDataTable
            search={search}
            onSearchChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            searchPlaceholder="كود الطلب، المندوب، الشركة..."
            filters={[
              {
                id: "agent",
                label: "المندوب",
                icon: Truck,
                value: agentFilter,
                onChange: (v) => {
                  setAgentFilter(v);
                  setPage(1);
                },
                options: [{ value: "all", label: "الكل" }, ...COLLECTION_AGENT_OPTIONS],
                allLabel: "كل المناديب",
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
                options: [{ value: "all", label: "الكل" }, ...COLLECTION_TYPE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))],
                allLabel: "كل الأنواع",
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
              { key: "order", label: "الطلب" },
              { key: "agent", label: "المندوب" },
              { key: "company", label: "الشركة" },
              { key: "type", label: "النوع" },
              { key: "collected", label: "المحصّل" },
              { key: "commission", label: "العمولة" },
              { key: "net", label: "الصافي" },
              { key: "handoff", label: "استلام النقد" },
              { key: "settled", label: "التسوية" },
              { key: "date", label: "التاريخ" },
              { key: "actions", label: "", className: "w-12" },
            ]}
            rows={paginatedRows.map((item) => ({
              id: item.collection_id,
              cells: [
                <Link
                  key="order"
                  to="/shipments/$orderId"
                  params={{ orderId: item.order_id }}
                  className="font-mono text-xs font-semibold text-primary hover:underline"
                >
                  {item.internal_code}
                </Link>,
                item.agent_name,
                item.company_name,
                <CollectionTypeBadge key="type" type={item.collection_type} />,
                <span key="collected" className="font-semibold tabular-nums">
                  {formatAmount(item.collected_amount)}
                </span>,
                <span key="commission" className="tabular-nums text-muted-foreground">
                  −{formatAmount(item.commission_amount)}
                </span>,
                <span key="net" className="font-bold tabular-nums">
                  {formatAmount(item.net_due_company)}{" "}
                  <span className="text-[10px] font-normal text-muted-foreground">ج.م</span>
                </span>,
                item.cash_received_by_admin === 1 ? (
                  <span key="handoff" className="inline-flex items-center gap-1 text-xs text-success">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    تم الاستلام
                  </span>
                ) : (
                  <span key="handoff" className="text-xs font-semibold text-warning">
                    بانتظار التسليم
                  </span>
                ),
                item.is_settled === 1 ? (
                  <span key="settled" className="inline-flex items-center gap-1 text-xs text-success">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    مسوّاة
                  </span>
                ) : (
                  <span key="settled" className="text-xs text-warning">
                    معلّقة
                  </span>
                ),
                <span key="date" className="text-xs text-muted-foreground">
                  {formatDateTime(item.collected_at)}
                </span>,
                <RowActions
                  key="actions"
                  onEdit={() => {
                    setActiveItem(item);
                    setDetailOpen(true);
                  }}
                  onDelete={() => toast.message("حذف التحصيل — واجهة تصميمية")}
                  extra={[
                    {
                      label: "عرض التفاصيل",
                      icon: <Eye className="ml-2 h-4 w-4" />,
                      onClick: () => {
                        setActiveItem(item);
                        setDetailOpen(true);
                      },
                    },
                    {
                      label: "عرض الطلب",
                      icon: <Eye className="ml-2 h-4 w-4" />,
                      onClick: () => navigate({ to: "/shipments/$orderId", params: { orderId: item.order_id } }),
                    },
                    ...(item.cash_received_by_admin === 0
                      ? [
                          {
                            label: "استلام نقد من المندوب",
                            icon: <Banknote className="ml-2 h-4 w-4" />,
                            onClick: () => {
                              const agent = agentSummaries.find((a) => a.delivery_agent_id === item.delivery_agent_id);
                              if (agent) openReceiveCash(agent);
                            },
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
            emptyMessage="لا توجد تحصيلات مطابقة"
          />
        </>
      )}

      <CollectionDetailDialog open={detailOpen} onOpenChange={setDetailOpen} item={activeItem} />
      <ReceiveCashDialog
        open={cashOpen}
        onOpenChange={setCashOpen}
        agent={activeAgent}
        pendingItems={pendingForAgent}
        onSave={handleReceiveCash}
        loading={saving}
      />
    </AppShell>
  );
}

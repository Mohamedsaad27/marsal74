import { useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { CollectionDetailDialog } from "@/components/admin/CollectionDetailDialog";
import { ReceiveCashDialog } from "@/components/admin/ReceiveCashDialog";
import { RowActions } from "@/components/admin/RowActions";
import { KpiCard } from "@/components/dashboard/KpiCard";
import {
  computeAgentSummaries,
  fetchCollectionStats,
  exportCollections,
  fetchCollections,
  getPendingCollectionsForAgent,
  receiveCashFromAgent,
} from "@/lib/admin/collections-api";
import { fetchAgentOptions } from "@/lib/admin/orders-api";
import type { AgentOption } from "@/lib/admin/orders-api";
import type { AgentCollectionSummary, CollectionRecord } from "@/lib/admin/collections-types";
import {
  COLLECTION_TYPE_OPTIONS,
  collectionTypeLabel,
  formatAmount,
  collectionTypeStyles,
  formatDateTime,
} from "@/lib/admin/collections-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  Banknote,
  Calendar,
  CheckCircle2,
  Coins,
  Eye,
  Loader2,
  Tag,
  Truck,
  Wallet,
  X,
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

// ─── Date range pill (same as shipments) ─────────────────────────────────────

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
      <div className="flex shrink-0 items-center gap-1.5 border-s border-border bg-muted/50 px-3">
        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-bold text-muted-foreground">التاريخ</span>
      </div>
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

function CollectionsPage() {
  const [items, setItems] = useState<CollectionRecord[]>([]);
  const [agentOptions, setAgentOptions] = useState<AgentOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState(""); // raw — bound to input

  const [agentFilter, setAgentFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [detailOpen, setDetailOpen] = useState(false);
  const [cashOpen, setCashOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<CollectionRecord | null>(null);
  const [activeAgent, setActiveAgent] = useState<AgentCollectionSummary | null>(null);
  const pageSize = 10;

  const [kpiData, setKpiData] = useState({
    totalCollected: 0,
    totalCommission: 0,
    totalNetDue: 0,
    pendingHandoff: 0,
  });

  // Load agent options once
  useEffect(() => {
    fetchAgentOptions()
      .then((res) => {
        if (res.isSuccess) setAgentOptions(res.data);
      })
      .catch(() => {});
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [collectionsRes, statsRes] = await Promise.all([
        fetchCollections({
          search: search.trim() || undefined,
          collection_type: typeFilter !== "all" ? typeFilter : undefined,
          agent_id: agentFilter !== "all" ? agentFilter : undefined,
          date_from: dateFrom || undefined,
          date_to: dateTo || undefined,
        }),
        fetchCollectionStats(),
      ]);
      if (!collectionsRes.isSuccess) throw new Error(collectionsRes.message);
      setItems(collectionsRes.data);
      setKpiData(statsRes.data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل تحميل التحصيلات");
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter, agentFilter, dateFrom, dateTo]);

  useEffect(() => {
    void loadData();
  }, [loadData]);
  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchInput, typeFilter, agentFilter, dateFrom, dateTo]);
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const paginatedRows = items.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const agentSummaries = useMemo(() => computeAgentSummaries(items), [items]);
  const pendingForAgent = useMemo(
    () => (activeAgent ? getPendingCollectionsForAgent(items, activeAgent.delivery_agent_id) : []),
    [items, activeAgent],
  );

  const openReceiveCash = (agent: AgentCollectionSummary) => {
    setActiveAgent(agent);
    setCashOpen(true);
  };

  const handleReceiveCash = async (collectionIds: string[]) => {
    if (!activeAgent) return;
    setSaving(true);
    try {
      const response = await receiveCashFromAgent(activeAgent.delivery_agent_id, collectionIds);
      toast.success(response.message);
      setCashOpen(false);
      void loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل تسجيل الاستلام");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <AdminPageHeader
        module="collections"
        title="التحصيلات"
        tableName="التحصيلات"
        description="عمليات التحصيل من العميل — COD / رسوم شحن / جزئي + استلام النقد من المناديب"
        addLabel="تسجيل تحصيل"
        onAdd={() => toast.message("تسجيل تحصيل — واجهة تصميمية")}
        showAdd={false}
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="إجمالي المحصّل"
          value={`${formatAmount(kpiData.totalCollected)} ج.م`}
          icon={Wallet}
          tone="primary"
        />
        <KpiCard
          label="عمولات النظام"
          value={`${formatAmount(kpiData.totalCommission)} ج.م`}
          icon={Coins}
          tone="info"
        />
        <KpiCard
          label="صافي مستحق للشركات"
          value={`${formatAmount(kpiData.totalNetDue)} ج.م`}
          icon={Banknote}
          tone="success"
        />
        <KpiCard
          label="بانتظار استلام النقد"
          value={String(kpiData.pendingHandoff)}
          icon={CheckCircle2}
          tone="warning"
        />
      </div>

      <AdminDataTable
        selectable={false}
        search={searchInput}
        onSearchChange={(value) => setSearchInput(value)}
        searchPlaceholder="كود الطلب، المندوب، الشركة..."
        filters={[
          {
            id: "agent",
            label: "المندوب",
            icon: Truck,
            value: agentFilter,
            onChange: (v) => setAgentFilter(v),
            options: agentOptions,
            allLabel: "كل المناديب",
          },
          {
            id: "type",
            label: "النوع",
            icon: Tag,
            value: typeFilter,
            onChange: (v) => setTypeFilter(v),
            options: COLLECTION_TYPE_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
            allLabel: "كل الأنواع",
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
                <CheckCircle2 className="h-3.5 w-3.5" /> تم الاستلام
              </span>
            ) : (
              <span key="handoff" className="text-xs font-semibold text-warning">
                بانتظار التسليم
              </span>
            ),
            item.is_settled === 1 ? (
              <span key="settled" className="inline-flex items-center gap-1 text-xs text-success">
                <CheckCircle2 className="h-3.5 w-3.5" /> مسوّاة
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
              module="collections"
              key="actions"
              extra={[
                {
                  label: "عرض التفاصيل",
                  icon: <Eye className="ml-2 h-4 w-4" />,
                  onClick: () => {
                    setActiveItem(item);
                    setDetailOpen(true);
                  },
                },
                ...(item.cash_received_by_admin === 0
                  ? [
                      {
                        label: "استلام نقد من المندوب",
                        icon: <Banknote className="ml-2 h-4 w-4" />,
                        onClick: () => {
                          const agent = agentSummaries.find(
                            (a) => a.delivery_agent_id === item.delivery_agent_id,
                          );
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
        onToggleSelectAll={(ids) =>
          setSelectedIds(selectedIds.size === ids.length ? new Set() : new Set(ids))
        }
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        totalCount={items.length}
        emptyMessage={loading ? "جاري التحميل..." : "لا توجد تحصيلات مطابقة"}
      />

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

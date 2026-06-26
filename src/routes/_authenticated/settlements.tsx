import { useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { ConfirmActionDialog } from "@/components/admin/ConfirmActionDialog";
import { MarkSettlementPaidDialog } from "@/components/admin/MarkSettlementPaidDialog";
import { RowActions } from "@/components/admin/RowActions";
import { SettlementCreateDialog } from "@/components/admin/SettlementCreateDialog";
import { SettlementDetailDialog } from "@/components/admin/SettlementDetailDialog";
import { SettlementStatementDialog } from "@/components/admin/SettlementStatementDialog";
import { KpiCard } from "@/components/dashboard/KpiCard";
import type { ConfirmAction } from "@/components/admin/use-admin-crud";
import {
  approveSettlement,
  createSettlement,
  exportSettlements,
  fetchSettlements,
  fetchSettlementStats,
  markSettlementPaid,
  type FetchSettlementsParams,
  type SettlementKpis,
} from "@/lib/admin/settlements-api";
import { MOCK_COMPANY_PORTAL_ID, SETTLEMENT_COMPANY_OPTIONS } from "@/lib/admin/settlements-data";
import type {
  CreateSettlementInput,
  MarkSettlementPaidInput,
  SettlementRecord,
} from "@/lib/admin/settlements-types";
import {
  SETTLEMENT_STATUS_OPTIONS,
  SETTLEMENT_TYPE_OPTIONS,
  formatAmount,
  formatDate,
  paymentMethodLabel,
  settlementPartyName,
  settlementStatusLabel,
  settlementStatusStyles,
  settlementTypeLabel,
  settlementTypeStyles,
} from "@/lib/admin/settlements-types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  Building2,
  Calendar,
  CircleDollarSign,
  Download,
  Eye,
  FileCheck2,
  Hourglass,
  Loader2,
  Printer,
  Scale,
  Tag,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/settlements")({
  component: SettlementsPage,
});

function SettlementTypeBadge({ type }: { type: SettlementRecord["settlement_type"] }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        settlementTypeStyles[type],
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {settlementTypeLabel(type)}
    </span>
  );
}

function SettlementStatusBadge({ status }: { status: SettlementRecord["settlement_status"] }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        settlementStatusStyles[status],
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {settlementStatusLabel(status)}
    </span>
  );
}

const EMPTY_KPIS: SettlementKpis = {
  total: 0,
  totalNet: 0,
  draftNet: 0,
  approvedNet: 0,
  paidThisMonth: 0,
  draftCount: 0,
  approvedCount: 0,
  paidCount: 0,
};

const PAGE_SIZE = 20;

function SettlementsPage() {
  const [items, setItems] = useState<SettlementRecord[]>([]);
  const [kpis, setKpis] = useState<SettlementKpis>(EMPTY_KPIS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("admin");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("all");
  const [companyPortalId, setCompanyPortalId] = useState(MOCK_COMPANY_PORTAL_ID);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [paidOpen, setPaidOpen] = useState(false);
  const [printOpen, setPrintOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<SettlementRecord | null>(null);

  const isCompanyView = tab === "company";

  const buildParams = useCallback(
    (overridePage?: number): FetchSettlementsParams => ({
      page: overridePage ?? page,
      perPage: PAGE_SIZE,
      search: search.trim() || undefined,
      type: typeFilter,
      status: statusFilter,
      period: periodFilter,
      companyId: isCompanyView ? companyPortalId : undefined,
    }),
    [page, search, typeFilter, statusFilter, periodFilter, isCompanyView, companyPortalId],
  );

  const loadData = useCallback(
    async (overridePage?: number) => {
      setLoading(true);
      try {
        const [listResult, statsResult] = await Promise.all([
          fetchSettlements(buildParams(overridePage)),
          fetchSettlementStats(),
        ]);
        setItems(listResult.items);
        setTotalPages(listResult.lastPage);
        setTotalCount(listResult.total);
        setKpis(statsResult);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "فشل تحميل التسويات");
      } finally {
        setLoading(false);
      }
    },
    [buildParams],
  );

  // Reload whenever filters/page/tab change
  useEffect(() => {
    void loadData();
  }, [loadData]);

  const openDetail = (item: SettlementRecord) => {
    setActiveItem(item);
    setDetailOpen(true);
  };

  const openPrint = (item: SettlementRecord) => {
    setActiveItem(item);
    setPrintOpen(true);
  };

  const handleCreate = async (input: CreateSettlementInput) => {
    setSaving(true);
    try {
      const response = await createSettlement(input);
      if (!response.isSuccess) throw new Error(response.message);
      toast.success(response.message);
      setCreateOpen(false);
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل إنشاء التسوية");
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = (item: SettlementRecord) => {
    setConfirmAction({
      title: `اعتماد ${item.settlement_ref}؟`,
      description: `سيتم اعتماد التسوية بمبلغ صافي ${formatAmount(item.net_amount)} ج.م — لا يمكن التراجع بسهولة.`,
      confirmLabel: "اعتماد",
      onConfirm: async () => {
        setConfirmAction(null);
        setSaving(true);
        try {
          const response = await approveSettlement(item.settlement_id);
          if (!response.isSuccess) throw new Error(response.message);
          toast.success(response.message);
          setDetailOpen(false);
          await loadData();
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "فشل الاعتماد");
        } finally {
          setSaving(false);
        }
      },
    });
  };

  const handleMarkPaid = async (input: MarkSettlementPaidInput) => {
    if (!activeItem) return;
    setSaving(true);
    try {
      const response = await markSettlementPaid(activeItem.settlement_id, input);
      if (!response.isSuccess) throw new Error(response.message);
      toast.success(response.message);
      setPaidOpen(false);
      setDetailOpen(false);
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل تسجيل الدفع");
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await exportSettlements();
      toast.success(`${response.message} — ${response.data.filename}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل التصدير");
    }
  };

  const companyName =
    SETTLEMENT_COMPANY_OPTIONS.find((o) => o.value === companyPortalId)?.label ?? "—";

  const tableColumns = [
    { key: "ref", label: "رقم التسوية" },
    { key: "type", label: "النوع" },
    { key: "party", label: "الطرف" },
    { key: "period", label: "الفترة" },
    { key: "collections", label: "إجمالي التحصيل" },
    { key: "commissions", label: "العمولات" },
    { key: "net", label: "الصافي" },
    { key: "payment", label: "الدفع" },
    { key: "status", label: "الحالة" },
    { key: "actions", label: "", className: "w-12" },
  ];

  const tableRows = items.map((item) => ({
    id: item.settlement_id,
    cells: [
      <span key="ref" className="font-mono text-xs font-semibold text-primary">
        #{item.settlement_ref}
      </span>,
      <SettlementTypeBadge key="type" type={item.settlement_type} />,
      <span key="party" className="font-semibold">
        {settlementPartyName(item)}
      </span>,
      <span key="period" className="text-xs tabular-nums text-muted-foreground">
        {formatDate(item.period_from)} ← {formatDate(item.period_to)}
      </span>,
      <span key="collections" className="tabular-nums">
        {formatAmount(item.total_collections)}
      </span>,
      <span key="commissions" className="tabular-nums text-muted-foreground">
        −{formatAmount(item.total_commissions)}
      </span>,
      <span key="net" className="font-bold tabular-nums">
        {formatAmount(item.net_amount)}{" "}
        <span className="text-[10px] font-normal text-muted-foreground">ج.م</span>
      </span>,
      <span key="payment" className="font-mono text-[11px] text-muted-foreground">
        {paymentMethodLabel(item.payment_method)}
      </span>,
      <SettlementStatusBadge key="status" status={item.settlement_status} />,
      <RowActions
        key="actions"
        onEdit={() => openDetail(item)}
        onDelete={() => toast.message("حذف التسوية — واجهة تصميمية")}
        extra={[
          {
            label: "عرض التفاصيل",
            icon: <Eye className="ml-2 h-4 w-4" />,
            onClick: () => openDetail(item),
          },
          {
            label: "طباعة كشف",
            icon: <Printer className="ml-2 h-4 w-4" />,
            onClick: () => openPrint(item),
          },
          ...(!isCompanyView && item.settlement_status === 1
            ? [
                {
                  label: "اعتماد التسوية",
                  icon: <FileCheck2 className="ml-2 h-4 w-4" />,
                  onClick: () => handleApprove(item),
                },
              ]
            : []),
          ...(!isCompanyView && item.settlement_status === 2
            ? [
                {
                  label: "تحديد كمدفوعة",
                  icon: <CircleDollarSign className="ml-2 h-4 w-4" />,
                  onClick: () => {
                    setActiveItem(item);
                    setPaidOpen(true);
                  },
                },
              ]
            : []),
        ]}
      />,
    ],
  }));

  return (
    <AppShell>
      <AdminPageHeader
        title="التسويات المالية"
        tableName="settlements"
        description="تسويات المناديب والشركات للفترات المحددة — مسودة → معتمدة → مدفوعة"
        addLabel="إنشاء تسوية"
        showAdd={!isCompanyView}
        onAdd={() => setCreateOpen(true)}
        extra={
          !isCompanyView ? (
            <Button variant="outline" className="rounded-xl" onClick={handleExport}>
              <Download className="ms-2 h-4 w-4" />
              تصدير Excel
            </Button>
          ) : undefined
        }
      />

      <Tabs
        value={tab}
        onValueChange={(v) => {
          setTab(v);
          setPage(1);
          setSearch("");
        }}
        dir="rtl"
        className="mb-6"
      >
        <TabsList className="h-10 w-full justify-start rounded-xl bg-muted/50 p-1 sm:w-auto">
          <TabsTrigger value="admin" className="rounded-lg px-4">
            إدارة التسويات
          </TabsTrigger>
          <TabsTrigger value="company" className="rounded-lg px-4 gap-1.5">
            <Building2 className="h-3.5 w-3.5" />
            تسوياتي (شركة)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="admin" className="mt-4">
          <p className="mb-4 text-sm text-muted-foreground">
            عرض وإدارة جميع تسويات المناديب وشركات الشحن — اعتماد ودفع وتصدير.
          </p>
        </TabsContent>

        <TabsContent value="company" className="mt-4">
          <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-muted/20 p-4">
            <Building2 className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-semibold">عرض شركة الشحن (محاكاة)</p>
              <p className="text-xs text-muted-foreground">
                سجل تسويات الشركة — قراءة وطباعة الكشوف فقط
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
              {SETTLEMENT_COMPANY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            تاريخ تسويات <span className="font-semibold text-foreground">{companyName}</span> —{" "}
            {totalCount} سجل
          </p>
        </TabsContent>
      </Tabs>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="إجمالي التسويات"
          value={`${formatAmount(kpis.totalNet)} ج.م`}
          icon={Scale}
          tone="primary"
        />
        <KpiCard
          label="بانتظار الاعتماد"
          value={`${formatAmount(kpis.draftNet)} ج.م`}
          icon={Hourglass}
          tone="warning"
        />
        <KpiCard
          label="معتمدة (لم تُدفع)"
          value={`${formatAmount(kpis.approvedNet)} ج.م`}
          icon={FileCheck2}
          tone="info"
        />
        <KpiCard
          label="مدفوعة هذا الشهر"
          value={`${formatAmount(kpis.paidThisMonth)} ج.م`}
          icon={CircleDollarSign}
          tone="success"
        />
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
          searchPlaceholder="رقم التسوية، الطرف، مرجع الدفع..."
          filters={[
            {
              id: "type",
              label: "النوع",
              icon: Tag,
              value: typeFilter,
              onChange: (v) => {
                setTypeFilter(v);
                setPage(1);
              },
              options: [
                { value: "all", label: "الكل" },
                ...SETTLEMENT_TYPE_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
              ],
              allLabel: "كل الأنواع",
            },
            {
              id: "status",
              label: "الحالة",
              icon: FileCheck2,
              value: statusFilter,
              onChange: (v) => {
                setStatusFilter(v);
                setPage(1);
              },
              options: [
                { value: "all", label: "الكل" },
                ...SETTLEMENT_STATUS_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
              ],
              allLabel: "كل الحالات",
            },
            {
              id: "period",
              label: "الفترة",
              icon: Calendar,
              value: periodFilter,
              onChange: (v) => {
                setPeriodFilter(v);
                setPage(1);
              },
              options: [
                { value: "all", label: "الكل" },
                { value: "month", label: "هذا الشهر" },
                { value: "last_month", label: "الشهر الماضي" },
                { value: "quarter", label: "آخر 90 يوم" },
              ],
              allLabel: "كل الفترات",
            },
          ]}
          columns={tableColumns}
          rows={tableRows}
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
          emptyMessage={isCompanyView ? "لا توجد تسويات لهذه الشركة" : "لا توجد تسويات مطابقة"}
        />
      )}

      <SettlementCreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSave={handleCreate}
        loading={saving}
      />
      <SettlementDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        item={activeItem}
        showActions={!isCompanyView}
        onApprove={
          activeItem?.settlement_status === 1
            ? () => activeItem && handleApprove(activeItem)
            : undefined
        }
        onMarkPaid={
          activeItem?.settlement_status === 2
            ? () => {
                setPaidOpen(true);
              }
            : undefined
        }
        onPrint={() => activeItem && openPrint(activeItem)}
      />
      <MarkSettlementPaidDialog
        open={paidOpen}
        onOpenChange={setPaidOpen}
        item={activeItem}
        onSave={handleMarkPaid}
        loading={saving}
      />
      <SettlementStatementDialog open={printOpen} onOpenChange={setPrintOpen} item={activeItem} />
      <ConfirmActionDialog action={confirmAction} onOpenChange={() => setConfirmAction(null)} />
    </AppShell>
  );
}

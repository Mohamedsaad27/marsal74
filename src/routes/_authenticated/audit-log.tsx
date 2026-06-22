import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import {
  AuditLogDetailDialog,
  type AuditEntry,
} from "../../components/admin/AuditLogDetailDialog.tsx";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Filter,
  Loader2,
  Search,
  ShieldAlert,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ACTION_META,
  SEVERITY_META,
  mapApiItemToEntry,
  type ApiAuditItem,
} from "@/lib/audit-helpers";
import { getAccessToken } from "../../lib/auth/Auth.api.ts";

export const Route = createFileRoute("/_authenticated/audit-log")({
  component: AuditLogPage,
});

// ─── types ────────────────────────────────────────────────────────────────────

type KpiData = {
  total_logs: number;
  today_logs: number;
  security_events_today: number;
};

type PaginationMeta = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  has_more: boolean;
};

// ─── helpers ──────────────────────────────────────────────────────────────────

const BASE_URL = "https://api.expres-pro.com";

function buildAuditUrl(params: {
  page: number;
  perPage: number;
  userId?: string;
  event?: string;
  auditableType?: string;
  auditableId?: string;
  datePeriod?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  const q = new URLSearchParams();
  q.set("per_page", String(params.perPage));
  q.set("page", String(params.page));
  if (params.userId) q.set("user_id", params.userId);
  if (params.event) q.set("event", params.event);
  if (params.auditableType) q.set("auditable_type", params.auditableType);
  if (params.auditableId) q.set("auditable_id", params.auditableId);
  if (params.datePeriod && params.datePeriod !== "all") q.set("date_period", params.datePeriod);
  if (params.dateFrom) q.set("date_from", params.dateFrom);
  if (params.dateTo) q.set("date_to", params.dateTo);
  return `${BASE_URL}/api/v1/admin/audit-logs?${q.toString()}`;
}

function buildEntityUrl(params: {
  auditableType: string;
  auditableId: string;
  page: number;
  perPage: number;
  datePeriod?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  const q = new URLSearchParams();
  q.set("per_page", String(params.perPage));
  q.set("page", String(params.page));
  if (params.datePeriod && params.datePeriod !== "all") q.set("date_period", params.datePeriod);
  if (params.dateFrom) q.set("date_from", params.dateFrom);
  if (params.dateTo) q.set("date_to", params.dateTo);
  return `${BASE_URL}/api/v1/admin/audit-logs/${params.auditableType}/${params.auditableId}?${q.toString()}`;
}

// ─── component ────────────────────────────────────────────────────────────────
const EVENT_OPTIONS = {
  1: { label: "إنشاء" },
  2: { label: "تعديل" },
  3: { label: "حذف" },
  4: { label: "استعادة" },
  5: { label: "تسجيل دخول" },
  6: { label: "تسجيل خروج" },
  7: { label: "تغيير الحالة" },
  8: { label: "تعيين" },
  9: { label: "موافقة" },
  10: { label: "رفض" },
  11: { label: "تسوية" },
  12: { label: "تحصيل" },
  13: { label: "إرجاع" },
  14: { label: "تصدير" },
  15: { label: "تغيير كلمة المرور" },
  16: { label: "تفعيل" },
  17: { label: "إلغاء التفعيل" },
} as const;
export default function AuditLogPage() {
  // filters
  const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] = useState<string>("all");
  const [auditableType, setAuditableType] = useState<string>("all");
  const [period, setPeriod] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 20;

  // data
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [kpis, setKpis] = useState<KpiData | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // dialog
  const [selectedEntry, setSelectedEntry] = useState<AuditEntry | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // debounce search
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => setDebouncedSearch(search), 400);
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [search]);

  // reset page on filter change
  useEffect(() => {
    setPage(1);
  }, [eventFilter, auditableType, period, dateFrom, dateTo, debouncedSearch]);

  const fetchData = useCallback(async () => {
    if (period === "custom") {
      if (!dateFrom || !dateTo) {
        // setError("يرجى اختيار تاريخ البداية والنهاية");
        return;
      }

      if (dateTo < dateFrom) {
        setError("تاريخ النهاية يجب أن يكون بعد أو يساوي تاريخ البداية");
        return;
      }
    }
    setLoading(true);
    setError(null);
    try {
      const url = buildAuditUrl({
        page,
        perPage,
        event: eventFilter !== "all" ? eventFilter : undefined,
        auditableType: auditableType !== "all" ? auditableType : undefined,
        datePeriod: period !== "all" ? period : undefined,
        dateFrom: period === "custom" ? dateFrom : undefined,
        dateTo: period === "custom" ? dateTo : undefined,
      });

      const res = await fetch(url, {
        headers: {
          Accept: "application/json",
          authorization: `Bearer ${getAccessToken()}`,
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      if (!json.isSuccess) throw new Error(json.message ?? "خطأ في الاستجابة");

      const { data } = json;
      const mapped: AuditEntry[] = (data.items as ApiAuditItem[]).map(mapApiItemToEntry);

      // client-side search filter (API may not support free-text search)
      const q = debouncedSearch.trim().toLowerCase();
      const filtered = q
        ? mapped.filter((e) =>
            `${e.user} ${e.target} ${e.description} ${e.ip}`.toLowerCase().includes(q),
          )
        : mapped;

      setEntries(filtered);
      setPagination({
        current_page: data.current_page,
        last_page: data.last_page,
        per_page: data.per_page,
        total: data.total,
        has_more: data.has_more,
      });
      if (data.kpis) setKpis(data.kpis);
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  }, [page, perPage, eventFilter, auditableType, period, dateFrom, dateTo, debouncedSearch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resetFilters = () => {
    setSearch("");
    setEventFilter("all");
    setAuditableType("all");
    setPeriod("all");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  const hasActive =
    search ||
    eventFilter !== "all" ||
    auditableType !== "all" ||
    period !== "all" ||
    dateFrom ||
    dateTo;

  // derive unique auditable_types for the filter dropdown from loaded entries
  const allAuditableTypes = useMemo(
    () => Array.from(new Set(entries.map((e) => e.auditableType).filter(Boolean))),
    [entries],
  );

  return (
    <AppShell>
      <AdminPageHeader
        title="سجل النشاط"
        tableName="سجل النشاط"
        description="جميع العمليات الحساسة على المنصة مع إمكانية البحث والتصفية"
        addLabel=""
        onAdd={() => {}}
        showAdd={false}
      />

      {/* KPIs */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="إجمالي الأحداث"
          value={(kpis?.total_logs ?? pagination?.total ?? 0).toLocaleString("en-US")}
          icon={Activity}
          tone="primary"
          hint="إجمالي السجلات"
        />
        <KpiCard
          label="أحداث اليوم"
          value={(kpis?.today_logs ?? 0).toLocaleString("en-US")}
          icon={ShieldAlert}
          tone="warning"
          hint="آخر 24 ساعة"
        />
        <KpiCard
          label="أحداث أمنية اليوم"
          value={(kpis?.security_events_today ?? 0).toLocaleString("en-US")}
          icon={AlertTriangle}
          tone="warning"
        />
        <KpiCard
          label="الصفحة الحالية"
          value={`${pagination?.current_page ?? 1} / ${pagination?.last_page ?? 1}`}
          icon={Users}
          tone="info"
        />
      </div>

      {/* Filters */}
      <div className="mb-4 rounded-2xl border border-border bg-card p-4 shadow-soft">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[240px] flex-1">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث بالمستخدم، الهدف، الوصف أو IP..."
              className="rounded-xl pr-9"
            />
          </div>

          {/* Event filter — uses API event codes */}
          <Select value={eventFilter} onValueChange={setEventFilter}>
            <SelectTrigger className="w-[160px] rounded-xl">
              <SelectValue placeholder="الحدث" />
            </SelectTrigger>

            <SelectContent dir="rtl">
              <SelectItem value="all">كل الأحداث</SelectItem>

              {Object.entries(EVENT_OPTIONS).map(([code, meta]) => (
                <SelectItem key={code} value={code}>
                  {meta.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Auditable type filter */}
          <Select value={auditableType} onValueChange={setAuditableType}>
            <SelectTrigger className="w-[160px] rounded-xl">
              <SelectValue placeholder="نوع السجل" />
            </SelectTrigger>
            <SelectContent dir="rtl">
              <SelectItem value="all">كل الأنواع</SelectItem>
              <SelectItem value="users">المستخدمون</SelectItem>
              <SelectItem value="orders">الطلبات</SelectItem>
              <SelectItem value="settlements">التسويات</SelectItem>
              {allAuditableTypes
                .filter((t) => !["users", "orders", "settlements"].includes(t ?? ""))
                .map((t) => (
                  <SelectItem key={t} value={t ?? ""}>
                    {t}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          {/* Period filter */}
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[150px] rounded-xl">
              <SelectValue placeholder="الفترة" />
            </SelectTrigger>
            <SelectContent dir="rtl">
              <SelectItem value="all">كل الفترات</SelectItem>
              <SelectItem value="today">اليوم</SelectItem>
              <SelectItem value="this_week">هذا الأسبوع</SelectItem>
              <SelectItem value="this_month">هذا الشهر</SelectItem>
              <SelectItem value="custom">فترة مخصصة</SelectItem>
            </SelectContent>
          </Select>

          {/* Custom date range */}
          {period === "custom" && (
            <>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-[160px] rounded-xl"
              />

              <Input
                type="date"
                value={dateTo}
                min={dateFrom || undefined}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-[160px] rounded-xl"
              />
            </>
          )}

          {hasActive && (
            <Button
              variant="ghost"
              size="sm"
              className="rounded-xl text-muted-foreground"
              onClick={resetFilters}
            >
              <X className="ml-1.5 h-4 w-4" />
              مسح التصفية
            </Button>
          )}
        </div>

        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <Filter className="h-3.5 w-3.5" />
          <span>
            عرض {entries.length.toLocaleString("en-US")} من{" "}
            {(pagination?.total ?? 0).toLocaleString("en-US")} حدث
          </span>
          {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card shadow-soft overflow-x-auto">
        {error ? (
          <div className="px-5 py-12 text-center text-sm text-destructive">
            <AlertTriangle className="mx-auto mb-2 h-8 w-8 opacity-60" />
            <p>{error}</p>
            <Button variant="outline" size="sm" className="mt-3 rounded-xl" onClick={fetchData}>
              إعادة المحاولة
            </Button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3">التاريخ والوقت</th>
                <th className="px-5 py-3">الفاعل</th>
                <th className="px-5 py-3">الحدث</th>
                <th className="px-5 py-3">نوع السجل</th>
                <th className="px-5 py-3">الوصف</th>
                <th className="px-5 py-3">IP</th>
                <th className="px-5 py-3">الخطورة</th>
              </tr>
            </thead>
            <tbody>
              {loading && entries.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                  </td>
                </tr>
              )}
              {!loading && entries.length === 0 && !error && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-sm text-muted-foreground">
                    <FileText className="mx-auto mb-2 h-8 w-8 opacity-40" />
                    لا توجد أحداث مطابقة للتصفية الحالية
                  </td>
                </tr>
              )}
              {entries.map((entry) => {
                const actionMeta = ACTION_META[entry.action] ?? ACTION_META["updated"];
                const sev = SEVERITY_META[entry.severity];
                const ActionIcon = actionMeta.icon;
                return (
                  <tr
                    key={entry.id}
                    className="cursor-pointer border-b border-border/60 last:border-0 hover:bg-muted/30"
                    onClick={() => {
                      setSelectedEntry(entry);
                      setDetailOpen(true);
                    }}
                  >
                    <td className="px-5 py-4 tabular-nums whitespace-nowrap text-xs text-muted-foreground">
                      {entry.createdAt}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium text-foreground">{entry.user}</div>
                      <div className="text-xs text-muted-foreground">{entry.role}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold",
                          actionMeta.tone,
                        )}
                      >
                        <ActionIcon className="h-3.5 w-3.5" />
                        {actionMeta.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm">{entry.module}</td>
                    <td className="px-5 py-4 max-w-xs">
                      <div className="font-medium text-foreground truncate">{entry.target}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {entry.description}
                      </div>
                    </td>
                    <td className="px-5 py-4 tabular-nums text-xs text-muted-foreground">
                      {entry.ip}
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant="outline" className={cn("rounded-lg border", sev.className)}>
                        {sev.label}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.last_page > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            الصفحة {pagination.current_page.toLocaleString("en-US")} من{" "}
            {pagination.last_page.toLocaleString("en-US")}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronRight className="h-4 w-4" />
              السابق
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              disabled={!pagination.has_more || loading}
              onClick={() => setPage((p) => p + 1)}
            >
              التالي
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <AuditLogDetailDialog entry={selectedEntry} open={detailOpen} onOpenChange={setDetailOpen} />
    </AppShell>
  );
}

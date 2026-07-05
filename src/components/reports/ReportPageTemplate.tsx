// components/reports/ReportPageTemplate.tsx
import { useRef } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Printer, Search, ChevronRight, ChevronLeft } from "lucide-react";
import { useReportData } from "@/hooks/useReportData";
import type { ReportConfig } from "@/lib/types/report-config";

type Props<TItem, TSummary> = { config: ReportConfig<TItem, TSummary> };

export function ReportPageTemplate<TItem, TSummary>({ config }: Props<TItem, TSummary>) {
  const {
    rows,
    kpis,
    isLoading,
    isFetching,
    isError,
    page,
    setPage,
    lastPage,
    total,
    search,
    setSearch,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
  } = useReportData(config);

  const handlePrint = () => window.print();

  return (
    <AppShell>
      {/* Everything in this wrapper is hidden on the printed page */}
      <div className="print:hidden">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">{config.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              تقرير <code className="rounded bg-muted px-1 text-[10px]"></code> —{" "}
              {config.description}
            </p>
          </div>
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={handlePrint}
            disabled={isLoading || rows.length === 0}
          >
            <Printer className="ml-1.5 h-4 w-4" />
            طباعة / تصدير PDF
          </Button>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 animate-pulse rounded-2xl bg-muted/40" />
              ))
            : kpis.map((k) => (
                <KpiCard
                  key={k.label}
                  label={k.label}
                  value={String(k.value)}
                  icon={k.icon}
                  tone={k.tone}
                />
              ))}
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="بحث..."
              className="rounded-xl pr-9"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="flex items-center gap-2">
            <Input
              type="date"
              className="w-[150px] rounded-xl"
              value={dateFrom}
              max={dateTo}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setPage(1);
              }}
            />
            <span className="text-sm text-muted-foreground">إلى</span>
            <Input
              type="date"
              className="w-[150px] rounded-xl"
              value={dateTo}
              min={dateFrom}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>
      </div>

      {/* Print header: only visible on the printed page */}
      <div className="hidden print:block print:mb-4">
        <h1 className="text-xl font-bold">{config.title}</h1>
        <p className="text-sm text-gray-600">
          {config.description} — {dateFrom} إلى {dateTo}
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-soft overflow-x-auto print:rounded-none print:border-0 print:shadow-none">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground print:bg-transparent">
              {config.columns.map((col) => (
                <th key={col.key} className="px-5 py-3 print:px-2 print:py-1">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border/60">
                  {config.columns.map((col) => (
                    <td key={col.key} className="px-5 py-4">
                      <div className="h-4 w-full animate-pulse rounded bg-muted/40" />
                    </td>
                  ))}
                </tr>
              ))
            ) : isError ? (
              <tr>
                <td
                  colSpan={config.columns.length}
                  className="px-5 py-10 text-center text-muted-foreground"
                >
                  حدث خطأ أثناء تحميل البيانات
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={config.columns.length}
                  className="px-5 py-10 text-center text-muted-foreground"
                >
                  لا توجد بيانات
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-border/60 last:border-0 hover:bg-muted/30 print:break-inside-avoid"
                >
                  {config.columns.map((col) => (
                    <td key={col.key} className="px-5 py-4 tabular-nums print:px-2 print:py-1">
                      {row[col.key] ?? "—"}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="print:hidden">
        {lastPage > 1 && (
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>إجمالي النتائج: {total}</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="rounded-lg"
                disabled={page <= 1 || isFetching}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <span>
                {page} / {lastPage}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="rounded-lg"
                disabled={page >= lastPage || isFetching}
                onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

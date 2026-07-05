// types/report-config.ts
import type { LucideIcon } from "lucide-react";
import type { PaginatedReport, ReportQueryParams } from "@/lib/types/reports";

export interface ReportKpi {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: "primary" | "success" | "warning" | "info";
}

export interface ReportColumn {
  key: string;
  label: string;
}

export interface ReportConfig<TItem, TSummary> {
  title: string;
  description: string;
  tableName: string;
  queryKey: string;
  fetcher: (params: ReportQueryParams) => Promise<PaginatedReport<TItem, TSummary>>;
  buildKpis: (summary: TSummary) => ReportKpi[];
  columns: ReportColumn[];
  normaliseRow: (item: TItem) => Record<string, string | number>;
}

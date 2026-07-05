// types/reports.ts
export interface ApiEnvelope<T> {
  isSuccess: boolean;
  message: string;
  data: T;
}

export interface PaginatedReport<TItem, TSummary> {
  summary: TSummary;
  items: TItem[];
  type: "length_aware";
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
  has_more: boolean;
}

export type ReportPeriod = "today" | "week" | "month" | "year";

export interface ReportQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  date_from?: string; // "YYYY-MM-DD"
  date_to?: string; // "YYYY-MM-DD"
}

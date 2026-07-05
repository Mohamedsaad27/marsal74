// hooks/useReportData.ts
import { useMemo, useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/useDebounce";
import type { ReportConfig } from "@/lib/types/report-config";

const DEFAULT_DATE_FROM = "2026-01-01";
const todayISO = () => new Date().toISOString().slice(0, 10);

export function useReportData<TItem, TSummary>(config: ReportConfig<TItem, TSummary>) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState(DEFAULT_DATE_FROM);
  const [dateTo, setDateTo] = useState(todayISO());
  const debouncedSearch = useDebounce(search, 400);

  const query = useQuery({
    queryKey: [config.queryKey, { page, search: debouncedSearch, dateFrom, dateTo }],
    queryFn: () =>
      config.fetcher({
        page,
        per_page: 20,
        search: debouncedSearch || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      }),
    placeholderData: keepPreviousData,
  });

  const rows = useMemo(
    () => query.data?.items.map(config.normaliseRow) ?? [],
    [query.data, config],
  );

  const kpis = useMemo(
    () => (query.data ? config.buildKpis(query.data.summary) : []),
    [query.data, config],
  );

  return {
    rows,
    kpis,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    page,
    setPage,
    lastPage: query.data?.last_page ?? 1,
    total: query.data?.total ?? 0,
    search,
    setSearch,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
  };
}

import { Search, ChevronRight, ChevronLeft, Loader2, Inbox } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type AdminFilter = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  allLabel?: string;
  icon?: LucideIcon;
};

function getFilterDisplayValue(filter: AdminFilter): string {
  if (filter.value === "all") return filter.allLabel ?? "الكل";
  return filter.options.find((o) => o.value === filter.value)?.label ?? filter.value;
}

type Props = {
  search: string;
  onSearchChange: (v: string) => void;
  searchPlaceholder?: string;
  filters?: AdminFilter[];
  loading?: boolean;
  emptyMessage?: string;
  columns: { key: string; label: string; className?: string }[];
  rows: { id: string | number; cells: React.ReactNode[] }[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: (ids: string[]) => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalCount: number;
  selectable?: boolean;
};

export function AdminDataTable({
  search,
  onSearchChange,
  searchPlaceholder = "بحث...",
  filters = [],
  loading = false,
  emptyMessage = "لا توجد بيانات",
  columns,
  rows,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  page,
  totalPages,
  onPageChange,
  totalCount,
  selectable = true,
}: Props) {
  const rowIds = rows.map((r) => String(r.id));
  const allSelected = rowIds.length > 0 && selectedIds.size === rowIds.length;

  return (
    <div className="rounded-2xl border border-border bg-card shadow-soft">
      <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="rounded-xl pr-9"
            dir="rtl"
          />
        </div>
        {filters.map((f) => {
          const Icon = f.icon;
          const displayValue = getFilterDisplayValue(f);
          const isActive = f.value !== "all";

          return (
            <div
              key={f.id}
              className={cn(
                "flex h-10 items-stretch overflow-hidden rounded-xl border bg-background shadow-sm transition-colors",
                isActive ? "border-primary/40 ring-1 ring-primary/10" : "border-input",
              )}
            >
              <div className="flex shrink-0 items-center gap-1.5 border-s border-border bg-muted/50 px-3">
                {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground" />}
                <span className="text-xs font-bold text-muted-foreground">{f.label}</span>
              </div>
              <Select value={f.value} onValueChange={f.onChange}>
                <SelectTrigger className="h-10 w-[132px] rounded-none border-0 bg-transparent px-3 shadow-none focus:ring-0">
                  <SelectValue>
                    <span className={cn("truncate font-semibold", isActive && "text-primary")}>
                      {displayValue}
                    </span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent dir="rtl">
                  <SelectItem value="all">{f.allLabel ?? "الكل"}</SelectItem>
                  {f.options.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        })}
        <p className="text-xs text-muted-foreground tabular-nums">{totalCount} سجل</p>
      </div>

      <div className="relative overflow-x-auto">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-[1px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {selectable && (
                <th className="w-12 px-4 py-3">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={() => onToggleSelectAll(rowIds)}
                    aria-label="تحديد الكل"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th key={col.key} className={cn("px-5 py-3", col.className)}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="px-5 py-16 text-center text-muted-foreground"
                >
                  <Inbox className="mx-auto mb-2 h-10 w-10 opacity-40" />
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const id = String(row.id);
                const selected = selectedIds.has(id);
                return (
                  <tr
                    key={id}
                    className={cn(
                      "border-b border-border/60 last:border-0 hover:bg-muted/30",
                      selected && "bg-primary/5",
                    )}
                  >
                    {selectable && (
                      <td className="px-4 py-4">
                        <Checkbox checked={selected} onCheckedChange={() => onToggleSelect(id)} />
                      </td>
                    )}
                    {row.cells.map((cell, i) => (
                      <td key={columns[i]?.key ?? i} className="px-5 py-4">
                        {cell}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-border px-4 py-3">
        <p className="text-xs text-muted-foreground">
          صفحة {page} من {totalPages}
        </p>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-lg"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-lg"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

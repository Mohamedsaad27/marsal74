import { AppShell } from "@/components/layout/AppShell";
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
import { Download, FileSpreadsheet, Search, type LucideIcon } from "lucide-react";

type Kpi = {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: "primary" | "success" | "warning" | "info";
};

type Row = Record<string, string | number>;

type Props = {
  title: string;
  description: string;
  tableName: string;
  kpis: Kpi[];
  columns: string[];
  rows: Row[];
};

export function ReportPageTemplate({ title, description, tableName, kpis, columns, rows }: Props) {
  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            تقرير <code className="rounded bg-muted px-1 text-[10px]">{tableName}</code> —{" "}
            {description}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="rounded-xl">
            <Download className="ml-1.5 h-4 w-4" />
            تصدير PDF
          </Button>
          {/* <Button className="rounded-xl gradient-brand shadow-glow">
            <FileSpreadsheet className="ml-1.5 h-4 w-4" />
            تصدير Excel
          </Button> */}
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} label={k.label} value={k.value} icon={k.icon} tone={k.tone} />
        ))}
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="بحث..." className="rounded-xl pr-9" />
        </div>
        <Select defaultValue="month">
          <SelectTrigger className="w-[160px] rounded-xl">
            <SelectValue placeholder="الفترة" />
          </SelectTrigger>
          <SelectContent dir="rtl">
            <SelectItem value="today">اليوم</SelectItem>
            <SelectItem value="week">هذا الأسبوع</SelectItem>
            <SelectItem value="month">هذا الشهر</SelectItem>
            <SelectItem value="year">هذه السنة</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-soft overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {columns.map((col) => (
                <th key={col} className="px-5 py-3">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-border/60 last:border-0 hover:bg-muted/30">
                {columns.map((col) => (
                  <td key={col} className="px-5 py-4 tabular-nums">
                    {row[col] ?? "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}

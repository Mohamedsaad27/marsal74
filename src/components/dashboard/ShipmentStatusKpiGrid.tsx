import {
  Package,
  Clock3,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Undo2,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type ShipmentStatusFilterId =
  | "all"
  | "pending_assignment"
  | "in_delivery"
  | "delivered"
  | "delayed_rejected"
  | "returned";

type Tone = "primary" | "success" | "warning" | "info" | "destructive" | "muted";

type StatusKpi = {
  id: ShipmentStatusFilterId;
  label: string;
  count: number;
  icon: LucideIcon;
  tone: Tone;
};

const STATUS_KPIS: StatusKpi[] = [
  { id: "all", label: "الكل", count: 2841, icon: Package, tone: "primary" },
  { id: "pending_assignment", label: "بانتظار التعيين", count: 124, icon: Clock3, tone: "warning" },
  { id: "in_delivery", label: "قيد التوصيل", count: 187, icon: Truck, tone: "info" },
  { id: "delivered", label: "تم التسليم", count: 1924, icon: CheckCircle2, tone: "success" },
  { id: "delayed_rejected", label: "مؤجلة / رفض", count: 84, icon: AlertTriangle, tone: "destructive" },
  { id: "returned", label: "مرتجعة", count: 63, icon: Undo2, tone: "muted" },
];

const toneStyles: Record<
  Tone,
  { icon: string; bar: string; glow: string; activeRing: string; activeBg: string }
> = {
  primary: {
    icon: "bg-primary/12 text-primary",
    bar: "bg-primary",
    glow: "from-primary/20",
    activeRing: "ring-primary/50",
    activeBg: "from-primary/8 via-primary/3 to-transparent",
  },
  success: {
    icon: "bg-success/12 text-success",
    bar: "bg-success",
    glow: "from-success/20",
    activeRing: "ring-success/45",
    activeBg: "from-success/8 via-success/3 to-transparent",
  },
  warning: {
    icon: "bg-warning/15 text-warning",
    bar: "bg-warning",
    glow: "from-warning/20",
    activeRing: "ring-warning/45",
    activeBg: "from-warning/8 via-warning/3 to-transparent",
  },
  info: {
    icon: "bg-info/12 text-info",
    bar: "bg-info",
    glow: "from-info/20",
    activeRing: "ring-info/45",
    activeBg: "from-info/8 via-info/3 to-transparent",
  },
  destructive: {
    icon: "bg-destructive/12 text-destructive",
    bar: "bg-destructive",
    glow: "from-destructive/20",
    activeRing: "ring-destructive/40",
    activeBg: "from-destructive/8 via-destructive/3 to-transparent",
  },
  muted: {
    icon: "bg-muted text-muted-foreground",
    bar: "bg-muted-foreground/60",
    glow: "from-muted-foreground/15",
    activeRing: "ring-border",
    activeBg: "from-muted/50 via-muted/20 to-transparent",
  },
};

function formatCount(n: number) {
  return n.toLocaleString("en-US");
}

type Props = {
  activeId?: ShipmentStatusFilterId;
  onSelect?: (id: ShipmentStatusFilterId) => void;
  counts?: Partial<Record<ShipmentStatusFilterId, number>>;
};

export function ShipmentStatusKpiGrid({ activeId = "all", onSelect, counts }: Props) {
  const items = STATUS_KPIS.map((kpi) => ({
    ...kpi,
    count: counts?.[kpi.id] ?? kpi.count,
  }));
  const total = items[0]?.count ?? 0;

  return (
    <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {items.map((kpi) => {
        const active = activeId === kpi.id;
        const share = total > 0 ? (kpi.count / total) * 100 : 0;
        const styles = toneStyles[kpi.tone];

        return (
          <button
            key={kpi.id}
            type="button"
            onClick={() => onSelect?.(kpi.id)}
            aria-pressed={active}
            className={cn(
              "group relative overflow-hidden rounded-2xl border bg-card p-4 text-right shadow-soft transition-all duration-200",
              "hover:-translate-y-0.5 hover:shadow-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              active
                ? cn("border-primary/30 shadow-glow ring-2 ring-offset-2 ring-offset-background", styles.activeRing)
                : "border-border hover:border-primary/25",
            )}
          >
            <div
              className={cn(
                "pointer-events-none absolute inset-0 bg-gradient-to-bl opacity-0 transition-opacity duration-200",
                styles.activeBg,
                active && "opacity-100",
              )}
            />
            <div
              className={cn(
                "pointer-events-none absolute -left-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br opacity-0 blur-2xl transition-opacity",
                styles.glow,
                active ? "opacity-100" : "group-hover:opacity-60",
              )}
            />

            <div className="relative flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-muted-foreground">{kpi.label}</p>
                <p className="mt-1.5 text-2xl font-extrabold tracking-tight tabular-nums text-foreground sm:text-[1.65rem]">
                  {formatCount(kpi.count)}
                </p>
              </div>
              <div
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-200",
                  styles.icon,
                  active && "scale-105 shadow-soft",
                )}
              >
                <kpi.icon className="h-5 w-5" strokeWidth={2.25} />
              </div>
            </div>

            <div className="relative mt-4 space-y-2">
              <div className="flex items-center justify-between gap-2 text-[11px]">
                <span className="font-medium text-muted-foreground">
                  {kpi.id === "all" ? "إجمالي السجل" : "من إجمالي الطلبات"}
                </span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 font-bold tabular-nums",
                    active ? "bg-primary/10 text-primary" : "bg-muted/80 text-muted-foreground",
                  )}
                >
                  {kpi.id === "all" ? "100%" : `${share.toFixed(1)}%`}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted/60">
                <div
                  className={cn("h-full rounded-full transition-all duration-500", styles.bar)}
                  style={{ width: `${kpi.id === "all" ? 100 : Math.min(share, 100)}%` }}
                />
              </div>
            </div>

            {active && (
              <span className="absolute bottom-3 start-3 h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_var(--color-primary)]" />
            )}
          </button>
        );
      })}
    </div>
  );
}

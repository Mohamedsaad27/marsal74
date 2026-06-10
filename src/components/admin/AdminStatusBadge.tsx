import { cn } from "@/lib/utils";

type StatusVariant =
  | "active"
  | "inactive"
  | "available"
  | "unavailable"
  | "default"
  | "primary"
  | "info";

const variantMap: Record<StatusVariant, { label: string; cls: string }> = {
  active: { label: "نشط", cls: "bg-success/10 text-success" },
  inactive: { label: "غير نشط", cls: "bg-muted text-muted-foreground" },
  available: { label: "متاح", cls: "bg-success/10 text-success" },
  unavailable: { label: "غير متاح", cls: "bg-muted text-muted-foreground" },
  default: { label: "افتراضي", cls: "bg-info/10 text-info" },
  primary: { label: "أساسي", cls: "bg-primary/10 text-primary" },
  info: { label: "—", cls: "bg-accent text-accent-foreground" },
};

type Props = {
  variant: StatusVariant;
  label?: string;
  className?: string;
};

export function AdminStatusBadge({ variant, label, className }: Props) {
  const v = variantMap[variant];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        v.cls,
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label ?? v.label}
    </span>
  );
}

export function activeBadge(value: boolean) {
  return value === true ? "active" : "inactive";
}

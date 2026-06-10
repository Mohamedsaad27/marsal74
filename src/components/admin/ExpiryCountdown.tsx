import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { formatExpiryCountdown } from "@/lib/admin/approvals-types";
import { cn } from "@/lib/utils";

type Props = {
  expiresAt: string | null;
  className?: string;
  showIcon?: boolean;
};

export function ExpiryCountdown({ expiresAt, className, showIcon = true }: Props) {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!expiresAt) return;
    const interval = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  if (!expiresAt) return <span className={cn("text-xs text-muted-foreground", className)}>—</span>;

  const diff = new Date(expiresAt).getTime() - Date.now();
  const urgent = diff > 0 && diff <= 30 * 60 * 1000;
  const expired = diff <= 0;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-bold tabular-nums",
        expired && "bg-muted text-muted-foreground",
        urgent && !expired && "bg-destructive/10 text-destructive",
        !urgent && !expired && "bg-warning/15 text-warning",
        className,
      )}
    >
      {showIcon && <Clock className="h-3 w-3" />}
      {formatExpiryCountdown(expiresAt)}
    </span>
  );
}

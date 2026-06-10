import { Link } from "@tanstack/react-router";
import {
  Bell,
  Package,
  Truck,
  Wallet,
  ShieldCheck,
  Scale,
  Undo2,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { NotificationRecord, NotificationTypeCode } from "@/lib/admin/notifications-types";
import {
  formatRelativeTime,
  notificationTypeLabel,
  notificationTypeStyles,
  pushStatusLabel,
  pushStatusStyles,
} from "@/lib/admin/notifications-types";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

const typeIcons: Record<NotificationTypeCode, LucideIcon> = {
  1: Package,
  2: Truck,
  3: Wallet,
  4: ShieldCheck,
  5: Scale,
  6: Undo2,
  7: Bell,
};

type Props = {
  item: NotificationRecord;
  onMarkRead: (id: string) => void;
  showPushMeta?: boolean;
};

export function NotificationListItem({ item, onMarkRead, showPushMeta = false }: Props) {
  const meta = notificationTypeStyles[item.notification_type];
  const Icon = typeIcons[item.notification_type];
  const unread = item.is_read === 0;

  return (
    <div
      className={cn(
        "flex items-start gap-4 rounded-2xl border p-4 transition-colors hover:bg-muted/30",
        unread ? "border-primary/20 bg-primary/5 shadow-soft" : "border-border/60 bg-background",
      )}
    >
      <div className={cn("mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", meta.iconTone)}>
        <Icon className="h-5 w-5" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className={cn("font-semibold", unread && "text-foreground")}>{item.title}</p>
              <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", meta.badge)}>
                {notificationTypeLabel(item.notification_type)}
              </span>
            </div>
            {item.reference_code && (
              <p className="mt-0.5 font-mono text-[11px] text-primary">{item.reference_code}</p>
            )}
          </div>
          <span className="shrink-0 text-[11px] text-muted-foreground">{formatRelativeTime(item.sent_at)}</span>
        </div>

        <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>

        {showPushMeta && item.channel === "push" && (
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <Smartphone className="h-3 w-3" />
              {item.device_hint ?? "—"}
            </span>
            {item.push_status && (
              <span className={cn("rounded-full px-2 py-0.5 font-semibold", pushStatusStyles[item.push_status])}>
                {pushStatusLabel(item.push_status)}
              </span>
            )}
          </div>
        )}

        <div className="mt-3 flex flex-wrap gap-2">
          {unread && (
            <Button size="sm" variant="secondary" className="h-7 rounded-lg text-xs" onClick={() => onMarkRead(item.notification_id)}>
              تعليم كمقروء
            </Button>
          )}
          {item.action_url && item.action_label && (
            <Button size="sm" variant="outline" className="h-7 rounded-lg text-xs" asChild>
              <Link to={item.action_url}>{item.action_label}</Link>
            </Button>
          )}
        </div>
      </div>

      {unread && <span className="mt-2 h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-primary" />}
    </div>
  );
}

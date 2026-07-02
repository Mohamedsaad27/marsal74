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
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { NotificationRecord, NotificationTypeCode } from "@/lib/admin/notifications-types";
import {
  FALLBACK_NOTIFICATION_META,
  formatRelativeTime,
  notificationTypeLabel,
  notificationTypeStyles,
} from "@/lib/admin/notifications-types";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

type Props = {
  item: NotificationRecord;
  onMarkRead: (id: string) => void;
  showPushMeta?: boolean;
};

// Replace these fields throughout the component:

// OLD → NEW
// item.notification_id  → item.id
// item.is_read === 0    → !item.is_read
// item.sent_at          → item.created_at
// item.title            → item.title_ar
// item.body             → item.body_ar
// item.notification_type → item.type.code
// item.channel === "push" → item.sent_via_fcm

// Updated component:

import { Handshake, ArrowLeftRight, Repeat } from "lucide-react";

const typeIcons: Record<NotificationTypeCode, LucideIcon> = {
  1: Package,
  2: Truck,
  3: Wallet,
  4: ShieldCheck,
  5: Scale,
  6: Undo2,
  7: Bell,
  8: Clock,
  9: Wallet,
  10: Handshake,
  11: ArrowLeftRight,
  12: Repeat,
};

export function NotificationListItem({ item, onMarkRead, showPushMeta = false }: Props) {
  const code = item.type?.code;
  const meta = code
    ? (notificationTypeStyles[code] ?? FALLBACK_NOTIFICATION_META)
    : FALLBACK_NOTIFICATION_META;
  const Icon = (code ? typeIcons[code] : undefined) ?? Bell;
  const unread = !item.is_read;
  const navigate = useNavigate();

  const handleClick = () => {
    if (unread) {
      onMarkRead(item.id);
    }
    const data = item.data;
    if (!data) return;
    if (data.settlement_id) {
      void navigate({
        to: "/settlements/",
        params: { settlementId: data.settlement_id },
      });
    } else if (data.return_id) {
      void navigate({ to: "/returns/", params: { returnId: data.return_id } });
    } else if (data.collection_id) {
      void navigate({
        to: "/collections/",
        params: { collectionId: data.collection_id },
      });
    } else if (data.order_id) {
      void navigate({ to: "/shipments/$orderId", params: { orderId: data.order_id } });
    }
  };

  return (
    <div
      className={cn(
        "flex items-start gap-4 rounded-2xl border p-4 transition-colors hover:bg-muted/30 cursor-pointer",
        unread ? "border-primary/20 bg-primary/5 shadow-soft" : "border-border/60 bg-background",
      )}
      onClick={handleClick}
    >
      <div
        className={cn(
          "mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
          meta.iconTone,
        )}
      >
        <Icon className="h-5 w-5" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className={cn("font-semibold", unread && "text-foreground")}>{item.title_ar}</p>
              <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", meta.badge)}>
                {item.type.label}
              </span>
            </div>
            {/* {item.data?.order_id && (
              <p className="mt-0.5 font-mono text-[11px] text-primary">{item.data.order_id}</p>
            )} */}
          </div>
          <span className="shrink-0 text-[11px] text-muted-foreground">
            {formatRelativeTime(item.created_at)}
          </span>
        </div>

        <p className="mt-1 text-sm text-muted-foreground">{item.body_ar}</p>

        {showPushMeta && item.sent_via_fcm && (
          <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
            <Smartphone className="h-3 w-3" />
            Push
          </div>
        )}

        <div className="mt-3 flex flex-wrap gap-2">
          {unread && (
            <Button
              size="sm"
              variant="secondary"
              className="h-7 rounded-lg text-xs"
              onClick={(e) => {
                e.stopPropagation();
                onMarkRead(item.id);
              }}
            >
              تعليم كمقروء
            </Button>
          )}
        </div>
      </div>

      {unread && (
        <span className="mt-2 h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-primary" />
      )}
    </div>
  );
}

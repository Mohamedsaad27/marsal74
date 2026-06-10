import { Smartphone, Radio, CheckCircle2, XCircle, Clock } from "lucide-react";
import { NotificationListItem } from "@/components/admin/NotificationListItem";
import { KpiCard } from "@/components/dashboard/KpiCard";
import type { NotificationRecord } from "@/lib/admin/notifications-types";
import { computeNotificationKpis } from "@/lib/admin/notifications-api";

type Props = {
  items: NotificationRecord[];
  onMarkRead: (id: string) => void;
};

export function PushNotificationInbox({ items, onMarkRead }: Props) {
  const pushItems = items.filter((n) => n.channel === "push");
  const kpis = computeNotificationKpis(pushItems);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-bl from-primary/8 via-card to-card p-4">
        <div className="flex flex-wrap items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl gradient-brand text-white shadow-glow">
            <Smartphone className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold">صندوق Push</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              إشعارات الدفع للمتصفح والجوال — حالة التسليم والقراءة
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="إجمالي Push" value={String(kpis.total)} icon={Radio} tone="primary" />
        <KpiCard label="غير مقروءة" value={String(kpis.pushUnread)} icon={Clock} tone="warning" />
        <KpiCard label="تم التسليم" value={String(pushItems.filter((n) => n.push_status === "delivered").length)} icon={CheckCircle2} tone="success" />
        <KpiCard label="فشل الإرسال" value={String(kpis.pushFailed)} icon={XCircle} tone="info" />
      </div>

      {pushItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center text-muted-foreground">
          <Smartphone className="mx-auto mb-3 h-10 w-10 opacity-40" />
          <p className="font-medium">لا توجد إشعارات Push</p>
        </div>
      ) : (
        <div className="space-y-2">
          {pushItems.map((item) => (
            <NotificationListItem key={item.notification_id} item={item} onMarkRead={onMarkRead} showPushMeta />
          ))}
        </div>
      )}
    </div>
  );
}

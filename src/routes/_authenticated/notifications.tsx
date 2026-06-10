import { useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { NotificationListItem } from "@/components/admin/NotificationListItem";
import { NotificationPreferencesPanel } from "@/components/admin/NotificationPreferencesPanel";
import { PushNotificationInbox } from "@/components/admin/PushNotificationInbox";
import { KpiCard } from "@/components/dashboard/KpiCard";
import {
  computeNotificationKpis,
  deleteReadNotifications,
  fetchNotificationPreferences,
  fetchNotifications,
  filterNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  saveNotificationPreferences,
} from "@/lib/admin/notifications-api";
import type { NotificationPreferencesState, NotificationRecord } from "@/lib/admin/notifications-types";
import { NOTIFICATION_TYPE_OPTIONS } from "@/lib/admin/notifications-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  BellOff,
  CheckCheck,
  Loader2,
  Package,
  Search,
  Settings2,
  ShieldCheck,
  Smartphone,
  Trash2,
  Wallet,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/notifications")({
  component: NotificationsPage,
});

function NotificationsPage() {
  const [items, setItems] = useState<NotificationRecord[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferencesState | null>(null);
  const [loading, setLoading] = useState(true);
  const [prefsLoading, setPrefsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [readTab, setReadTab] = useState<"all" | "unread" | "read">("all");
  const [mainTab, setMainTab] = useState("inbox");

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchNotifications();
      if (!response.isSuccess) throw new Error(response.message);
      setItems(response.data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل تحميل الإشعارات");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPreferences = useCallback(async () => {
    setPrefsLoading(true);
    try {
      const response = await fetchNotificationPreferences();
      if (!response.isSuccess) throw new Error(response.message);
      setPreferences(response.data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل تحميل التفضيلات");
    } finally {
      setPrefsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadNotifications();
    void loadPreferences();
  }, [loadNotifications, loadPreferences]);

  const filtered = useMemo(
    () =>
      filterNotifications(items, {
        readTab,
        typeFilter,
        search,
      }),
    [items, readTab, typeFilter, search],
  );

  const kpis = useMemo(() => computeNotificationKpis(items), [items]);

  const handleMarkRead = async (id: string) => {
    try {
      const response = await markNotificationRead(id);
      if (!response.isSuccess) throw new Error(response.message);
      setItems((list) =>
        list.map((n) => (n.notification_id === id ? { ...n, is_read: 1, read_at: response.data.read_at } : n)),
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل التحديث");
    }
  };

  const handleMarkAllRead = async () => {
    if (kpis.unread === 0) return;
    setSaving(true);
    try {
      const response = await markAllNotificationsRead();
      toast.success(response.message);
      await loadNotifications();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل تعليم الكل");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRead = async () => {
    setSaving(true);
    try {
      const response = await deleteReadNotifications();
      toast.success(response.message);
      await loadNotifications();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل الحذف");
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = async (prefs: NotificationPreferencesState) => {
    setSaving(true);
    try {
      const response = await saveNotificationPreferences(prefs);
      if (!response.isSuccess) throw new Error(response.message);
      toast.success(response.message);
      setPreferences(response.data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل حفظ التفضيلات");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <AdminPageHeader
        title="الإشعارات"
        tableName="notifications"
        description="صندوق الوارد، Push، وتفضيلات التنبيهات — شحنات، تحصيلات، موافقات، وتسويات"
        addLabel="إرسال إشعار"
        showAdd={false}
        onAdd={() => toast.message("إرسال إشعار يدوي — واجهة تصميمية")}
        extra={
          mainTab !== "preferences" ? (
            <>
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={handleMarkAllRead}
                disabled={kpis.unread === 0 || saving}
              >
                {saving ? <Loader2 className="ms-2 h-4 w-4 animate-spin" /> : <CheckCheck className="ms-2 h-4 w-4" />}
                تعليم الكل كمقروء
              </Button>
              <Button
                variant="outline"
                className="rounded-xl text-destructive hover:bg-destructive/10"
                onClick={handleDeleteRead}
                disabled={saving}
              >
                <Trash2 className="ms-2 h-4 w-4" />
                حذف المقروءة
              </Button>
            </>
          ) : undefined
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard label="غير مقروءة" value={String(kpis.unread)} icon={Bell} tone="warning" />
        <KpiCard label="Push" value={String(kpis.push)} icon={Smartphone} tone="primary" />
        <KpiCard label="شحنات" value={String(kpis.byType(1))} icon={Package} tone="info" />
        <KpiCard label="تحصيلات" value={String(kpis.byType(3))} icon={Wallet} tone="success" />
        <KpiCard label="موافقات" value={String(kpis.byType(4))} icon={ShieldCheck} tone="info" />
      </div>

      <Tabs value={mainTab} onValueChange={setMainTab} dir="rtl" className="rounded-2xl border border-border bg-card shadow-soft">
        <div className="border-b border-border p-4 pb-0">
          <TabsList className="mb-0 h-10 w-full justify-start rounded-xl bg-muted/50 p-1 sm:w-auto">
            <TabsTrigger value="inbox" className="rounded-lg px-4">
              <Bell className="ms-1.5 h-3.5 w-3.5" />
              صندوق الوارد
            </TabsTrigger>
            <TabsTrigger value="push" className="rounded-lg px-4">
              <Smartphone className="ms-1.5 h-3.5 w-3.5" />
              Push ({kpis.pushUnread})
            </TabsTrigger>
            <TabsTrigger value="preferences" className="rounded-lg px-4">
              <Settings2 className="ms-1.5 h-3.5 w-3.5" />
              التفضيلات
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="inbox" className="mt-0 p-4">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="relative min-w-[200px] flex-1">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="بحث في الإشعارات..."
                className="rounded-xl pr-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[160px] rounded-xl">
                <SelectValue placeholder="النوع" />
              </SelectTrigger>
              <SelectContent dir="rtl">
                <SelectItem value="all">كل الأنواع</SelectItem>
                {NOTIFICATION_TYPE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Tabs value={readTab} onValueChange={(v) => setReadTab(v as typeof readTab)} dir="rtl">
            <TabsList className="mb-4 h-10 w-full justify-start rounded-xl bg-muted/50 p-1 sm:w-auto">
              <TabsTrigger value="all" className="rounded-lg px-4">
                الكل ({items.length})
              </TabsTrigger>
              <TabsTrigger value="unread" className="rounded-lg px-4">
                غير مقروءة ({kpis.unread})
              </TabsTrigger>
              <TabsTrigger value="read" className="rounded-lg px-4">
                مقروءة ({items.length - kpis.unread})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={readTab} className="mt-0 space-y-2">
              {loading ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <BellOff className="mb-3 h-12 w-12 opacity-40" />
                  <p className="font-medium">لا توجد إشعارات</p>
                </div>
              ) : (
                filtered.map((item) => (
                  <NotificationListItem key={item.notification_id} item={item} onMarkRead={handleMarkRead} />
                ))
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="push" className="mt-0 p-4">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <PushNotificationInbox items={items} onMarkRead={handleMarkRead} />
          )}
        </TabsContent>

        <TabsContent value="preferences" className="mt-0 p-4">
          <NotificationPreferencesPanel
            preferences={preferences}
            onSave={handleSavePreferences}
            loading={prefsLoading}
            saving={saving}
          />
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
